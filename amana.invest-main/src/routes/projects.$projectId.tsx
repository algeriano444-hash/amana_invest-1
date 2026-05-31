import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { projects, formatDZD, getContractDates, formatArabicDate, toISODate, getProjectInfo, projectCategoryToOwnerKey } from "@/lib/projects";
import { getProjectOwnerDocuments } from "@/lib/project-documents.functions";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, FileSpreadsheet, Scale, Cog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectPurchaseList } from "@/components/ProjectPurchaseList";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/projects/$projectId")({
  head: ({ params }) => {
    const p = projects.find((x) => x.id === params.projectId);
    const title = p ? `${p.name} — Amana Invest` : "مشروع — Amana";
    const desc = p?.description ?? "تفاصيل مشروع استثماري";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    const project = projects.find((p) => p.id === params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  notFoundComponent: () => (
    <div dir="rtl" className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold">المشروع غير موجود</h1>
        <Button asChild className="mt-6"><Link to="/projects">العودة للمشاريع</Link></Button>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-10 text-center">{error.message}</div>,
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const [shares, setShares] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [step, setStep] = useState<"form" | "confirm">("form");
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchOwnerDocs = useServerFn(getProjectOwnerDocuments);
  const { data: ownerDocsData } = useQuery({
    queryKey: ["project-owner-docs", projectCategoryToOwnerKey(project.category)],
    queryFn: () => fetchOwnerDocs({ data: { category: projectCategoryToOwnerKey(project.category) } }),
    staleTime: 5 * 60 * 1000,
  });
  const ownerDocs = ownerDocsData?.docs ?? {};
  const total = shares * project.sharePrice;
  const progress = (project.sold / project.shares) * 100;
  const remaining = project.shares - project.sold;
  const { start: contractStart, end: contractEnd, months: contractMonths } = getContractDates(project);

  const openConfirm = () => {
    if (!user) {
      toast.info("سجّل الدخول للاستثمار");
      navigate({ to: "/signup" });
      return;
    }
    setStep("form");
    setConfirmOpen(true);
  };

  const goToConfirmStep = () => {
    if (shares < 1 || shares > remaining) {
      toast.error("عدد الحصص غير صالح");
      return;
    }
    setStep("confirm");
  };

  const invest = async () => {
    if (!user) return;
    setSubmitting(true);
    const contractType = project.category === "عام" ? "shares_ownership" : "musharaka";
    const { data: inv, error } = await supabase.from("investments").insert({
      user_id: user.id, project_id: project.id, project_name: project.name,
      shares, share_price: project.sharePrice, total_amount: total, status: "pending",
    }).select().single();

    if (error || !inv) { 
      setSubmitting(false); 
      return toast.error(error?.message ?? "فشل الإرسال"); 
    }

    const content = "عقد " + (contractType === "musharaka" ? "مشاركة في رأس المال" : "ملكية بالحصص") + "\n\nالمشروع: " + project.name + "\nعدد الحصص المشتراة: " + shares + "\nقيمة الحصة: " + formatDZD(project.sharePrice) + "\nالمبلغ الإجمالي: " + formatDZD(total);

    await supabase.from("contracts").insert({
      user_id: user.id, investment_id: inv.id, contract_type: contractType,
      project_name: project.name, content: content,
      start_date: toISODate(contractStart),
      end_date: toISODate(contractEnd),
      duration_months: contractMonths,
    });

    await supabase.from("notifications").insert({
      user_id: user.id, 
      title: "تم تسجيل طلب استثمار جديد",
      body: shares + " حصة في " + project.name + " — " + formatDZD(total),
    });

    setSubmitting(false);
    setConfirmOpen(false);
    toast.success("تم تسجيل طلب الاستثمار وإنشاء العقد");
    navigate({ to: "/dashboard/investments" });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative mx-auto px-4 py-16">
          <Link to="/projects" className="text-sm text-primary-foreground/80 hover:text-gold">← العودة لكل المشاريع</Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge className="bg-gold text-gold-foreground hover:bg-gold">{project.category}</Badge>
            {project.wilaya && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">{project.wilaya}</Badge>}
            <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">{project.field}</Badge>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold text-primary-foreground md:text-5xl">{project.name}</h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/85">{project.description}</p>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-1">
        <div className="space-y-6">
          <ProjectDashboard project={project} onInvest={openConfirm} />
          <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold">تفاصيل المشروع</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
              {[
                { l: "رأس المال", v: formatDZD(project.capital) },
                { l: "عدد الحصص", v: project.shares.toLocaleString("ar-DZ") },
                { l: "قيمة الحصة", v: formatDZD(project.sharePrice) },
                { l: "الحصص المباعة", v: project.sold.toLocaleString("ar-DZ") },
                { l: "الحصص المتبقية", v: remaining.toLocaleString("ar-DZ") },
                { l: "الحالة", v: project.status },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-muted p-4">
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                  <div className="mt-1 font-semibold text-foreground">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">تقدم الاكتتاب</span>
                <span className="font-semibold">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold">عقد المساهمة</h2>
            <p className="mt-3 leading-loose text-muted-foreground">
              يتم الاستثمار في هذا المشروع وفق صيغة <strong className="text-foreground">{project.category === "عام" ? "الملكية بالحصص" : "المشاركة في رأس المال"}</strong>، بعقد إلكتروني موثّق يُحدّث فيه: رأس المال، عدد الحصص، آلية توزيع الأرباح، وتحمّل الخسائر بنسبة المساهمة.
            </p>
            <p className="mt-4 rounded-xl border-r-4 border-gold bg-gold/10 p-4 text-sm leading-loose text-foreground">
              «الأرباح والخسائر يتم تحديثها حسب الاتفاق داخل العقد الرسمي ونتائج المشروع الفعلية.»
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold">القوائم المالية للمشروع</h2>
            <p className="mt-2 text-sm text-muted-foreground">ملخص مالي مبدئي لتقييم فرصة المساهمة قبل الشراء.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                { l: "إجمالي رأس المال المطلوب", v: formatDZD(project.capital) },
                { l: "إجمالي عدد الحصص", v: project.shares.toLocaleString("ar-DZ") },
                { l: "قيمة الحصة الواحدة", v: formatDZD(project.sharePrice) },
                { l: "المبلغ المُكتتَب حتى الآن", v: formatDZD(project.sold * project.sharePrice) },
                { l: "الحصص المتبقية", v: remaining.toLocaleString("ar-DZ") },
                { l: "المبلغ المتبقّي للاكتتاب", v: formatDZD((project.shares - project.sold) * project.sharePrice) },
                { l: "نسبة التغطية", v: progress.toFixed(1) + "%" },
                { l: "تاريخ بدء العقد", v: formatArabicDate(contractStart) },
                { l: "النهاية المتوقعة", v: `${formatArabicDate(contractEnd)} (${contractMonths} شهراً)` },
                { l: "صيغة المساهمة", v: project.category === "عام" ? "ملكية بالحصص" : "مشاركة في رأس المال" },
                { l: "حالة المشروع", v: project.status },
              ].map((row) => (
                <div key={row.l} className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-3">
                  <span className="text-xs text-muted-foreground">{row.l}</span>
                  <span className="text-sm font-semibold text-foreground">{row.v}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl border-r-4 border-primary bg-primary/5 p-3 text-xs leading-loose text-muted-foreground">
              الأرباح والخسائر توزّع بنسبة المساهمة وفق نتائج المشروع الفعلية والعقد الموثّق.
            </p>

            <div className="mt-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs text-muted-foreground">قيمة الحصة الواحدة</div>
                <div className="font-display text-2xl font-bold text-primary">{formatDZD(project.sharePrice)}</div>
              </div>
              <Button onClick={openConfirm} disabled={submitting} size="lg" className="bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-95">
                شراء الحصص / المساهمة
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground sm:text-right">
              ستفتح نافذة لاختيار عدد الحصص ثم تأكيد المبلغ قبل الإرسال.
            </p>
          </div>

          {(() => {
            const info = getProjectInfo(project);
            const docIcon = (t: string) => t === "محاسبي" ? FileSpreadsheet : t === "قانوني" ? Scale : t === "تقني" ? Cog : FileText;
            return (
              <div className="rounded-2xl border border-border bg-gradient-card p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold">معلومات المشروع والوثائق</h2>
                <p className="mt-3 text-sm leading-loose text-muted-foreground">{info.study}</p>
                <ul className="mt-4 grid gap-1 text-sm text-foreground sm:grid-cols-2">
                  {info.highlights.map((h) => <li key={h}>• {h}</li>)}
                </ul>
                <div className="mt-5">
                  <div className="mb-2 text-sm font-bold">الوثائق المحاسبية ودراسة الجدوى</div>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {info.documents.map((d) => {
                      const Icon = docIcon(d.type);
                      const realUrl = d.key ? ownerDocs[d.key] : undefined;
                      const href = realUrl ?? d.url;
                      const hasReal = Boolean(realUrl);
                      return (
                        <li key={d.name}>
                          <a href={href} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg border border-border bg-background/50 p-2.5 text-sm transition hover:bg-muted hover:shadow-soft">
                            <Icon className="h-4 w-4 shrink-0 text-primary" />
                            <span className="flex-1 truncate">{d.name}</span>
                            {hasReal && <Badge className="bg-emerald-600 text-white text-[10px]">متاح</Badge>}
                            <Badge variant="outline" className="text-[10px]">{d.type}</Badge>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-2 text-xs text-muted-foreground">الوثائق الموسومة بـ«متاح» مرفوعة من صاحب المشروع. الباقي ملفات نموذجية إلى أن يرفعها المالك.</p>
                </div>
              </div>
            );
          })()}

          <ProjectPurchaseList projectId={project.id} />
        </div>
      </section>

      <Dialog open={confirmOpen} onOpenChange={(o) => !submitting && setConfirmOpen(o)}>
        <DialogContent dir="rtl" className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {step === "form" ? "القوائم المالية وشراء الحصص" : "تأكيد المبلغ قبل الإرسال"}
            </DialogTitle>
            <DialogDescription>
              {step === "form"
                ? "راجع القوائم المالية للمشروع واختر عدد الحصص التي ترغب في شرائها."
                : "تأكد من المبلغ الإجمالي وتفاصيل العقد قبل تأكيد الطلب."}
            </DialogDescription>
          </DialogHeader>

          {step === "form" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground">المشروع</div>
                <div className="font-semibold">{project.name}</div>
              </div>

              <div className="rounded-xl border border-border bg-background/50 p-4">
                <div className="mb-2 text-xs font-semibold text-foreground">القوائم المالية</div>
                <div className="grid gap-2 text-sm">
                  {[
                    { l: "رأس المال المطلوب", v: formatDZD(project.capital) },
                    { l: "قيمة الحصة الواحدة", v: formatDZD(project.sharePrice) },
                    { l: "الحصص المتبقية", v: remaining.toLocaleString("ar-DZ") },
                    { l: "المبلغ المتبقي للاكتتاب", v: formatDZD(remaining * project.sharePrice) },
                    { l: "نسبة التغطية الحالية", v: `${progress.toFixed(1)}%` },
                    { l: "الصيغة", v: project.category === "عام" ? "ملكية بالحصص" : "مشاركة في رأس المال" },
                    { l: "بدء العقد", v: formatArabicDate(contractStart) },
                    { l: "النهاية المتوقعة", v: `${formatArabicDate(contractEnd)} (${contractMonths} شهراً)` },
                  ].map((r) => (
                    <div key={r.l} className="flex items-center justify-between border-b border-border/50 pb-1 last:border-0">
                      <span className="text-xs text-muted-foreground">{r.l}</span>
                      <span className="text-sm font-semibold">{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-gradient-card p-4">
                <label className="block text-sm font-semibold">عدد الحصص</label>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setShares(Math.max(1, shares - 1))}>−</Button>
                  <Input
                    type="number"
                    min={1}
                    max={remaining}
                    value={shares}
                    onChange={(e) => setShares(Math.max(1, Math.min(remaining, Number(e.target.value) || 1)))}
                    className="text-center font-bold"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShares(Math.min(remaining, shares + 1))}>+</Button>
                </div>
                <div className="mt-4 rounded-xl bg-gradient-hero p-4 text-primary-foreground">
                  <div className="text-xs text-primary-foreground/80">المبلغ الإجمالي للاستثمار</div>
                  <div className="mt-1 font-display text-2xl font-bold">{formatDZD(total)}</div>
                  <div className="mt-1 text-xs text-primary-foreground/80">
                    عدد الحصص المشتراة: {shares.toLocaleString("ar-DZ")}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <div className="text-xs text-muted-foreground">عدد الحصص المشتراة</div>
                  <div className="font-display text-lg font-bold">{shares.toLocaleString("ar-DZ")}</div>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <div className="text-xs text-muted-foreground">قيمة الحصة</div>
                  <div className="font-display text-lg font-bold">{formatDZD(project.sharePrice)}</div>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <div className="text-xs text-muted-foreground">الصيغة</div>
                  <div className="text-sm font-semibold">{project.category === "عام" ? "ملكية بالحصص" : "مشاركة في رأس المال"}</div>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <div className="text-xs text-muted-foreground">مدة العقد</div>
                  <div className="text-sm font-semibold">{contractMonths} شهراً</div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold">مدة العقد</div>
                  <div className="text-xs text-muted-foreground">{contractMonths} شهراً</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">البدء</div>
                    <div className="text-sm font-semibold">{formatArabicDate(contractStart)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">النهاية المتوقعة</div>
                    <div className="text-sm font-semibold">{formatArabicDate(contractEnd)}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-hero p-4 text-primary-foreground">
                <div className="text-xs text-primary-foreground/80">المبلغ الإجمالي للتأكيد</div>
                <div className="font-display text-2xl font-bold">{formatDZD(total)}</div>
              </div>

              <p className="rounded-xl border-r-4 border-gold bg-gold/10 p-3 text-xs leading-loose text-foreground">
                بتأكيدك، توافق على شروط العقد ومبدأ تحمّل الأرباح والخسائر بنسبة المساهمة.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {step === "form" ? (
              <>
                <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                  إلغاء
                </Button>
                <Button onClick={goToConfirmStep} className="bg-gradient-gold text-gold-foreground shadow-gold">
                  متابعة للتأكيد
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep("form")} disabled={submitting}>
                  تعديل الطلب
                </Button>
                <Button onClick={invest} disabled={submitting} className="bg-gradient-gold text-gold-foreground shadow-gold">
                  {submitting ? "جارٍ الحجز..." : "تأكيد الشراء"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}
