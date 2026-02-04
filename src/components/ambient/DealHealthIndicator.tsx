import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare
} from "lucide-react";
import type { DealHealthMetric } from "@/hooks/useAmbientIntelligence";

interface DealHealthIndicatorProps {
  health: DealHealthMetric;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const getHealthColor = (score: number) => {
  if (score >= 80) return { text: "text-emerald-500", bg: "bg-emerald-500", fill: "fill-emerald-500" };
  if (score >= 60) return { text: "text-amber-500", bg: "bg-amber-500", fill: "fill-amber-500" };
  if (score >= 40) return { text: "text-orange-500", bg: "bg-orange-500", fill: "fill-orange-500" };
  return { text: "text-red-500", bg: "bg-red-500", fill: "fill-red-500" };
};

const getOutcomeConfig = (outcome?: string) => {
  switch (outcome) {
    case "on_track":
      return { icon: CheckCircle, label: "On Track", color: "text-emerald-500" };
    case "at_risk":
      return { icon: AlertTriangle, label: "At Risk", color: "text-amber-500" };
    case "likely_fail":
      return { icon: AlertTriangle, label: "Critical", color: "text-red-500" };
    default:
      return { icon: Clock, label: "Analyzing", color: "text-muted-foreground" };
  }
};

const getSentimentIcon = (trend?: string) => {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    case "declining":
      return <TrendingDown className="h-3 w-3 text-red-500" />;
    default:
      return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
};

export function DealHealthIndicator({ 
  health, 
  showDetails = true, 
  compact = false,
  className 
}: DealHealthIndicatorProps) {
  const colors = getHealthColor(health.health_score);
  const outcome = getOutcomeConfig(health.predicted_outcome);
  const OutcomeIcon = outcome.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1.5", className)}>
              <div className={cn("h-2 w-2 rounded-full", colors.bg)} />
              <span className={cn("text-xs font-medium", colors.text)}>
                {health.health_score}%
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deal Health: {health.health_score}%</p>
            {health.predicted_outcome && (
              <p className="text-xs text-muted-foreground">
                Status: {outcome.label}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border bg-card",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className={cn("h-5 w-5", colors.text)} />
          <h4 className="font-semibold">Deal Health</h4>
        </div>
        <Badge variant="outline" className={cn("text-xs", outcome.color)}>
          <OutcomeIcon className="h-3 w-3 mr-1" />
          {outcome.label}
        </Badge>
      </div>

      {/* Main health score */}
      <div className="mb-4">
        <div className="flex items-end justify-between mb-2">
          <span className={cn("text-3xl font-bold", colors.text)}>
            {health.health_score}%
          </span>
          {health.confidence && (
            <span className="text-xs text-muted-foreground">
              {Math.round(health.confidence * 100)}% confidence
            </span>
          )}
        </div>
        <Progress value={health.health_score} className="h-2" />
      </div>

      {showDetails && (
        <>
          {/* Sub-metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {health.communication_score !== undefined && (
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1 mb-1">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Communication</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold">{health.communication_score}%</span>
                  {getSentimentIcon(health.sentiment_trend)}
                </div>
              </div>
            )}

            {health.milestone_velocity !== undefined && (
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Velocity</span>
                </div>
                <span className="text-sm font-semibold">
                  {health.milestone_velocity > 1 ? "Ahead" : health.milestone_velocity < 1 ? "Behind" : "On pace"}
                </span>
              </div>
            )}
          </div>

          {/* Risk factors */}
          {health.risk_factors.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Risk Factors</p>
              {health.risk_factors.slice(0, 3).map((factor, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          )}

          {/* Activity info */}
          {health.days_since_activity !== undefined && health.days_since_activity > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              Last activity: {health.days_since_activity} {health.days_since_activity === 1 ? "day" : "days"} ago
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

// Traffic light summary for multiple deals
interface DealHealthSummaryProps {
  deals: DealHealthMetric[];
  className?: string;
}

export function DealHealthSummary({ deals, className }: DealHealthSummaryProps) {
  const summary = {
    healthy: deals.filter(d => d.health_score >= 70).length,
    warning: deals.filter(d => d.health_score >= 40 && d.health_score < 70).length,
    critical: deals.filter(d => d.health_score < 40).length,
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-emerald-500" />
        <span className="text-sm font-medium">{summary.healthy}</span>
        <span className="text-xs text-muted-foreground">healthy</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-amber-500" />
        <span className="text-sm font-medium">{summary.warning}</span>
        <span className="text-xs text-muted-foreground">at risk</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <span className="text-sm font-medium">{summary.critical}</span>
        <span className="text-xs text-muted-foreground">critical</span>
      </div>
    </div>
  );
}
