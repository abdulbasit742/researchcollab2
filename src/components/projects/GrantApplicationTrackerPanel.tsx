import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DEMO_GRANT_APPLICATION_TRACKER,
  getGrantApplicationPriorityClass,
  getGrantApplicationStageStatusClass,
  getGrantApplicationStageStatusLabel,
  getGrantApplicationStatusClass,
  getGrantApplicationStatusLabel,
  getGrantApplicationTrackerCounts,
  type GrantApplication,
  type GrantApplicationRequirement,
  type GrantApplicationStage,
  type GrantApplicationTrackerSummary,
} from "@/config/grantApplicationTracker";
import { ClipboardCheck, FileCheck2, FileText, Lock, Send, ShieldCheck, TimerReset, type LucideIcon } from "lucide-react";

type GrantApplicationTrackerPanelProps = {
  summary?: GrantApplicationTrackerSummary;
};

export function GrantApplicationTrackerPanel({ summary = DEMO_GRANT_APPLICATION_TRACKER }: GrantApplicationTrackerPanelProps) {
  const counts = getGrantApplicationTrackerCounts(summary);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        <MetricCard label="Applications" value={counts.applications.toString()} helper="Saved grants" />
        <MetricCard label="In Review" value={counts.inReview.toString()} helper="Needs approval" />
        <MetricCard label="Blocked" value={counts.blocked.toString()} helper="Eligibility gaps" danger={counts.blocked > 0} />
        <MetricCard label="Locked Stages" value={counts.lockedStages.toString()} helper="Submission gates" danger={counts.lockedStages > 0} />
        <MetricCard label="Missing Reqs" value={counts.missingRequirements.toString()} helper="Docs needed" danger={counts.missingRequirements > 0} />
        <MetricCard label="Avg Ready" value={`${counts.averageReadiness}%`} helper="Readiness" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{summary.cycleLabel}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/30">Tracker Preview</Badge>
              </div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Grant Application Tracker
              </CardTitle>
              <CardDescription>
                Track saved grants through application stages, document readiness, reviewer notes, deadlines, and locked submission actions.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled>
                <FileText className="mr-2 h-4 w-4" /> Export Package
              </Button>
              <Button disabled>
                <Lock className="mr-2 h-4 w-4" /> Submit Locked
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            {summary.safetyNote}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Project" value={summary.projectTitle} />
            <InfoCard label="Owner" value={summary.owner} />
            <InfoCard label="Average readiness" value={`${counts.averageReadiness}%`} />
          </div>

          <div className="grid gap-4">
            {summary.applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ApplicationCard({ application }: { application: GrantApplication }) {
  return (
    <div className="rounded-xl border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getGrantApplicationStatusClass(application.status)}>
              {getGrantApplicationStatusLabel(application.status)}
            </Badge>
            <Badge className={getGrantApplicationPriorityClass(application.priority)}>{application.priority} priority</Badge>
            <Badge variant="outline">{application.amountLabel}</Badge>
            <Badge variant="secondary" className="gap-1">
              <TimerReset className="h-3 w-3" /> {application.deadlineLabel}
            </Badge>
          </div>
          <div>
            <h4 className="text-lg font-semibold">{application.grantTitle}</h4>
            <p className="text-xs text-muted-foreground">{application.provider}</p>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm md:min-w-52">
          <p className="text-xs text-muted-foreground">Application Readiness</p>
          <p className="mt-1 text-2xl font-bold">{application.readiness}%</p>
          <Progress value={application.readiness} className="mt-2 h-2" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ApplicationStages stages={application.stages} />
        <ApplicationRequirements requirements={application.requirements} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <InfoBlock title="Reviewer Note" icon={ShieldCheck} text={application.reviewerNote} />
        <InfoBlock title="Next Action" icon={Send} text={application.nextAction} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled>
          <FileCheck2 className="mr-2 h-4 w-4" /> Mark Ready
        </Button>
        <Button disabled>
          <Lock className="mr-2 h-4 w-4" /> Submit Application
        </Button>
      </div>
    </div>
  );
}

function ApplicationStages({ stages }: { stages: GrantApplicationStage[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <ClipboardCheck className="h-4 w-4 text-primary" /> Application Stages
      </p>
      <div className="mt-3 space-y-2">
        {stages.map((stage) => (
          <div key={stage.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getGrantApplicationStageStatusClass(stage.status)}>
                {getGrantApplicationStageStatusLabel(stage.status)}
              </Badge>
              <p className="font-medium">{stage.title}</p>
              <Badge variant="outline">{stage.dueLabel}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Owner: {stage.owner}</p>
            <p className="mt-1 text-muted-foreground">{stage.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicationRequirements({ requirements }: { requirements: GrantApplicationRequirement[] }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <FileCheck2 className="h-4 w-4 text-primary" /> Required Documents
      </p>
      <div className="mt-3 space-y-2">
        {requirements.map((requirement) => (
          <div key={requirement.id} className="rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getGrantApplicationStageStatusClass(requirement.status)}>
                {getGrantApplicationStageStatusLabel(requirement.status)}
              </Badge>
              <p className="font-medium">{requirement.label}</p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{requirement.helper}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBlock({ title, icon: Icon, text }: { title: string; icon: LucideIcon; text: string }) {
  return (
    <div className="rounded-lg border bg-primary/5 p-3 text-sm">
      <p className="flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </p>
      <p className="mt-1 text-muted-foreground">{text}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, helper, danger = false }: { label: string; value: string; helper: string; danger?: boolean }) {
  return (
    <Card className={danger ? "border-amber-500/30" : undefined}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-1 text-xl font-bold ${danger ? "text-amber-600" : ""}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
