import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EDUCATION_PACKAGES } from "@/lib/projects";
import { GraduationCap, BookOpen, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "باقات التعليم — Amana Invest" },
      { name: "description", content: "تعلّم أساسيات الاستثمار وآليات التمويل عبر باقات تعليمية مصمّمة بإشراف خبراء متخصصين وماليين." },
      { property: "og:title", content: "باقات التعليم — Amana" },
      { property: "og:description", content: "دروس وشهادات في الاستثمار والتمويل وبناء المحفظة الاستثمارية." },
    ],
  }),
  component: EducationPage,
});

function EducationPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="container relative mx-auto px-4 py-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-background/10 px-4 py-1.5 text-sm font-medium text-gold backdrop-blur">
            <GraduationCap className="h-4 w-4" /> أكاديمية أمانة للاستثمار
          </div>
          <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">تعلّم الاستثمار خطوة بخطوة</h1>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/85">
            باقات تعليمية تشمل أساسيات الاستثمار، آليات التمويل، بناء المحفظة، وقراءة القوائم المالية — بإشراف متخصصين وماليين.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {EDUCATION_PACKAGES.map((pkg) => (
            <div key={pkg.id} className={`relative flex flex-col rounded-2xl border p-6 shadow-soft transition hover:shadow-elegant ${
              pkg.highlight ? "border-primary bg-gradient-card ring-2 ring-primary/30" : "border-border bg-gradient-card"
            }`}>
              {pkg.highlight && <Badge className="absolute -top-3 right-4 bg-gold text-gold-foreground">الأكثر طلباً</Badge>}
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-bold">{pkg.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{pkg.tagline}</p>
              <div className="my-5 font-display text-2xl font-bold text-primary">{pkg.price}</div>
              <ul className="space-y-2 text-sm">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-6 bg-gradient-hero shadow-soft" asChild>
                <Link to="/signup">سجّل في هذه الباقة</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-gradient-card p-8 text-center shadow-soft">
          <h2 className="font-display text-2xl font-bold">لماذا التعلّم قبل الاستثمار؟</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            الاستثمار بدون فهم آليات التمويل قد يقودك لأخطاء مالية. نوفر لك المعرفة قبل أن نوفر لك الفرصة.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
