import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, Wallet, Coins, Calendar, FileText, Activity, TrendingUp } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { Project, formatDZD, getContractDates } from "@/lib/projects";
import { getProjectPurchases } from "@/lib/project-stats.functions";

export function ProjectDashboard({ project, onInvest }: { project: Project; onInvest: () => void }) {
  const fetchStats = useServerFn(getProjectPurchases);
  const { data } = useQuery({
    queryKey: ["project-purchases", project.id],
    queryFn: () => fetchStats({ data: { projectId: project.id } }),
  });

  const totalAmount = data?.totalAmount ?? 0;
  const fundedPct = Math.min(100, (totalAmount / project.capital) * 100);
  const remaining = Math.max(0, project.capital - totalAmount);
  const investors = data?.totalInvestors ?? 0;
  const { end } = getContractDates(project);
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000));
  const contractType = project.category === "عام" ? "ملكية بالحصص" : "مشاركة في رأس المال";

  // Build chart series from recent purchases (cumulative funding by day)
  const series = useMemo(() => {
    const list = [...(data?.recent ?? [])].reverse();
    let cum = 0;
    let inv = 0;
    const seen = new Set<string>();
    return list.map((r) => {
      cum += Number(r.total_amount);
      if (!seen.has(r.id)) { inv += 1; seen.add(r.id); }
      return {
        date: new Date(r.created_at).toLocaleDateString("ar-DZ", { day: "2-digit", month: "2-digit" }),
        funding: cum,
        investors: inv,
      };
    });
  }, [data]);

  const cards = [
    { icon: TrendingUp, label: "نسبة التمويل", value: <><AnimatedNumber value={fundedPct} decimals={1} duration={1.5} />%</>, color: "text-emerald-500" },
    { icon: Wallet, label: "المبلغ المجموع", value: <AnimatedNumber value={totalAmount} suffix=" دج" />, color: "text-gold" },
    { icon: Coins, label: "المبلغ المتبقي", value: <AnimatedNumber value={remaining} suffix=" دج" />, color: "text-primary" },
    { icon: Users, label: "عدد المستثمرين", value: <AnimatedNumber value={investors} />, color: "text-sky-500" },
    { icon: Calendar, label: "الأيام المتبقية", value: <AnimatedNumber value={daysRemaining} suffix=" يوماً" />, color: "text-orange-500" },
    { icon: FileText, label: "نوع العقد", value: <span className="text-base">{contractType}</span>, color: "text-violet-500" },
    { icon: Activity, label: "حالة المشروع", value: <span className="text-base">{project.status}</span>, color: "text-emerald-500" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft animate-fade-in">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">لوحة تحكم المشروع</h2>
          <p className="text-xs text-muted-foreground">إحصائيات حية لتطور التمويل والمستثمرين.</p>
        </div>
        <button
          onClick={onInvest}
          className="group relative overflow-hidden rounded-xl bg-gradient-gold px-5 py-2.5 font-bold text-gold-foreground shadow-gold transition hover:scale-105 active:scale-95"
        >
          <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative">استثمر الآن</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-xl border border-border bg-background/60 p-4 transition hover:scale-[1.03] hover:shadow-soft animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Icon className={`h-4 w-4 ${c.color}`} />
              <div className="mt-1 text-[11px] text-muted-foreground">{c.label}</div>
              <div className="mt-0.5 font-display text-lg font-bold text-foreground">{c.value}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted-foreground">تقدم التمويل</span>
          <span className="font-bold text-primary">
            <AnimatedNumber value={fundedPct} decimals={1} />% مكتمل
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary via-gold to-primary transition-all duration-1000 ease-out"
            style={{ width: `${fundedPct}%` }}
          />
        </div>
      </div>

      <div className="mt-6 h-56 w-full">
        {series.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            لا توجد بيانات استثمار بعد — كن أول مستثمر في هذا المشروع.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fundColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                formatter={(v: number, name) => [name === "funding" ? formatDZD(v) : v, name === "funding" ? "التمويل" : "المستثمرون"]}
              />
              <Area type="monotone" dataKey="funding" stroke="hsl(var(--primary))" fill="url(#fundColor)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
