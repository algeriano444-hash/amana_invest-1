import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDZD } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/investments")({
  head: () => ({ meta: [{ title: "استثماراتي — Amana" }] }),
  component: InvestmentsPage,
});

function InvestmentsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["investments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("investments").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="container mx-auto max-w-5xl p-6 md:p-10">
      <h1 className="font-display text-3xl font-bold">استثماراتي</h1>
      <p className="mt-1 text-muted-foreground">جميع الحصص التي اشتريتها في المشاريع.</p>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-muted-foreground">جارٍ التحميل...</p>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">لم تستثمر في أي مشروع بعد.</p>
            <Button asChild className="mt-4 bg-gradient-hero"><Link to="/projects">تصفّح المشاريع</Link></Button>
          </div>
        )}
        {data?.map((inv) => (
          <div key={inv.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
            <div>
              <h3 className="font-display text-lg font-bold">{inv.project_name}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{inv.shares} حصة</span>
                <span>•</span>
                <span>{formatDZD(Number(inv.share_price))} للحصة</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={inv.status === "confirmed" ? "default" : "outline"}>
                {inv.status === "confirmed" ? "مؤكَّد" : inv.status === "pending" ? "قيد المراجعة" : "ملغى"}
              </Badge>
              <div className="font-display text-xl font-bold text-primary">{formatDZD(Number(inv.total_amount))}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
