import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDZD } from "@/lib/projects";
import { Briefcase, FileText, Bell, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "لوحة المستثمر — Amana" }, { name: "description", content: "نظرة عامة على استثماراتك في Amana." }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [profile, investments, contracts, notifications] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase.from("investments").select("*").eq("user_id", user!.id),
        supabase.from("contracts").select("*").eq("user_id", user!.id),
        supabase.from("notifications").select("*").eq("user_id", user!.id).eq("read", false),
      ]);
      return {
        profile: profile.data,
        investments: investments.data ?? [],
        contracts: contracts.data ?? [],
        unread: notifications.data ?? [],
      };
    },
  });

  const totalInvested = (data?.investments ?? []).reduce((s, i) => s + Number(i.total_amount), 0);
  const totalShares = (data?.investments ?? []).reduce((s, i) => s + i.shares, 0);

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <header>
        <h1 className="font-display text-3xl font-bold">مرحباً، {data?.profile?.full_name || "مستثمر"} 👋</h1>
        <p className="mt-1 text-muted-foreground">إليك نظرة سريعة على نشاطك في Amana.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي الاستثمارات" value={formatDZD(totalInvested)} icon={TrendingUp} />
        <StatCard label="عدد المشاريع" value={String(data?.investments.length ?? 0)} icon={Briefcase} />
        <StatCard label="مجموع الحصص" value={String(totalShares)} icon={FileText} />
        <StatCard label="إشعارات جديدة" value={String(data?.unread.length ?? 0)} icon={Bell} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">آخر استثماراتك</h2>
            <Link to="/dashboard/investments" className="text-xs font-semibold text-primary hover:underline">عرض الكل</Link>
          </div>
          {data?.investments.length === 0 ? (
            <Empty title="لم تقم بأي استثمار بعد" cta={{ to: "/projects", label: "تصفّح المشاريع" }} />
          ) : (
            <ul className="space-y-3">
              {data?.investments.slice(0, 4).map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-xl bg-muted p-3">
                  <div>
                    <div className="font-semibold">{i.project_name}</div>
                    <div className="text-xs text-muted-foreground">{i.shares} حصة</div>
                  </div>
                  <div className="font-display font-bold text-primary">{formatDZD(Number(i.total_amount))}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">إشعارات جديدة</h2>
            <Link to="/dashboard/notifications" className="text-xs font-semibold text-primary hover:underline">عرض الكل</Link>
          </div>
          {data?.unread.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد إشعارات جديدة.</p>
          ) : (
            <ul className="space-y-3">
              {data?.unread.slice(0, 4).map((n) => (
                <li key={n.id} className="rounded-xl border-r-4 border-gold bg-gold/5 p-3">
                  <div className="font-semibold">{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground">{n.body}</div>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function Empty({ title, cta }: { title: string; cta: { to: string; label: string } }) {
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      <Button asChild size="sm" className="mt-3 bg-gradient-hero shadow-soft">
        <Link to={cta.to as any}>{cta.label}</Link>
      </Button>
    </div>
  );
}
