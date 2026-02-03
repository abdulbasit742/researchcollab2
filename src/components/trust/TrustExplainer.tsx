import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Building2,
  ArrowRight,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrustBreakdownItem {
  label: string;
  value: number;
  maxValue: number;
  icon: React.ElementType;
  description: string;
  improvement?: string;
}

interface TrustExplainerProps {
  trustScore: number;
  trustTier: "platinum" | "gold" | "silver" | "bronze";
  breakdown: {
    delivery: number;
    financial: number;
    collaboration: number;
    institutional: number;
    consistency: number;
  };
  trend: "up" | "down" | "stable";
  lastUpdated?: string;
  showActions?: boolean;
}

export function TrustExplainer({
  trustScore,
  trustTier,
  breakdown,
  trend,
  lastUpdated,
  showActions = true,
}: TrustExplainerProps) {
  const tierColors = {
    platinum: "bg-violet-500/10 text-violet-600 border-violet-500/30",
    gold: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    silver: "bg-slate-400/10 text-slate-600 border-slate-400/30",
    bronze: "bg-orange-600/10 text-orange-600 border-orange-600/30",
  };

  const trendConfig = {
    up: { icon: TrendingUp, color: "text-emerald-500", label: "Improving" },
    down: { icon: TrendingDown, color: "text-red-500", label: "Declining" },
    stable: { icon: Minus, color: "text-muted-foreground", label: "Stable" },
  };

  const TrendIcon = trendConfig[trend].icon;

  const breakdownItems: TrustBreakdownItem[] = [
    {
      label: "Delivery Reliability",
      value: breakdown.delivery,
      maxValue: 40,
      icon: CheckCircle,
      description: "Projects completed on time and to specification",
      improvement: "Complete more projects successfully",
    },
    {
      label: "Financial Reliability",
      value: breakdown.financial,
      maxValue: 25,
      icon: DollarSign,
      description: "Escrow success rate and payment history",
      improvement: "Maintain clean escrow transactions",
    },
    {
      label: "Collaboration Quality",
      value: breakdown.collaboration,
      maxValue: 15,
      icon: Users,
      description: "Positive feedback from collaborators",
      improvement: "Work well with others, respond promptly",
    },
    {
      label: "Institutional Verification",
      value: breakdown.institutional,
      maxValue: 10,
      icon: Building2,
      description: "Verified affiliations with institutions",
      improvement: "Get verified by your institution",
    },
    {
      label: "Consistency",
      value: breakdown.consistency,
      maxValue: 10,
      icon: Clock,
      description: "Stable activity over time (2% decay per 30 days inactive)",
      improvement: "Stay active on the platform",
    },
  ];

  const totalBreakdown = breakdownItems.reduce((sum, item) => sum + item.value, 0);
  const lowestItem = breakdownItems.reduce((min, item) => 
    (item.value / item.maxValue) < (min.value / min.maxValue) ? item : min
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Trust Score Explained
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Your trust score is calculated from verified outcomes, not claims.
                Failures hurt 2x more than success helps. Score decays 2% for every 30 days of inactivity.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Main Score */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{trustScore}</span>
            </div>
            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-background border ${trendConfig[trend].color}`}>
              <TrendIcon className="h-3 w-3" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={tierColors[trustTier]}>
                {trustTier.charAt(0).toUpperCase() + trustTier.slice(1)} Tier
              </Badge>
              <span className={`text-xs ${trendConfig[trend].color}`}>
                {trendConfig[trend].label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {trustScore >= 80 && "Excellent standing. Access to premium opportunities."}
              {trustScore >= 60 && trustScore < 80 && "Good standing. Most features unlocked."}
              {trustScore >= 40 && trustScore < 60 && "Building reputation. Keep delivering."}
              {trustScore < 40 && "New or recovering. Complete work to build trust."}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          {breakdownItems.map((item) => {
            const Icon = item.icon;
            const percentage = Math.round((item.value / item.maxValue) * 100);
            
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="font-medium text-xs mb-1">{item.description}</p>
                      {item.improvement && (
                        <p className="text-xs text-muted-foreground">
                          To improve: {item.improvement}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                  <span className="font-medium">
                    {item.value}/{item.maxValue}
                  </span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </div>
            );
          })}
        </div>

        {/* Improvement Hint */}
        {lowestItem && (
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-foreground mb-0.5">
                  Improvement opportunity
                </p>
                <p className="text-muted-foreground">
                  {lowestItem.label} is your weakest area. {lowestItem.improvement}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs gap-1" asChild>
              <Link to="/progress">
                View Full Trust Dashboard
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <p className="text-[10px] text-center text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
