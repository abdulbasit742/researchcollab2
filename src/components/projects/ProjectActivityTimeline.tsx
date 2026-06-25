import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_PROJECT_ACTIVITY,
  getActivityImportanceClass,
  getActivityTypeLabel,
  getRecentHighImportanceActivities,
  type ProjectActivityItem,
  type ProjectActivityType,
} from "@/config/projectActivity";
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
  Flag,
  MessageSquare,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

const activityIconMap: Record<ProjectActivityType, LucideIcon> = {
  created: CheckCircle2,
  status: Activity,
  milestone: Flag,
  task: ClipboardList,
  review: ShieldCheck,
  file: FileText,
  team: Users,
  funding: DollarSign,
  comment: MessageSquare,
};

type ProjectActivityTimelineProps = {
  activities?: ProjectActivityItem[];
};

export function ProjectActivityTimeline({ activities = DEMO_PROJECT_ACTIVITY }: ProjectActivityTimelineProps) {
  const highImportance = getRecentHighImportanceActivities(activities).length;
  const teamEvents = activities.filter((activity) => activity.type === "team").length;
  const reviewEvents = activities.filter((activity) => activity.type === "review" || activity.type === "milestone").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Events" value={activities.length.toString()} helper="Workspace timeline" />
        <MetricCard label="High Importance" value={highImportance.toString()} helper="Needs attention" danger={highImportance > 0} />
        <MetricCard label="Team Events" value={teamEvents.toString()} helper="Invites and roles" />
        <MetricCard label="Review Events" value={reviewEvents.toString()} helper="Milestone/review updates" />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Project Activity Timeline
          </CardTitle>
          <CardDescription>
            Read-only activity feed for workspace events, milestone changes, review states, team planning, and demo-safe system notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {activities.map((activity) => (
              <ActivityTimelineItem key={activity.id} activity={activity} />
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
            This timeline is currently read-only demo data. Production activity should be generated from audited project events, member actions, status changes, and notification records.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityTimelineItem({ activity }: { activity: ProjectActivityItem }) {
  const Icon = activityIconMap[activity.type];

  return (
    <div className="relative flex gap-4 pl-10">
      <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 rounded-xl border bg-background p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{getActivityTypeLabel(activity.type)}</Badge>
              <Badge className={getActivityImportanceClass(activity.importance)}>{activity.importance}</Badge>
              {activity.metadata ? <Badge variant="secondary">{activity.metadata}</Badge> : null}
            </div>
            <div>
              <h4 className="font-semibold">{activity.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
            </div>
          </div>
          <div className="min-w-40 rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="text-xs text-muted-foreground">{activity.timeLabel}</p>
            <p className="mt-1 font-medium">{activity.actor}</p>
          </div>
        </div>
      </div>
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
