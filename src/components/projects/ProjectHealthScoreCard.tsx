import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  calculateProjectHealth,
  getProjectHealthClass,
  type ProjectHealthSignal,
} from "@/config/projectHealth";
import { DEMO_PROJECT_MILESTONES, type ProjectMilestone } from "@/config/projectMilestones";
import { DEMO_PROJECT_TASKS, type ProjectTask } from "@/config/projectTasks";
import { DEMO_PROJECT_WORKSPACE, type ProjectWorkspaceSummary } from "@/config/projectWorkspace";
import { Activity, AlertTriangle, CheckCircle2, HeartPulse, TrendingUp } from "lucide-react";

type ProjectHealthScoreCardProps = {
  project?: ProjectWorkspaceSummary;
  milestones?: ProjectMilestone[];
  tasks?: ProjectTask[];
};

export function ProjectHealthScoreCard({
  project = DEMO_PROJECT_WORKSPACE,
  milestones = DEMO_PROJECT_MILESTONES,
  tasks = DEMO_PROJECT_TASKS,
}: ProjectHealthScoreCardProps) {
  const result = calculateProjectHealth(project, milestones, tasks);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary" />
              Project Health Score
            </CardTitle>
            <CardDescription>{result.summary}</CardDescription>
          </div>
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Health</p>
              <p className="text-3xl font-bold">{result.score}</p>
            </div>
            <Badge className={getProjectHealthClass(result.grade)}>{result.grade}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Overall confidence</span>
            <span>{result.score}%</span>
          </div>
          <Progress value={result.score} className="h-2" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {result.signals.map((signal) => (
            <HealthSignalCard key={signal.id} signal={signal} />
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Blockers
            </p>
            <p className="mt-1 text-2xl font-bold">{result.blockers}</p>
            <p className="text-xs text-muted-foreground">Milestone and task blockers detected in current workspace data.</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" /> Recommended Next Action
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{result.nextAction}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthSignalCard({ signal }: { signal: ProjectHealthSignal }) {
  const Icon = signal.status === "good" ? CheckCircle2 : signal.status === "watch" ? Activity : AlertTriangle;
  const className =
    signal.status === "good"
      ? "border-green-500/30 bg-green-500/5"
      : signal.status === "watch"
      ? "border-amber-500/30 bg-amber-500/5"
      : "border-red-500/30 bg-red-500/5";

  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            <Icon className="h-4 w-4" /> {signal.label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{signal.evidence}</p>
        </div>
        <Badge variant="outline">{signal.score}</Badge>
      </div>
      <Progress value={signal.score} className="mt-3 h-1.5" />
    </div>
  );
}
