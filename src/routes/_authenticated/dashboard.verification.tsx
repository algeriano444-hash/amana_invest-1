import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, Clock, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/verification")({
  head: () => ({ meta: [{ title: "توثيق الهوية — Amana" }] }),
  component: VerificationPage,
});

const schema = z.object({
  id_card_number: z.string().trim().min(4, "رقم البطاقة قصير").max(40),
  id_card_url: z.string().trim().url("رابط غير صالح").max(500),
  selfie_url: z.string().trim().url("رابط غير صالح").max(500),
  project_doc_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
});

function VerificationPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: existing } = useQuery({
    queryKey: ["verification", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("identity_verifications").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({ id_card_number: "", id_card_url: "", selfie_url: "", project_doc_url: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setLoading(true);
    const payload = { ...parsed.data, user_id: user!.id, status: "pending" as const, project_doc_url: parsed.data.project_doc_url || null };
    const { error } = await supabase.from("identity_verifications").upsert(payload, { onConflict: "user_id" });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("تم إرسال طلب التوثيق. سنراجعه قريباً.");
    qc.invalidateQueries({ queryKey: ["verification", user?.id] });
  };

  if (existing) {
    const map = {
      pending: { Icon: Clock, label: "قيد المراجعة", color: "bg-gold/15 text-gold-foreground border-gold/30" },
      approved: { Icon: ShieldCheck, label: "موثَّق", color: "bg-primary/10 text-primary border-primary/30" },
      rejected: { Icon: XCircle, label: "مرفوض", color: "bg-destructive/10 text-destructive border-destructive/30" },
    } as const;
    const s = map[existing.status];
    return (
      <div className="container mx-auto max-w-2xl p-6 md:p-10">
        <h1 className="font-display text-3xl font-bold">توثيق الهوية</h1>
        <div className={`mt-6 rounded-2xl border p-6 shadow-soft ${s.color}`}>
          <s.Icon className="h-8 w-8" />
          <div className="mt-3 font-display text-2xl font-bold">{s.label}</div>
          <p className="mt-2 text-sm">
            {existing.status === "pending" && "طلبك قيد المراجعة من فريقنا. سنخبرك بالنتيجة قريباً."}
            {existing.status === "approved" && "تم توثيق هويتك بنجاح. يمكنك الآن الاستثمار بشكل كامل."}
            {existing.status === "rejected" && "تم رفض طلبك. أعد إرسال الوثائق بصور أوضح."}
          </p>
          {existing.notes && <p className="mt-3 rounded-lg bg-background/50 p-3 text-xs">ملاحظة: {existing.notes}</p>}
        </div>

        {existing.status === "rejected" && (
          <Button className="mt-6 bg-gradient-hero" onClick={async () => {
            await supabase.from("identity_verifications").delete().eq("user_id", user!.id);
            qc.invalidateQueries({ queryKey: ["verification", user?.id] });
          }}>
            إعادة الإرسال
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6 md:p-10">
      <h1 className="font-display text-3xl font-bold">توثيق الهوية</h1>
      <p className="mt-1 text-muted-foreground">أكمل توثيق هويتك للاستفادة الكاملة من المنصة.</p>

      <form className="mt-8 space-y-4 rounded-2xl border border-border bg-gradient-card p-6 shadow-soft" onSubmit={submit}>
        <div>
          <Label htmlFor="idn">رقم بطاقة الهوية</Label>
          <Input id="idn" dir="ltr" value={form.id_card_number} onChange={(e) => setForm({ ...form, id_card_number: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="idu">رابط صورة بطاقة الهوية</Label>
          <Input id="idu" dir="ltr" placeholder="https://..." value={form.id_card_url} onChange={(e) => setForm({ ...form, id_card_url: e.target.value })} />
          <p className="mt-1 text-xs text-muted-foreground">ارفع الصورة على خدمة استضافة الصور وضع الرابط هنا.</p>
        </div>
        <div>
          <Label htmlFor="selfie">رابط الصورة الشخصية</Label>
          <Input id="selfie" dir="ltr" placeholder="https://..." value={form.selfie_url} onChange={(e) => setForm({ ...form, selfie_url: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="proj">رابط وثائق المشروع (لأصحاب المشاريع — اختياري)</Label>
          <Input id="proj" dir="ltr" placeholder="https://..." value={form.project_doc_url} onChange={(e) => setForm({ ...form, project_doc_url: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="notes">ملاحظات (اختياري)</Label>
          <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-gradient-hero shadow-soft">
          {loading ? "جارٍ الإرسال..." : "إرسال طلب التوثيق"}
        </Button>
      </form>

      <Badge variant="outline" className="mt-4">ملاحظة: يدعم النظام رفع الملفات المباشر في النسخة القادمة.</Badge>
    </div>
  );
}
