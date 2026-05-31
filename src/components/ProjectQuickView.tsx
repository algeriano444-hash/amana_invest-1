import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Project, formatDZD, getContractDates, formatArabicDate, toISODate, getProjectInfo, projectCategoryToOwnerKey,
} from "@/lib/projects";
import { getProjectOwnerDocuments } from "@/lib/project-documents.functions";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, FileSpreadsheet, Scale, Cog } from "lucide-react";

const docIcon = (t: string) =>
  t === "محاسبي" ? FileSpreadsheet : t === "قانوني" ? Scale : t === "تقني" ? Cog : FileText;

export function ProjectQuickView({
  project, open, onOpenChange,
}: { project: Project; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"info" | "buy" | "confirm">("info");
  const [shares, setShares] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const remaining = project.shares - project.sold;
  const total = shares * project.sharePrice;
  const progress = (project.sold / project.shares) * 100;
  const { start, end, months } = getContractDates(project);
  const info = getProjectInfo(project);
  const contractType = project.category === "عام" ? "shares_ownership" : "musharaka";
  const fetchOwnerDocs = useServerFn(getProjectOwnerDocuments);
  const { data: ownerDocsData } = useQuery({
    queryKey: ["project-owner-docs", projectCategoryToOwnerKey(project.category)],
    queryFn: () => fetchOwnerDocs({ data: { category: projectCategoryToOwnerKey(project.category) } }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });
  const ownerDocs = ownerDocsData?.docs ?? {};

  const goBuy = () => {
    if (!user) {
      toast.info("سجّل الدخول للاستثمار");
      navigate({ to: "/signup" });
      return;
    }
    setStep("buy");
  };

  const goConfirm = () => {
    if (shares < 1 || shares > remaining) return toast.error("عدد الحصص غير صالح");
    setStep("confirm");
  };

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    const { data: inv, error } = await supabase.from("investments").insert({
      user_id: user.id, project_id: project.id, project_name: project.name,
      shares, share_price: project.sharePrice, total_amount: total, status: "pending",
    }).select().single();
    if (error || !inv) { setSubmitting(false); return toast.error(error?.message ?? "فشل الإرسال"); }
    const content = `عقد ${contractType === "musharaka" ? "مشاركة في رأس المال" : "ملكية بالحصص"}\n\nالمشروع: ${project.name}\nعدد الحصص المشتراة: ${shares}\nقيمة الحصة: ${formatDZD(project.sharePrice)}\nالمبلغ الإجمالي: ${formatDZD(total)}\nبدء العقد: ${formatArabicDate(start)}\nالنهاية المتوقعة: ${formatArabicDate(end)}\nمدة العقد: ${months} شهراً`;
    await supabase.from("contracts").insert({
      user_id: user.id, investment_id: inv.id, contract_type: contractType,
      project_name: project.name, content,
      start_date: toISODate(start), end_date: toISODate(end), duration_months: months,
    });
    await supabase.from("notifications").insert({
      user_id: user.id, title: "تم تسجيل طلب استثمار جديد",
      body: `${shares} حصة في ${project.name} — ${formatDZD(total)}`,
    });
    setSubmitting(false);
    onOpenChange(false);
    toast.success("تم تسجيل طلب الاستثمار وإنشاء العقد");
    navigate({ to: "/dashboard/investments" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!submitting) { onOpenChange(o); if (!o) setStep("info"); } }}>
      <DialogContent dir="rtl" className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{project.name}</DialogTitle>
          <DialogDescription>
            {step === "info" && "معلومات المشروع، الوثائق المحاسبية ودراسة الجدوى."}
            {step === "buy" && "اختر عدد الحصص التي ترغب في شرائها."}
            {step === "confirm" && "تأكيد المبلغ قبل إرسال طلب الشراء."}
          </DialogDescription>
        </DialogHeader>

        {step === "info" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-gold text-gold-foreground hover:bg-gold">{project.category}</Badge>
              <Badge variant="outline">{project.field}</Badge>
              {project.wilaya && <Badge variant="outline">{project.wilaya}</Badge>}
              <Badge variant="outline" className="border-primary/40 text-primary">{project.status}</Badge>
            </div>

            <p className="rounded-xl bg-muted/40 p-3 text-sm leading-loose text-foreground">{project.description}</p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { l: "رأس المال", v: formatDZD(project.capital) },
                { l: "قيمة الحصة", v: formatDZD(project.sharePrice) },
                { l: "إجمالي الحصص", v: project.shares.toLocaleString("ar-DZ") },
                { l: "الحصص المباعة", v: project.sold.toLocaleString("ar-DZ") },
                { l: "الحصص المتبقية", v: remaining.toLocaleString("ar-DZ") },
                { l: "مدة العقد", v: `${months} شهراً` },
              ].map((s) => (
                <div key={s.l} className="rounded-lg bg-muted p-2.5">
                  <div className="text-[11px] text-muted-foreground">{s.l}</div>
                  <div className="mt-0.5 text-sm font-semibold">{s.v}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">تقدم الاكتتاب</span><span className="font-semibold">{progress.toFixed(1)}%</span></div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="rounded-xl border border-border p-3">
              <div className="text-sm font-bold">دراسة الجدوى</div>
              <p className="mt-1 text-xs leading-loose text-muted-foreground">{info.study}</p>
              <ul className="mt-2 grid gap-1 text-xs text-foreground">
                {info.highlights.map((h) => <li key={h}>• {h}</li>)}
              </ul>
            </div>

            <div className="rounded-xl border border-border p-3">
              <div className="mb-2 text-sm font-bold">الوثائق المحاسبية وملفات المشروع</div>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {info.documents.map((d) => {
                  const Icon = docIcon(d.type);
                  const realUrl = d.key ? ownerDocs[d.key] : undefined;
                  const href = realUrl ?? d.url;
                  const hasReal = Boolean(realUrl);
                  return (
                    <li key={d.name}>
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-muted/40 p-2 text-xs transition hover:bg-muted hover:shadow-soft">
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <span className="flex-1 truncate">{d.name}</span>
                        {hasReal && <Badge className="bg-emerald-600 text-white text-[10px]">متاح</Badge>}
                        <Badge variant="outline" className="text-[10px]">{d.type}</Badge>
                      </a>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-[11px] text-muted-foreground">الوثائق الموسومة بـ«متاح» مرفوعة من صاحب المشروع. الباقي ملفات نموذجية إلى أن يرفعها المالك.</p>
            </div>
          </div>
        )}

        {step === "buy" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Stat l="قيمة الحصة" v={formatDZD(project.sharePrice)} />
              <Stat l="الحصص المتبقية" v={remaining.toLocaleString("ar-DZ")} />
              <Stat l="إجمالي الحصص" v={project.shares.toLocaleString("ar-DZ")} />
              <Stat l="مدة العقد" v={`${months} شهراً`} />
            </div>
            <div className="rounded-xl border border-border p-3">
              <label className="text-sm font-semibold">عدد الحصص المطلوبة</label>
              <div className="mt-2 flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setShares(Math.max(1, shares - 1))}>−</Button>
                <Input type="number" min={1} max={remaining} value={shares}
                  onChange={(e) => setShares(Math.max(1, Math.min(remaining, Number(e.target.value) || 1)))}
                  className="text-center font-bold" />
                <Button variant="outline" size="icon" onClick={() => setShares(Math.min(remaining, shares + 1))}>+</Button>
              </div>
              <div className="mt-3 rounded-lg bg-gradient-hero p-3 text-primary-foreground">
                <div className="text-xs opacity-80">المبلغ الإجمالي</div>
                <div className="font-display text-2xl font-bold">{formatDZD(total)}</div>
                <div className="text-xs opacity-80">عدد الحصص المشتراة: {shares.toLocaleString("ar-DZ")}</div>
              </div>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Stat l="عدد الحصص المشتراة" v={shares.toLocaleString("ar-DZ")} />
              <Stat l="قيمة الحصة" v={formatDZD(project.sharePrice)} />
              <Stat l="الصيغة" v={project.category === "عام" ? "ملكية بالحصص" : "مشاركة"} />
              <Stat l="مدة العقد" v={`${months} شهراً`} />
              <Stat l="بدء العقد" v={formatArabicDate(start)} />
              <Stat l="نهاية العقد" v={formatArabicDate(end)} />
            </div>
            <div className="rounded-xl bg-gradient-hero p-3 text-primary-foreground">
              <div className="text-xs opacity-80">المبلغ الإجمالي للتأكيد</div>
              <div className="font-display text-2xl font-bold">{formatDZD(total)}</div>
            </div>
            <p className="rounded-lg border-r-4 border-gold bg-gold/10 p-2 text-xs leading-loose">
              بتأكيدك، توافق على شروط العقد وتحمّل الأرباح/الخسائر بنسبة المساهمة.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "info" && (
            <>
              <Button asChild variant="outline"><Link to="/projects/$projectId" params={{ projectId: project.id }} onClick={() => onOpenChange(false)}>صفحة المشروع الكاملة</Link></Button>
              <Button onClick={goBuy} className="bg-gradient-gold text-gold-foreground shadow-gold">شراء الحصص</Button>
            </>
          )}
          {step === "buy" && (
            <>
              <Button variant="outline" onClick={() => setStep("info")}>رجوع</Button>
              <Button onClick={goConfirm} className="bg-gradient-gold text-gold-foreground shadow-gold">متابعة للتأكيد</Button>
            </>
          )}
          {step === "confirm" && (
            <>
              <Button variant="outline" onClick={() => setStep("buy")} disabled={submitting}>تعديل</Button>
              <Button onClick={submit} disabled={submitting} className="bg-gradient-gold text-gold-foreground shadow-gold">
                {submitting ? "جارٍ الحجز..." : "تأكيد الشراء"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-lg bg-muted p-2.5">
      <div className="text-[11px] text-muted-foreground">{l}</div>
      <div className="mt-0.5 text-sm font-semibold">{v}</div>
    </div>
  );
}
