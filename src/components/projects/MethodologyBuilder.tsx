import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  METHODOLOGY_SECTIONS,
  getMethodologyCategoryLabel,
  getMethodologyReadiness,
  getMethodologyReadinessLabel,
  getMethodologyStatusClass,
  getMethodologyStatusLabel,
  type MethodologySection,
} from "@/config/methodologyBuilder";
import { AlertTriangle, CheckCircle2, ClipboardCheck, FlaskConical, Lightbulb, PencilLine, Route, type LucideIcon } from "lucide-react";

type MethodologyBuilderProps = {
  sections?: MethodologySection[];
};

export function MethodologyBuilder({ sections = METHODOLOGY_SECTIONS }: MethodologyBuilderProps) {
  const readiness = getMethodologyReadiness(sections);
  const complete = sections.filter((section) => section.status === "complete").length;
  const review = sections.filter((section) => section.status === "review").length;
  const notStarted = sections.filter((section) => section.status === "not_started").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Method Readiness" value={`${readiness}%`} helper={getMethodologyReadinessLabel(readiness)} />
        <MetricCard label="Complete" value={complete.toString()} helper="Ready sections" />
        <MetricCard label="In Review" value={review.toString()} helper="Needs feedback" />
        <MetricCard label="Not Started" value={notStarted.toString()} helper="Missing method detail" danger={notStarted > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                Methodology Builder
              </CardTitle>
              <CardDescription>
                Convert project method into clear design, data, implementation, validation, and ethics sections.
              </CardDescription>
            </div>
            <Button variant="outline" disabled>
              <PencilLine className="mr-2 h-4 w-4" /> Edit Methodology
            </Button>
          </div>
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Methodology readiness</span>
              <span>{readiness}%</span>
            </div>
            <Progress value={readiness} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This builder is currently read-only planning UI. Method editing, diagrams, file attachments, and supervisor comments can connect to project methodology records later.
          </div>

          {sections.map((section, index) => (
            <MethodologySectionCard key={section.id} section={section} number={index + 1} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-red-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${danger ? "text-red-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function MethodologySectionCard({ section, number }: { section: MethodologySection; number: number }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Step {number}</Badge>
            <Badge className={getMethodologyStatusClass(section.status)}>{getMethodologyStatusLabel(section.status)}</Badge>
            <Badge variant="secondary">{getMethodologyCategoryLabel(section.category)}</Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{section.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-48">
          <p className="text-xs text-muted-foreground">Artifacts</p>
          <p className="mt-1 font-semibold">{section.artifactNeeded.length} required</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Artifacts Needed" icon={ClipboardCheck} items={section.artifactNeeded} />
        <Checklist title="Review Questions" icon={Lightbulb} items={section.reviewQuestions} />
      </div>

      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">
        <p className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4" /> Risk Note
        </p>
        <p className="mt-1 text-muted-foreground">{section.riskNote}</p>
      </div>
    </div>
  );
}

function Checklist({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <span>{item}</span>
          </div>
        ))}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Route className="mt-0.5 h-4 w-4 text-primary" />
          <span>Keep methodology aligned with objectives, milestones, and final report evidence.</span>
        </div>
      </div>
    </div>
  );
}
