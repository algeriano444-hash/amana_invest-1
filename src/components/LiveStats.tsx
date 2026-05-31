import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Wallet, Rocket } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { getPlatformStats } from "@/lib/platform-stats.functions";
import { projects, formatDZD } from "@/lib/projects";

export function LiveStats() {
  const fetchStats = useServerFn(getPlatformStats);
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => fetchStats(),
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    const ch = supabase
      .channel("public-stats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "investments" },
        (payload) => {
          const row = payload.new as { project_id: string; total_amount: number };
          const p = projects.find((x) => x.id === row.project_id);
          toast.success(`تم استثمار ${formatDZD(Number(row.total_amount))} في ${p?.name ?? "مشروع"}`, {
            duration: 6000,
          });
          qc.invalidateQueries({ queryKey: ["platform-stats"] });
          qc.invalidateQueries({ queryKey: ["project-purchases", row.project_id] });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        () => qc.invalidateQueries({ queryKey: ["platform-stats"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  const totalInvestors = data?.activeInvestors ?? 0;
  const totalAmount = data?.totalAmount ?? 0;
  const fundedCount = projects.filter(
    (p) => (data?.perProject[p.id]?.amount ?? 0) >= p.capital,
  ).length;

  const items = [
    { icon: Users, label: "مستثمر نشط", value: totalInvestors, color: "text-emerald-300" },
    { icon: Wallet, label: "دج تم استثمارها", value: totalAmount, color: "text-gold", separator: "," },
    { icon: Rocket, label: "مشروع ممول بالكامل", value: fundedCount, color: "text-sky-300" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-xl transition hover:scale-[1.02] hover:bg-white/15 animate-fade-in"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-gold/30 blur-3xl opacity-50 group-hover:opacity-80 transition" />
            <Icon className={`mx-auto h-7 w-7 ${s.color}`} />
            <div className={`mt-3 font-display text-4xl font-bold ${s.color} drop-shadow-[0_0_18px_rgba(241,196,82,0.35)]`}>
              <AnimatedNumber value={s.value} duration={2} separator="," />
            </div>
            <div className="mt-1 text-sm text-primary-foreground/85">{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}
