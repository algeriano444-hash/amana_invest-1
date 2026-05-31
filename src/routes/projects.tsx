import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProjectCard } from "@/components/ProjectCard";
import { projects, ProjectCategory } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

const categoryMap = {
  "all": "projects.categories.all",
  "general": "projects.categories.general",
  "startup": "projects.categories.startup",
  "medium": "projects.categories.medium",
  "freelance": "projects.categories.freelance",
} as const;

type CategoryKey = keyof typeof categoryMap;
const categoryKeys: CategoryKey[] = ["all", "general", "startup", "medium", "freelance"];

function ProjectsPage() {
  const { t, interpolate, language } = useTranslation();
  const [active, setActive] = useState<CategoryKey>("all");
  
  const categoryValues: Record<CategoryKey, ProjectCategory | null> = {
    "all": null,
    "general": "عام",
    "startup": "شركة ناشئة",
    "medium": "مؤسسة متوسطة",
    "freelance": "عمل حر",
  };
  
  const list = active === "all" ? projects : projects.filter((p) => p.category === categoryValues[active]);

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-gradient-card">
        <div className="container mx-auto px-4 py-14">
          <div className="text-sm font-semibold text-primary">{t('projects.allProjects')}</div>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{t('projects.title')}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{interpolate('projects.description', {count: projects.length})}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {categoryKeys.map((c) => (
              <Button key={c} size="sm" variant={active === c ? "default" : "outline"} onClick={() => setActive(c)} className={active === c ? "bg-gradient-hero shadow-soft" : ""}>{t(categoryMap[c])}</Button>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
        {list.length === 0 && <p className="text-center text-muted-foreground">{t('projects.noProjects')}</p>}
      </section>

      <SiteFooter />
    </div>
  );
}
