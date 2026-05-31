import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Project, formatDZD } from "@/lib/projects";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ProjectQuickView } from "@/components/ProjectQuickView";

export function ProjectCard({ project }: { project: Project }) {
  const progress = (project.sold / project.shares) * 100;
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block w-full text-right overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
      >
        <div className="relative h-32 bg-gradient-hero">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="absolute bottom-3 right-4 left-4 flex items-center justify-between">
            <Badge className="bg-gold text-gold-foreground hover:bg-gold">{project.category}</Badge>
            {project.wilaya && <span className="text-xs font-medium text-primary-foreground/90">{project.wilaya}</span>}
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <h3 className="font-display text-lg font-bold leading-snug text-foreground group-hover:text-primary">{project.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{project.field}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-muted p-2.5">
              <div className="text-muted-foreground">رأس المال</div>
              <div className="mt-0.5 font-semibold text-foreground">{formatDZD(project.capital)}</div>
            </div>
            <div className="rounded-lg bg-muted p-2.5">
              <div className="text-muted-foreground">قيمة الحصة</div>
              <div className="mt-0.5 font-semibold text-foreground">{formatDZD(project.sharePrice)}</div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted-foreground">الحصص المباعة</span>
              <span className="font-semibold">{project.sold} / {project.shares}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <Link
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] text-muted-foreground hover:text-primary"
            >
              صفحة كاملة
            </Link>
            <span className="text-sm font-bold text-primary group-hover:underline">عرض المشروع وشراء الحصص ←</span>
          </div>
        </div>
      </button>

      <ProjectQuickView project={project} open={open} onOpenChange={setOpen} />
    </>
  );
}
