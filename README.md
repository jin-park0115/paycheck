# PayCheck

알바(파트타임) 근무 기록과 급여를 추적하는 웹앱.
날짜·시작시간·종료시간을 입력하면 일당을 자동 계산하고, 월별로 누적해 다음 급여일을 알려줍니다.

**배포 주소:** https://paycheck-rouge.vercel.app

---

## 기술 스택

| 분류 | 기술 |
|---|---|
| 프레임워크 | Vite + React 19 + TypeScript |
| 스타일 | Tailwind CSS v4 + shadcn/ui (New York) |
| 라우팅 | React Router v7 |
| 서버 상태 | @tanstack/react-query v5 |
| 클라이언트 상태 | Zustand v5 (persist) |
| 백엔드 / DB | Supabase (Auth + PostgreSQL + RLS) |
| 폼 검증 | react-hook-form v7 + zod v4 |
| 날짜 처리 | date-fns v4 (한국어 로케일) |
| 토스트 알림 | sonner |
| 배포 | Vercel (GitHub 연동) |

---

## 주요 기능

- 근무 기록 추가 / 수정 / 삭제 (날짜, 시작·종료 시간, 메모)
- 입력 시 일당 실시간 미리보기
- 월별 달력 뷰 — 근무일에 일당 배지 표시
- 월별 근무 목록 (최신순)
- **주휴수당** 자동 계산 (주 15시간 이상 시 적용)
- **세금 공제** 선택 — 없음 / 3.3% 원천징수 / 4대보험
- 급여 사이클: M월 근무 → M+1월 지급일 자동 표시
- Google OAuth + 이메일/비밀번호 로그인
- 설정: 시급, 지급일, 주휴수당 여부, 세금 유형

---

## 로컬 개발 환경 설정

### 1. 저장소 클론 및 패키지 설치

```bash
git clone https://github.com/your-username/paycheck.git
cd paycheck
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성합니다.

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Supabase 대시보드 → **Project Settings → API** 에서 확인할 수 있습니다.

### 3. Supabase 데이터베이스 마이그레이션

Supabase 대시보드 → **SQL Editor** 에서 아래 파일을 순서대로 실행합니다.

```
supabase/migrations/001_profiles.sql
supabase/migrations/002_work_logs.sql
```

### 4. 개발 서버 실행

```bash
npm run dev
# http://localhost:5173
```

---

## Supabase Google OAuth 설정

### 1. Google Cloud Console에서 OAuth 클라이언트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID** 클릭
3. Application type: **Web application** 선택
4. **Authorized redirect URIs** 에 아래 주소 추가:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   (`<your-project-ref>`는 Supabase URL의 서브도메인 부분)
5. **Client ID** 와 **Client Secret** 복사해두기

### 2. Supabase에서 Google Provider 활성화

1. Supabase 대시보드 → **Authentication → Providers → Google**
2. **Enable Sign in with Google** 토글 ON
3. 위에서 복사한 **Client ID** 와 **Client Secret** 입력 후 저장

### 3. Redirect URL 설정

1. Supabase 대시보드 → **Authentication → URL Configuration**
2. **Site URL** 설정 (배포된 주소):
   ```
   https://paycheck-rouge.vercel.app
   ```
3. **Redirect URLs** 에 아래 두 줄 추가:
   ```
   http://localhost:5173/**
   https://paycheck-rouge.vercel.app/**
   ```
   `/**` 와일드카드가 있어야 OAuth 콜백 후 리다이렉트가 정상 작동합니다.

---

## 데이터베이스 스키마

### profiles (사용자 설정)

```sql
create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  hourly_wage        numeric(10,2) not null default 10320,
  pay_day            smallint not null default 20,
  weekly_holiday_pay boolean not null default false,
  tax_type           text not null default 'none',  -- 'none' | '3.3' | 'insurance'
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
```

신규 가입 시 트리거(`on_auth_user_created`)로 자동 생성됩니다.

### work_logs (근무 기록)

```sql
create table public.work_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  work_date    date not null,
  start_time   time not null,
  end_time     time not null,
  hours_worked numeric(5,2) generated always as (
    extract(epoch from (end_time - start_time)) / 3600.0
  ) stored,
  memo         text,
  constraint end_after_start check (end_time > start_time),
  constraint no_duplicate unique (user_id, work_date, start_time)
);
```

`hours_worked`는 DB에서 자동 계산되는 Generated Column입니다.

---

## 트러블슈팅

### Vercel 배포 후 `/login` 직접 접근 시 404

React Router는 클라이언트 사이드 라우팅이라 Vercel이 해당 경로의 파일을 찾지 못합니다.

**해결:** 프로젝트 루트에 `vercel.json` 추가

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

### Vercel 빌드 에러: `Cannot find module '@/components/...'`

원인이 두 가지입니다.

**원인 1:** `build` 스크립트에 `tsc -b`가 포함되어 타입 검사 에러가 빌드를 막음

```json
// package.json — tsc 제거, vite build만 사용
"scripts": {
  "build": "vite build",
  "typecheck": "tsc -b"
}
```

**원인 2:** `.gitignore`에 소스 폴더명이 포함되어 GitHub에 파일이 올라가지 않음

```bash
# .gitignore에 'logs' 한 줄이 src/components/logs/ 전체를 무시했던 사례
git rm -r --cached src/components/logs/
git add src/components/logs/
git commit -m "fix: logs 폴더 gitignore 제거"
```

---

### 설정 저장 시 새 필드(주휴수당/세금)가 반영 안 됨

`useUpdateProfile`의 mutationFn 타입이 좁게 정의되어 새 필드가 드롭됩니다.

```ts
// 변경 전 — 새 필드 누락
mutationFn: (updates: { hourly_wage?: number; pay_day?: number }) => ...

// 변경 후
mutationFn: (updates: Partial<Omit<Profile, 'id'>>) => upsertProfile(userId!, updates)
```

---

### 폼 입력 중 값이 초기화됨

`useEffect` deps에 `reset` 함수 참조가 포함되면 매 렌더마다 effect가 재실행됩니다.

```ts
// 변경 전 — reset이 매 렌더마다 새 참조로 생성되어 effect 재실행
useEffect(() => { reset({...}) }, [open, reset, today, initialDate])

// 변경 후 — open 전환 시에만 초기화
useEffect(() => {
  if (!open) return
  reset({...})
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [open])
```

---

### 모바일에서 다이얼로그 버튼 순서가 뒤집힘

shadcn `DialogFooter`가 모바일에서 `flex-col-reverse`를 사용해 취소/저장 순서가 역전됩니다.

```tsx
// DialogFooter 제거, 일반 div 사용
<div className="flex gap-2 pt-1">
  <Button variant="outline" className="flex-1" onClick={onClose}>취소</Button>
  <Button type="submit" className="flex-1">저장</Button>
</div>
```

---

### iOS에서 시간 입력 필드가 겹쳐 보임

`<input type="time">`이 iOS에서 "오후 4:54" 형태로 렌더링되어 2열 그리드에서 넘칩니다.

```tsx
// min-w-0으로 그리드 셀 오버플로우 방지, text-sm으로 크기 축소
<div className="grid grid-cols-2 gap-x-3 gap-y-2">
  <div className="space-y-1 min-w-0">
    <Input type="time" className="w-full text-sm" {...register('start_time')} />
  </div>
</div>
```
