/**
 * ExecutionHealthPanel — Read-only derived metrics from deal/milestone data.
 * Does NOT modify ECS or trust logic.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, Clock, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionHealthPanelProps {
  totalMilestones: number;
  completedMilestones: number;
  submittedMilestones: number;
  disputedMilestones: number;
  avgDaysToApproval?: number;
  className?: string;
}

function computeHealthScore(props: ExecutionHealthPanelProps): number {
  const { totalMilestones, completedMilestones, disputedMilestones, avgDaysToApproval } = props;
  if (totalMilestones === 0) return 100;

  let score = 100;

  // Completion ratio weight (40%)
  const completionRatio = completedMilestones / totalMilestones;
  score -= (1 - completionRatio) * 40;

  // Dispute penalty (30%)
  const disputeRatio = disputedMilestones / totalMilestones;
  score -= disputeRatio * 30;

  // Approval speed (30%) — penalize if > 7 days avg
  if (avgDaysToApproval && avgDaysToApproval > 7) {
    score -= Math.min(30, (avgDaysToApproval - 7) * 3);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getHealthColor(score: number): { text: string; bg: string; label: string } {
  if (score >= 80) return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", label: "Excellent" };
  if (score >= 60) return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", label: "Good" };
  if (score >= 40) return { text: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500", label: "Fair" };
  return { text: "text-destructive", bg: "bg-destructive", label: "At Risk" };
}

export function ExecutionHealthPanel(props: ExecutionHealthPanelProps) {
  const { totalMilestones, completedMilestones, submittedMilestones, disputedMilestones, avgDaysToApproval, className } = props;
  const healthScore = computeHealthScore(props);
  const health = getHealthColor(healthScore);

  const metrics = [
    {
      label: "Completion",
      value: totalMilestones > 0 ? `${completedMilestones}/${totalMilestones}` : "—",
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Pending Review",
      value: `${submittedMilestones}`,
      icon: Clock,
      color: "text-amber-500",
    },
    {
      label: "Disputes",
      value: `${disputedMilestones}`,
      icon: AlertTriangle,
      color: disputedMilestones > 0 ? "text-destructive" : "text-muted-foreground",
    },
    {
      label: "Avg Approval",
      value: avgDaysToApproval ? `${avgDaysToApproval.toFixed(1)}d` : "—",
      icon: Activity,
      color: "text-primary",
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Execution Health
          </CardTitle>
          <Badge variant="outline" className={cn("text-xs", health.text)}>
            {health.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center justify-center h-14 w-14 rounded-full border-4",
            health.text,
            healthScore >= 80 ? "border-emerald-500/30" :
            healthScore >= 60 ? "border-amber-500/30" :
            healthScore >= 40 ? "border-orange-500/30" : "border-destructive/30"
          )}>
            <span className={cn("text-xl font-bold", health.text)}>{healthScore}</span>
          </div>
          <div className="flex-1 space-y-1">
            <Progress value={healthScore} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              Overall execution health score (0–100)
            </p>
          </div>
        </div>

        {/* Metric Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <Icon className={cn("h-3.5 w-3.5", m.color)} />
                <div>
                  <p className="text-sm font-semibold">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
