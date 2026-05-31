import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard/contracts")({
  head: () => ({ meta: [{ title: "العقود — Amana" }] }),
  component: ContractsPage,
});

function ContractsPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["contracts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("contracts").select("*").eq("user_id", user!.id).order("signed_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="container mx-auto max-w-5xl p-6 md:p-10">
      <h1 className="font-display text-3xl font-bold">عقود الاستثمار</h1>
      <p className="mt-1 text-muted-foreground">العقود الموثّقة لاستثماراتك.</p>

      <div className="mt-8 space-y-4">
        {(data?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">لا توجد عقود بعد.</div>
        ) : (
          data?.map((c) => (
            <details key={c.id} className="rounded-2xl border border-border bg-gradient-card p-5 shadow-soft">
              <summary className="flex cursor-pointer items-center justify-between">
                <div>
                  <div className="font-display text-lg font-bold">{c.project_name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(c.signed_at).toLocaleDateString("ar-DZ")}
                  </div>
                </div>
                <Badge>{c.contract_type === "musharaka" ? "عقد مشاركة" : "عقد ملكية حصص"}</Badge>
              </summary>
              <pre dir="rtl" className="mt-4 whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm leading-loose text-foreground">{c.content}</pre>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
