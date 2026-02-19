import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  DollarSign,
  Lock,
  CheckCircle2,
  Shield,
  UserCheck,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoreMetric {
  label: string;
  value: number | string;
  icon: typeof Briefcase;
  description: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

interface CoreEngineMetricsProps {
  activeFYPs: number;
  fundedFYPs: number;
  escrowVolume: string;
  completedMilestones: number;
  totalMilestones: number;
  trustScoreChange: number;
  hiringConversions: number;
  sponsorRetention: number;
  loading?: boolean;
  className?: string;
}

export function CoreEngineMetrics({
  activeFYPs,
  fundedFYPs,
  escrowVolume,
  completedMilestones,
  totalMilestones,
  trustScoreChange,
  hiringConversions,
  sponsorRetention,
  loading = false,
  className,
}: CoreEngineMetricsProps) {
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const fundingRate = activeFYPs > 0 ? (fundedFYPs / activeFYPs) * 100 : 0;

  const metrics: CoreMetric[] = [
    {
      label: "Active FYPs",
      value: activeFYPs,
      icon: Briefcase,
      description: "Projects in pipeline",
      trend: "stable",
    },
    {
      label: "Funded FYPs",
      value: fundedFYPs,
      icon: DollarSign,
      description: `${fundingRate.toFixed(0)}% funding rate`,
      trend: fundedFYPs > 0 ? "up" : "stable",
    },
    {
      label: "Escrow Volume",
      value: escrowVolume,
      icon: Lock,
      description: "Capital locked in escrow",
      trend: "up",
    },
    {
      label: "Milestones Done",
      value: `${completedMilestones}/${totalMilestones}`,
      icon: CheckCircle2,
      description: `${milestoneProgress.toFixed(0)}% completion`,
      trend: completedMilestones > 0 ? "up" : "stable",
    },
    {
      label: "Trust Δ",
      value: `${trustScoreChange >= 0 ? "+" : ""}${trustScoreChange.toFixed(1)}`,
      icon: Shield,
      description: "Score change this period",
      trend: trustScoreChange > 0 ? "up" : trustScoreChange < 0 ? "down" : "stable",
    },
    {
      label: "Hiring Conversions",
      value: hiringConversions,
      icon: UserCheck,
      description: "FYP → Employment",
      trend: hiringConversions > 0 ? "up" : "stable",
    },
    {
      label: "Sponsor Retention",
      value: `${sponsorRetention}%`,
      icon: TrendingUp,
      description: "Repeat funding sponsors",
      trend: sponsorRetention >= 50 ? "up" : "stable",
    },
  ];

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Core Engine Metrics</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          No vanity metrics
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="relative overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {metric.trend === "up" && (
                    <span className="text-[10px] font-medium text-primary">▲</span>
                  )}
                  {metric.trend === "down" && (
                    <span className="text-[10px] font-medium text-destructive">▼</span>
                  )}
                </div>
                <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
                <p className="text-xs font-medium text-foreground/80 mt-0.5">{metric.label}</p>
                <p className="text-[10px] text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Milestone Progress Bar */}
      {totalMilestones > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Milestone Execution</span>
              <span className="text-sm font-bold">{milestoneProgress.toFixed(0)}%</span>
            </div>
            <Progress value={milestoneProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedMilestones} of {totalMilestones} milestones completed across all active deals
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
