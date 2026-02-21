import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ExecutionHealthScoreProps {
  score: number; // 0-100
  factors: {
    milestone_adherence: number;
    submission_frequency: number;
    response_time: number;
    quality_rating: number;
  };
  trend: "improving" | "stable" | "declining";
  className?: string;
}

function getHealthLevel(score: number) {
  if (score >= 80) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" };
  if (score >= 60) return { label: "Good", color: "text-primary", bg: "bg-primary", badge: "bg-primary/10 text-primary border-primary/30" };
  if (score >= 40) return { label: "At Risk", color: "text-amber-500", bg: "bg-amber-500", badge: "bg-amber-500/10 text-amber-600 border-amber-500/30" };
  return { label: "Critical", color: "text-destructive", bg: "bg-destructive", badge: "bg-destructive/10 text-destructive border-destructive/30" };
}

const trendIcons = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

const factorLabels: Record<string, string> = {
  milestone_adherence: "Milestone Adherence",
  submission_frequency: "Submission Frequency",
  response_time: "Response Time",
  quality_rating: "Quality Rating",
};

export function ExecutionHealthScore({ score, factors, trend, className }: ExecutionHealthScoreProps) {
  const health = getHealthLevel(score);
  const TrendIcon = trendIcons[trend];

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={cn("h-5 w-5", health.color)} />
            <span className="text-sm font-semibold">Execution Health</span>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon className="h-3.5 w-3.5" />
                  {trend}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">30-day trend</p>
              </TooltipContent>
            </Tooltip>
            <Badge className={cn("text-xs font-bold", health.badge)}>
              {score}/100
            </Badge>
          </div>
        </div>

        {/* Main Progress */}
        <Progress value={score} className="h-2" />

        {/* Factor Breakdown */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(factors).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
              <span className="text-muted-foreground truncate">{factorLabels[key] || key}</span>
              <span className={cn(
                "font-semibold",
                value >= 70 ? "text-emerald-500" : value >= 40 ? "text-amber-500" : "text-destructive"
              )}>
                {value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
