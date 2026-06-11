-- work_logs: 근무 기록
create table public.work_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  work_date    date not null,
  start_time   time not null,
  end_time     time not null,
  -- DB에서 자동 계산 (저장됨) — 앱 계산과 불일치 방지
  hours_worked numeric(5,2) generated always as (
    extract(epoch from (end_time - start_time)) / 3600.0
  ) stored,
  memo         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint end_after_start check (end_time > start_time),
  constraint no_duplicate_session unique (user_id, work_date, start_time)
);

-- 월별 조회 최적화 인덱스
create index work_logs_user_month_idx
  on public.work_logs (user_id, work_date);

create trigger work_logs_updated_at
  before update on public.work_logs
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.work_logs enable row level security;

create policy "Users can view own logs"
  on public.work_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.work_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on public.work_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own logs"
  on public.work_logs for delete
  using (auth.uid() = user_id);
