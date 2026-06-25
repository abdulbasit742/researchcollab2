import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  generateProjectRiskAlerts,
  getRiskCategoryLabel,
  getRiskSeverityClass,
  type ProjectRiskAlert,
} from "@/config/projectRiskAlerts";
import { DEMO_PROJECT_MILESTONES, type ProjectMilestone } from "@/config/projectMilestones";
import { DEMO_PROJECT_TASKS, type ProjectTask } from "@/config/projectTasks";
import { DEMO_PROJECT_WORKSPACE, type ProjectWorkspaceSummary } from "@/config/projectWorkspace";
import { AlertTriangle, CheckCircle2, ShieldAlert, Target } from "lucide-react";

type ProjectRiskAlertsProps = {
  project?: ProjectWorkspaceSummary;
  milestones?: ProjectMilestone[];
  tasks?: ProjectTask[];
};

export function ProjectRiskAlerts({
  project = DEMO_PROJECT_WORKSPACE,
  milestones = DEMO_PROJECT_MILESTONES,
  tasks = DEMO_PROJECT_TASKS,
}: ProjectRiskAlertsProps) {
  const alerts = generateProjectRiskAlerts(project, milestones, tasks);
  const highPriorityCount = alerts.filter((alert) => alert.severity === "critical" || alert.severity === "high").length;

  return (
    <Card className={highPriorityCount > 0 ? "border-red-500/30" : "border-primary/20"}>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Project Risk Alerts
            </CardTitle>
            <CardDescription>
              Risk signals generated from health score, milestones, task status, review load, and blockers.
            </CardDescription>
          </div>
          <Badge variant={highPriorityCount > 0 ? "destructive" : "secondary"}>
            {highPriorityCount} high priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <RiskAlertCard key={alert.id} alert={alert} />
        ))}
      </CardContent>
    </Card>
  );
}

function RiskAlertCard({ alert }: { alert: ProjectRiskAlert }) {
  const Icon = alert.severity === "low" ? CheckCircle2 : AlertTriangle;

  return (
    <div className={`rounded-xl border p-4 ${getRiskSeverityClass(alert.severity)}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1 bg-background/70">
              <Icon className="h-3 w-3" /> {alert.severity}
            </Badge>
            <Badge variant="outline" className="bg-background/70">{getRiskCategoryLabel(alert.category)}</Badge>
          </div>
          <div>
            <h4 className="font-semibold">{alert.title}</h4>
            <p className="mt-1 text-sm opacity-90">{alert.description}</p>
          </div>
        </div>
        <div className="min-w-48 rounded-lg border bg-background/70 p-3 text-sm">
          <p className="text-xs text-muted-foreground">Signal</p>
          <p className="mt-1 font-medium text-foreground">{alert.signal}</p>
        </div>
      </div>
      <div className="mt-3 rounded-lg border bg-background/70 p-3 text-sm text-foreground">
        <p className="flex items-center gap-2 font-medium">
          <Target className="h-4 w-4 text-primary" /> Recommended action
        </p>
        <p className="mt-1 text-muted-foreground">{alert.recommendedAction}</p>
      </div>
    </div>
  );
}
