import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";

interface ExecutionStats {
  milestonesCompleted: number;
  milestonesTotal: number;
  avgCompletionDays: number;
  reviewTurnaroundHours: number;
  tasksOverdue: number;
  nextAction: string | null;
  nextActionHref: string;
}

export function ExecutionTransparencyPanel({ stats }: { stats: ExecutionStats }) {
  const completionPct = stats.milestonesTotal > 0
    ? Math.round((stats.milestonesCompleted / stats.milestonesTotal) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Execution Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Milestones</span>
            <span>{stats.milestonesCompleted}/{stats.milestonesTotal}</span>
          </div>
          <Progress value={completionPct} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">{stats.avgCompletionDays}d</p>
            <p className="text-[10px] text-muted-foreground">Avg Completion</p>
          </div>
          <div>
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">{stats.reviewTurnaroundHours}h</p>
            <p className="text-[10px] text-muted-foreground">Review Turnaround</p>
          </div>
          <div>
            <AlertCircle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">{stats.tasksOverdue}</p>
            <p className="text-[10px] text-muted-foreground">Tasks Overdue</p>
          </div>
        </div>

        {stats.nextAction && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <ArrowRight className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">What to do next</p>
              <p className="text-xs text-muted-foreground">{stats.nextAction}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
