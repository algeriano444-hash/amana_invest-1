import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProjectPurchases } from "@/lib/project-stats.functions";
import { formatDZD } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Coins, Wallet } from "lucide-react";

type StatusFilter = "all" | "confirmed" | "pending" | "cancelled";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "confirmed", label: "مؤكَّد" },
  { key: "pending", label: "قيد المراجعة" },
  { key: "cancelled", label: "ملغى" },
];

export function ProjectPurchaseList({ projectId }: { projectId: string }) {
  const fetchStats = useServerFn(getProjectPurchases);
  const { data, isLoading } = useQuery({
    queryKey: ["project-purchases", projectId],
    queryFn: () => fetchStats({ data: { projectId } }),
  });

  const [filter, setFilter] = useState<StatusFilter>("all");

  const statusLabel = (s: string) =>
    s === "confirmed" ? "مؤكَّد" : s === "pending" ? "قيد المراجعة" : "ملغى";

  const filtered = useMemo(
    () => (data?.recent ?? []).filter((r) => filter === "all" || r.status === filter),
    [data, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data?.recent.length ?? 0, confirmed: 0, pending: 0, cancelled: 0 };
    (data?.recent ?? []).forEach((r) => { c[r.status] = (c[r.status] ?? 0) + 1; });
    return c;
  }, [data]);

  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">قائمة طلبات الشراء</h2>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted p-4 text-center">
          <Users className="mx-auto h-4 w-4 text-primary" />
          <div className="mt-1 text-xs text-muted-foreground">مستثمرون</div>
          <div className="font-display text-xl font-bold">{data?.totalInvestors ?? 0}</div>
        </div>
        <div className="rounded-xl bg-muted p-4 text-center">
          <Coins className="mx-auto h-4 w-4 text-gold" />
          <div className="mt-1 text-xs text-muted-foreground">حصص مُكتتبة</div>
          <div className="font-display text-xl font-bold">{data?.totalShares ?? 0}</div>
        </div>
        <div className="rounded-xl bg-muted p-4 text-center">
          <Wallet className="mx-auto h-4 w-4 text-primary" />
          <div className="mt-1 text-xs text-muted-foreground">إجمالي المبالغ</div>
          <div className="font-display text-sm font-bold">{formatDZD(data?.totalAmount ?? 0)}</div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            type="button"
            variant={filter === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className="rounded-full"
          >
            {f.label}
            <span className="ms-2 rounded-full bg-background/30 px-2 text-xs">
              {counts[f.key] ?? 0}
            </span>
          </Button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            لا توجد طلبات شراء مطابقة لهذا الفلتر.
          </p>
        )}
        {filtered.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {r.buyer.slice(0, 1)}
              </div>
              <div>
                <div className="text-sm font-semibold">{r.buyer}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("ar-DZ")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{r.shares} حصة</Badge>
              <span className="font-display text-sm font-bold text-primary">
                {formatDZD(r.total_amount)}
              </span>
              <Badge variant={r.status === "confirmed" ? "default" : "secondary"}>
                {statusLabel(r.status)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
