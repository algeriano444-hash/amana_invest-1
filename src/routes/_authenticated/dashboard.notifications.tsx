import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/notifications")({
  head: () => ({ meta: [{ title: "الإشعارات — Amana" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications", user?.id] });
  };

  return (
    <div className="container mx-auto max-w-3xl p-6 md:p-10">
      <h1 className="font-display text-3xl font-bold">الإشعارات</h1>

      <div className="mt-8 space-y-3">
        {(data?.length ?? 0) === 0 && <p className="text-muted-foreground">لا توجد إشعارات.</p>}
        {data?.map((n) => (
          <div key={n.id} className={`rounded-2xl border p-5 shadow-soft ${n.read ? "border-border bg-card" : "border-gold/30 bg-gold/5"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-bold">{n.title}</div>
                {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                <div className="mt-2 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("ar-DZ")}</div>
              </div>
              {!n.read && (
                <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>تمّ القراءة</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
