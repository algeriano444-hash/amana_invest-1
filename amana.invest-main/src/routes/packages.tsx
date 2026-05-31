import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INVESTMENT_PACKAGES, ADVISORY_PACKAGES, type PackageItem } from "@/lib/projects";
import { CheckCircle2, TrendingUp, Briefcase } from "lucide-react";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "الباقات — Amana Invest" },
      { name: "description", content: "باقات استثمار وباقات استشارة مالية متخصصة لجميع المستويات — من المبتدئ إلى المستثمر المحترف." },
      { property: "og:title", content: "باقات الاستثمار والاستشارة — Amana" },
      { property: "og:description", content: "اختر الباقة المناسبة لرحلتك الاستثمارية." },
    ],
  }),
  component: PackagesPage,
});

function Card({ pkg }: { pkg: PackageItem }) {
  return (
    <div className={`relative flex flex-col rounded-2xl border p-6 shadow-soft transition hover:shadow-elegant ${
      pkg.highlight ? "border-primary bg-gradient-card ring-2 ring-primary/30" : "border-border bg-gradient-card"
    }`}>
      {pkg.highlight && <Badge className="absolute -top-3 right-4 bg-gold text-gold-foreground">الأكثر اختياراً</Badge>}
      <h3 className="font-display text-xl font-bold">{pkg.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{pkg.tagline}</p>
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
        <Link to="/signup">اشترك الآن</Link>
      </Button>
    </div>
  );
}

function PackagesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="container relative mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">باقات الاستثمار والاستشارة</h1>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/85">
            اختر الباقة التي تناسب أهدافك المالية ومستوى خبرتك. كل الباقات شفافة وموثوقة وقابلة للترقية في أي وقت.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">باقات الاستثمار</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {INVESTMENT_PACKAGES.map((p) => <Card key={p.id} pkg={p} />)}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="mb-8 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <h2 className="font-display text-2xl font-bold">باقات الاستشارة المالية</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {ADVISORY_PACKAGES.map((p) => <Card key={p.id} pkg={p} />)}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-gradient-card p-8 text-center shadow-soft">
          <h2 className="font-display text-2xl font-bold">تحتاج توصية مخصّصة؟</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            تواصل مع فريقنا لتصميم باقة استثمارية أو استشارية مفصّلة على وضعك المالي وأهدافك.
          </p>
          <Button asChild className="mt-5 bg-gradient-gold text-gold-foreground shadow-gold">
            <Link to="/contact">تواصل مع فريقنا</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
