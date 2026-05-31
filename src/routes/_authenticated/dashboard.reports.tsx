import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDZD } from "@/lib/projects";

export const Route = createFileRoute("/_authenticated/dashboard/reports")({
  head: () => ({ meta: [{ title: "التقارير — Amana" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["reports", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("investments").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const investments = data ?? [];
  const total = investments.reduce((s, i) => s + Number(i.total_amount), 0);
  const confirmed = investments.filter((i) => i.status === "confirmed");
  const byProject = Object.values(
    investments.reduce<Record<string, { name: string; amount: number; shares: number }>>((acc, i) => {
      const k = i.project_id;
      if (!acc[k]) acc[k] = { name: i.project_name, amount: 0, shares: 0 };
      acc[k].amount += Number(i.total_amount);
      acc[k].shares += i.shares;
      return acc;
    }, {})
  );

  return (
    <div className="container mx-auto max-w-5xl p-6 md:p-10">
      <h1 className="font-display text-3xl font-bold">التقارير</h1>
      <p className="mt-1 text-muted-foreground">ملخص أداء استثماراتك.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="رأس المال المُستثمَر" v={formatDZD(total)} />
        <Stat label="عدد العمليات" v={String(investments.length)} />
        <Stat label="عمليات مؤكَّدة" v={String(confirmed.length)} />
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold">التوزيع حسب المشروع</h2>
        {byProject.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">لا توجد بيانات بعد.</p>
        ) : (
          <div className="mt-5 space-y-4">
            {byProject.map((p) => {
              const pct = total ? (p.amount / total) * 100 : 0;
              return (
                <div key={p.name}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="font-semibold">{formatDZD(p.amount)} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-hero" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold">{v}</div>
    </div>
  );
}
