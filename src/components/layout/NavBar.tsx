import { NavLink } from "react-router-dom";
import { LayoutDashboard, List, Settings, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "달력", icon: LayoutDashboard, end: true },
  { to: "/logs", label: "목록", icon: List, end: false },
  { to: "/settings", label: "설정", icon: Settings, end: false },
];

export default function NavBar() {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 h-14">
        <span className="font-bold text-base tracking-tight">PayCheck</span>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut size={15} />
          </button>
        </nav>
      </div>
    </header>
  );
}
