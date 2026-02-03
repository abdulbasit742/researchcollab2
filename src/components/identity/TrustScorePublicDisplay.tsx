import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Briefcase,
  Star,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrustScorePublicDisplayProps {
  trustScore: number;
  trustTier: "bronze" | "silver" | "gold" | "platinum";
  trustTrajectory?: "rising" | "falling" | "stable";
  isVerified?: boolean;
  verificationLevel?: string;
  projectsCompleted?: number;
  successRate?: number;
  escrowSuccessRate?: number;
  onTimeRate?: number;
  disputeRate?: number;
  className?: string;
}

export function TrustScorePublicDisplay({
  trustScore,
  trustTier,
  trustTrajectory = "stable",
  isVerified = false,
  verificationLevel,
  projectsCompleted = 0,
  successRate = 0,
  escrowSuccessRate = 0,
  onTimeRate = 0,
  disputeRate = 0,
  className,
}: TrustScorePublicDisplayProps) {
  const getTierConfig = () => {
    switch (trustTier) {
      case "platinum":
        return {
          color: "from-violet-500 to-purple-600",
          textColor: "text-violet-600",
          bgColor: "bg-violet-500/10",
          borderColor: "border-violet-500/30",
          label: "Platinum",
          description: "Highest trust level with exceptional track record",
        };
      case "gold":
        return {
          color: "from-amber-400 to-yellow-500",
          textColor: "text-amber-600",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          label: "Gold",
          description: "Strong trust level with proven reliability",
        };
      case "silver":
        return {
          color: "from-slate-300 to-slate-400",
          textColor: "text-slate-600",
          bgColor: "bg-slate-500/10",
          borderColor: "border-slate-500/30",
          label: "Silver",
          description: "Growing trust level with good track record",
        };
      default:
        return {
          color: "from-orange-300 to-amber-400",
          textColor: "text-orange-600",
          bgColor: "bg-orange-500/10",
          borderColor: "border-orange-500/30",
          label: "Bronze",
          description: "Building trust through completed work",
        };
    }
  };

  const config = getTierConfig();

  const getTrajectoryDisplay = () => {
    switch (trustTrajectory) {
      case "rising":
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          text: "Rising",
          color: "text-emerald-600",
        };
      case "falling":
        return {
          icon: <TrendingDown className="h-4 w-4" />,
          text: "Declining",
          color: "text-red-600",
        };
      default:
        return {
          icon: <Minus className="h-4 w-4" />,
          text: "Stable",
          color: "text-muted-foreground",
        };
    }
  };

  const trajectory = getTrajectoryDisplay();

  const trustDimensions = [
    {
      label: "Project Success",
      value: successRate,
      icon: <Briefcase className="h-4 w-4" />,
      description: "Percentage of projects completed successfully",
    },
    {
      label: "On-Time Delivery",
      value: onTimeRate,
      icon: <Clock className="h-4 w-4" />,
      description: "Milestones delivered on schedule",
    },
    {
      label: "Escrow Success",
      value: escrowSuccessRate,
      icon: <DollarSign className="h-4 w-4" />,
      description: "Financial transactions completed without dispute",
    },
    {
      label: "Dispute-Free",
      value: Math.max(0, 100 - disputeRate),
      icon: <Shield className="h-4 w-4" />,
      description: "Work completed without disputes raised",
    },
  ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Trust Profile
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Trust scores are calculated from verified outcomes: project completions, on-time delivery, financial reliability, and dispute history. This score cannot be gamed or self-reported.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className={cn("p-4 rounded-lg border", config.bgColor, config.borderColor)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn("text-4xl font-bold", config.textColor)}>
                {trustScore}
              </div>
              <div>
                <Badge 
                  className={cn(
                    "bg-gradient-to-r text-white border-0 capitalize",
                    config.color
                  )}
                >
                  <Star className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-1 text-sm", trajectory.color)}>
              {trajectory.icon}
              <span>{trajectory.text}</span>
            </div>
          </div>
          <Progress value={trustScore} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>100</span>
          </div>
        </div>

        {/* Verification Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          {isVerified ? (
            <>
              <div className="p-2 rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Verified Professional</p>
                <p className="text-xs text-muted-foreground">
                  Identity and credentials verified
                  {verificationLevel && ` (${verificationLevel})`}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 rounded-full bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Not Yet Verified</p>
                <p className="text-xs text-muted-foreground">
                  Identity verification pending
                </p>
              </div>
            </>
          )}
        </div>

        {/* Trust Dimensions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Trust Breakdown</h4>
          {trustDimensions.map((dimension) => (
            <div key={dimension.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-2 text-muted-foreground">
                      {dimension.icon}
                      <span>{dimension.label}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{dimension.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="font-medium">{Math.round(dimension.value)}%</span>
              </div>
              <Progress value={dimension.value} className="h-1.5" />
            </div>
          ))}
        </div>

        {/* Track Record Summary */}
        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{projectsCompleted}</p>
              <p className="text-xs text-muted-foreground">Projects Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round(successRate)}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
