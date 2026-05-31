import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "الاستثمار — Amana Invest" },
      { name: "description", content: "تعرّف على صيغ الاستثمار المعتمدة في المنصة، والقواعد العمل، والمشاريع المتاحة." },
      { property: "og:title", content: "الاستثمار — Amana" },
      { property: "og:description", content: "صيغ عمل موثّقة وقواعد شفافة ومشاريع حقيقية." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-gradient-card">
        <div className="container mx-auto px-4 py-16">
          <div className="text-sm font-semibold text-primary">عن المنصة</div>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">الاستثمار على Amana</h1>
          <p className="mt-4 max-w-3xl leading-loose text-muted-foreground">
            Amana Invest منصة رقمية للاستثمار، تربط بين المستثمرين وأصحاب المشاريع ضمن نظام مالي قائم على المشاركة والملكية بالحصص، بعقود إلكترونية موثّقة وشفافة.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-2">
        <Card title="الرؤية">
          بناء منصة استثمار عالمية تشمل الجزائر، المغرب العربي، دول الخليج والدول الآسيوية.
        </Card>
        <Card title="تاريخ الانطلاق">   — الاستثمار يبدأ فقط من تاريخ الإطلاق الرسمي.</Card>

        <Card title="القواعد الأساسية">
          <ul className="space-y-2 text-sm">
            {["شفافية كاملة", "عقود موثّقة", "مشاريع حقيقية", "ملكية واضحة", "نسب أرباح عادلة"].map((p) => (
              <li key={p} className="flex items-center gap-2"><span className="text-primary">✓</span>{p}</li>
            ))}
          </ul>
        </Card>

        <Card title="المشاريع المسموحة">
          <div className="flex flex-wrap gap-2">
            {["العقارات", "الزراعة", "الصناعة", "التجارة", "التعليم", "التكنولوجيا", "الخدمات"].map((t) => (
              <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{t}</span>
            ))}
          </div>
        </Card>

        <Card title="المشاريع الممنوعة">
          <div className="flex flex-wrap gap-2">
            {["أنشطة عالية المخاطر", "المقامرة", "الأنشطة غير القانونية", "المشاريع الوهمية", "الأنشطة الممنوعة تنظيمياً"].map((t) => (
              <span key={t} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">{t}</span>
            ))}
          </div>
        </Card>

        <Card title="الشركاء">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• المؤسسات المالية</li>
            <li>• الهيئات الاستشارية المتخصصة</li>
          </ul>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-card p-7 shadow-soft">
      <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
      <div className="mt-4 leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
