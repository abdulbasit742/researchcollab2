import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Shield,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Briefcase,
  Star,
  Ban,
  Info,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBreakdown {
  verification_status: number;
  completed_offers: number;
  on_time_delivery_rate: number;
  dispute_free_history: number;
  ratings_score: number;
  financial_reliability: number;
}

interface TrustEngineDisplayProps {
  totalScore: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  breakdown?: TrustBreakdown;
  lastUpdated?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  isCompact?: boolean;
}

const TIER_CONFIG = {
  bronze: {
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-950/50",
    borderColor: "border-orange-200 dark:border-orange-900",
    icon: Shield,
    label: "Bronze",
    minScore: 0,
    maxScore: 39,
  },
  silver: {
    color: "text-slate-600 dark:text-slate-300",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    borderColor: "border-slate-200 dark:border-slate-700",
    icon: Shield,
    label: "Silver",
    minScore: 40,
    maxScore: 59,
  },
  gold: {
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-950/50",
    borderColor: "border-amber-200 dark:border-amber-900",
    icon: ShieldCheck,
    label: "Gold",
    minScore: 60,
    maxScore: 79,
  },
  platinum: {
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950/50",
    borderColor: "border-purple-200 dark:border-purple-900",
    icon: ShieldCheck,
    label: "Platinum",
    minScore: 80,
    maxScore: 100,
  },
};

const BREAKDOWN_ITEMS = [
  { key: "verification_status" as const, label: "Verification", max: 30, icon: CheckCircle },
  { key: "completed_offers" as const, label: "Work Completed", max: 20, icon: Briefcase },
  { key: "on_time_delivery_rate" as const, label: "On-Time Delivery", max: 15, icon: Clock },
  { key: "dispute_free_history" as const, label: "Dispute-Free", max: 15, icon: Shield },
  { key: "ratings_score" as const, label: "Peer Ratings", max: 10, icon: Star },
  { key: "financial_reliability" as const, label: "Financial Reliability", max: 10, icon: Zap },
];

export function TrustEngineDisplay({
  totalScore,
  tier,
  breakdown,
  lastUpdated,
  trend,
  trendValue,
  isCompact = false,
}: TrustEngineDisplayProps) {
  const config = TIER_CONFIG[tier];
  const TierIcon = config.icon;

  // Calculate score to next tier
  const nextTier = tier === "bronze" ? "silver" : tier === "silver" ? "gold" : tier === "gold" ? "platinum" : null;
  const scoreToNextTier = nextTier ? TIER_CONFIG[nextTier].minScore - totalScore : 0;

  if (isCompact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg border", config.bgColor, config.borderColor)}>
        <div className="relative">
          <TierIcon className={cn("h-8 w-8", config.color)} />
          <span className={cn("absolute -bottom-1 -right-1 text-xs font-bold", config.color)}>
            {totalScore}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold text-sm", config.color)}>{config.label} Trust</span>
            {trend && (
              <TrendIndicator trend={trend} value={trendValue} />
            )}
          </div>
          {nextTier && scoreToNextTier > 0 && (
            <p className="text-xs text-muted-foreground">
              {scoreToNextTier} points to {TIER_CONFIG[nextTier].label}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-2", config.borderColor)}>
      <CardHeader className={cn("pb-4", config.bgColor)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TierIcon className={cn("h-6 w-6", config.color)} />
            Trust Engine
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Trust is earned through outcomes, not social engagement. Scores decay with inactivity and cannot be bought or gamed.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {/* Score Circle */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                strokeWidth="8"
                className="stroke-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={cn(
                  tier === "bronze" && "stroke-orange-500",
                  tier === "silver" && "stroke-slate-500",
                  tier === "gold" && "stroke-amber-500",
                  tier === "platinum" && "stroke-purple-500"
                )}
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - totalScore / 100)}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-4xl font-bold", config.color)}>{totalScore}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge className={cn("text-sm px-3 py-1", config.bgColor, config.color)}>
              {config.label} Tier
            </Badge>
            {trend && <TrendIndicator trend={trend} value={trendValue} />}
          </div>

          {nextTier && scoreToNextTier > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {scoreToNextTier} points to {TIER_CONFIG[nextTier].label}
            </p>
          )}
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Score Breakdown</h4>
            {BREAKDOWN_ITEMS.map((item) => {
              const value = breakdown[item.key] || 0;
              const percentage = (value / item.max) * 100;
              const Icon = item.icon;
              
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                    <span className="font-medium">
                      {value}/{item.max}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}

        {/* Trust Rules */}
        <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-500" />
            <span>Trust decays 2% per 90 days of inactivity</span>
          </div>
          <div className="flex items-start gap-2">
            <Ban className="h-3.5 w-3.5 mt-0.5 text-destructive" />
            <span>Disputes and failed escrows permanently impact score</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-3.5 w-3.5 mt-0.5 text-emerald-500" />
            <span>Only outcomes matter—likes and followers have zero effect</span>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last updated: {new Date(lastUpdated).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TrendIndicator({ trend, value }: { trend: "up" | "down" | "stable"; value?: number }) {
  if (trend === "stable") return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs gap-1",
        trend === "up" ? "text-emerald-600 border-emerald-200" : "text-destructive border-destructive/30"
      )}
    >
      {trend === "up" ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {value && `${trend === "up" ? "+" : ""}${value}`}
    </Badge>
  );
}
