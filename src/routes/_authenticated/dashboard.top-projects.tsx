import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTopProjects } from "@/lib/project-stats.functions";
import { projects, formatDZD } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, TrendingUp, Coins } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/top-projects")({
  head: () => ({ meta: [{ title: "أحسن المشاريع — Amana" }] }),
  component: TopProjectsPage,
});

function TopProjectsPage() {
  const fetchTop = useServerFn(getTopProjects);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["top-projects"],
    queryFn: () => fetchTop(),
  });

  const ranked = projects
    .map((p) => {
      const s = stats?.find((x) => x.project_id === p.id);
      const investors = s?.totalInvestors ?? 0;
      const shares = s?.totalShares ?? 0;
      const amount = s?.totalAmount ?? 0;
      const progress = (shares / p.shares) * 100;
      // Composite score: funding progress (60%) + popularity (40%)
      const score = progress * 0.6 + Math.min(investors * 10, 100) * 0.4;
      return { p, investors, shares, amount, progress, score };
    })
    .sort((a, b) => b.score - a.score);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="container mx-auto max-w-6xl p-6 md:p-10">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-gold" />
        <div>
          <h1 className="font-display text-3xl font-bold">أحسن المشاريع</h1>
          <p className="mt-1 text-muted-foreground">
            تصنيف المشاريع حسب نسبة الاكتتاب وعدد المستثمرين.
          </p>
        </div>
      </div>

      {isLoading && <p className="mt-8 text-muted-foreground">جارٍ التحميل...</p>}

      <div className="mt-8 space-y-3">
        {ranked.map((r, i) => (
          <Link
            key={r.p.id}
            to="/projects/$projectId"
            params={{ projectId: r.p.id }}
            className="block rounded-2xl border border-border bg-gradient-card p-5 shadow-soft transition hover:shadow-elegant"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-hero font-display text-xl font-bold text-primary-foreground">
                  {medals[i] ?? i + 1}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{r.p.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{r.p.category}</Badge>
                    {r.p.wilaya && <Badge variant="outline">{r.p.wilaya}</Badge>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> مستثمرون
                  </div>
                  <div className="mt-1 font-display text-lg font-bold">{r.investors}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Coins className="h-3 w-3" /> حصص
                  </div>
                  <div className="mt-1 font-display text-lg font-bold">{r.shares}</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" /> اكتتاب
                  </div>
                  <div className="mt-1 font-display text-lg font-bold text-primary">
                    {r.progress.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={r.progress} className="h-2" />
              <div className="mt-2 text-left text-xs text-muted-foreground">
                مجموع الاستثمارات: {formatDZD(r.amount)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
