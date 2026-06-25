import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_PROJECT_MILESTONES,
  getMilestoneCompletionScore,
  getMilestonePriorityClass,
  getMilestoneStatusClass,
  getMilestoneStatusLabel,
  type ProjectMilestone,
} from "@/config/projectMilestones";
import { CalendarDays, CheckCircle2, ClipboardCheck, Flag, Milestone } from "lucide-react";

type MilestoneManagerProps = {
  milestones?: ProjectMilestone[];
};

export function MilestoneManager({ milestones = DEMO_PROJECT_MILESTONES }: MilestoneManagerProps) {
  const approved = milestones.filter((milestone) => milestone.status === "approved").length;
  const inProgress = milestones.filter((milestone) => milestone.status === "in_progress").length;
  const blocked = milestones.filter((milestone) => milestone.status === "blocked").length;
  const completionScore = getMilestoneCompletionScore(milestones);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Completion" value={`${completionScore}%`} helper="Average progress" />
        <MetricCard label="Approved" value={approved.toString()} helper="Accepted checkpoints" />
        <MetricCard label="In Progress" value={inProgress.toString()} helper="Currently active" />
        <MetricCard label="Blocked" value={blocked.toString()} helper="Need attention" danger={blocked > 0} />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Milestone className="h-5 w-5 text-primary" />
            Milestone Manager
          </CardTitle>
          <CardDescription>
            Plan execution phases, deliverables, evidence expectations, and acceptance criteria.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {milestones.map((milestone, index) => (
            <MilestoneCard key={milestone.id} milestone={milestone} number={index + 1} />
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

function MilestoneCard({ milestone, number }: { milestone: ProjectMilestone; number: number }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">M{number}</Badge>
            <Badge className={getMilestoneStatusClass(milestone.status)}>{getMilestoneStatusLabel(milestone.status)}</Badge>
            <Badge className={getMilestonePriorityClass(milestone.priority)}>{milestone.priority} priority</Badge>
          </div>
          <h4 className="text-lg font-semibold">{milestone.title}</h4>
          <p className="text-sm text-muted-foreground">{milestone.description}</p>
        </div>
        <div className="min-w-44 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{milestone.progress}%</span>
          </div>
          <Progress value={milestone.progress} className="mt-2 h-2" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoBlock icon={Flag} label="Owner" value={milestone.owner} />
        <InfoBlock icon={CalendarDays} label="Due" value={milestone.dueLabel} />
        <InfoBlock icon={ClipboardCheck} label="Deliverables" value={`${milestone.deliverables.length} planned`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Checklist title="Deliverables" items={milestone.deliverables} />
        <Checklist title="Acceptance Criteria" items={milestone.acceptanceCriteria} />
      </div>
    </div>
  );
}

function InfoBlock({ icon: Icon, label, value }: { icon: typeof Flag; label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
