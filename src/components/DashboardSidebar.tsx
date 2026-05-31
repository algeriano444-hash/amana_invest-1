import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Briefcase, FileText, Bell, BarChart3, ShieldCheck, LogOut, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { to: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { to: "/dashboard/top-projects", label: "أحسن المشاريع", icon: Trophy },
  { to: "/dashboard/investments", label: "استثماراتي", icon: Briefcase },
  { to: "/dashboard/contracts", label: "العقود", icon: FileText },
  { to: "/dashboard/notifications", label: "الإشعارات", icon: Bell },
  { to: "/dashboard/reports", label: "التقارير", icon: BarChart3 },
  { to: "/dashboard/verification", label: "توثيق الهوية", icon: ShieldCheck },
] as const;

export function DashboardSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <aside className="hidden w-64 shrink-0 border-l border-border bg-card lg:block">
      <div className="sticky top-0 flex h-screen flex-col p-4">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
            <span className="font-display text-lg font-bold text-primary-foreground">A</span>
          </div>
          <div className="font-display text-base font-bold">Amana</div>
        </Link>

        <nav className="flex-1 space-y-1">
          {items.map((it) => {
            const active = path === it.to;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/75 hover:bg-accent hover:text-foreground"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
