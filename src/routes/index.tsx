import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { LiveStats } from "@/components/LiveStats";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/contexts/LanguageContext";
import { projects } from "@/lib/projects";
import heroPattern from "@/assets/hero-pattern.jpg";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { t, language } = useTranslation();
  const { translations } = useLanguage();
  const featured = projects.slice(0, 6);

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${heroPattern})`, backgroundSize: "cover" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-background/10 px-4 py-1.5 text-sm font-medium text-gold backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              {t('home.hero_tagline')}
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
              {t('home.hero_title')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-foreground/90">
              {t('home.hero_subtitle')}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-95">
                <Link to="/projects">{t('home.cta_explore')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-background/10 text-primary-foreground backdrop-blur hover:bg-background/20">
                <Link to="/about">{t('home.cta_options')}</Link>
              </Button>
            </div>
          </div>

          {/* Live stats */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold text-gold/90">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {t('home.live_stats')}
            </div>
            <LiveStats />
          </div>
        </div>
      </section>

      {/* INVESTMENT STRUCTURE */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-3 text-sm font-semibold text-primary">{t('home.investment_types')}</div>
          <h2 className="font-display text-3xl font-bold md:text-4xl">{t('home.investment_title')}</h2>
          <p className="mt-4 text-muted-foreground">{t('home.investment_subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: t('home.partnership_title'),
              desc: t('home.partnership_desc'),
              points: Array.isArray(translations?.home?.partnership_points) 
                ? translations.home.partnership_points 
                : t('home.partnership_points', '').split(',').map((p: string) => p.trim()).filter(Boolean),
            },
            {
              title: t('home.ownership_title'),
              desc: t('home.ownership_desc'),
              points: Array.isArray(translations?.home?.ownership_points)
                ? translations.home.ownership_points
                : t('home.ownership_points', '').split(',').map((p: string) => p.trim()).filter(Boolean),
            },
          ].map((c) => (
            <div key={c.title} className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-card p-8 shadow-soft transition-all hover:shadow-elegant">
              <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-gradient-hero opacity-10 blur-3xl transition group-hover:opacity-20" />
              <h3 className="font-display text-2xl font-bold">{c.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{c.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {c.points.map((p: string) => (
                  <li key={p} className="flex items-center gap-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">✓</span>
                    <span className="font-medium text-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 text-sm font-semibold text-primary">{t('home.featured')}</div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">{t('home.featured_title')}</h2>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link to="/projects">{t('home.view_all')} ({projects.length})</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Button asChild><Link to="/projects">{t('home.view_all_projects')}</Link></Button>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 text-center shadow-elegant md:p-16">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${heroPattern})`, backgroundSize: "cover" }} />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">{t('home.cta_title')}</h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">{t('home.cta_subtitle')}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="bg-gradient-gold text-gold-foreground shadow-gold hover:opacity-95">{t('home.btn_investor')}</Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/40 bg-background/10 text-primary-foreground backdrop-blur hover:bg-background/20">{t('home.btn_founder')}</Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
