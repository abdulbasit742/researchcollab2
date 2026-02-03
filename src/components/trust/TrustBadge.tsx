import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  score: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  showTrend?: boolean;
  trend?: "up" | "down" | "stable";
}

const tierConfig = {
  platinum: { 
    label: "Platinum", 
    color: "text-purple-600", 
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    min: 80 
  },
  gold: { 
    label: "Gold", 
    color: "text-amber-600", 
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    min: 60 
  },
  silver: { 
    label: "Silver", 
    color: "text-gray-500", 
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    min: 40 
  },
  bronze: { 
    label: "Bronze", 
    color: "text-orange-600", 
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    min: 0 
  },
};

export function TrustBadge({ 
  score, 
  showScore = true, 
  size = "md",
  showTrend = false,
  trend = "stable",
}: TrustBadgeProps) {
  const tier = score >= 80 ? "platinum" : 
               score >= 60 ? "gold" : 
               score >= 40 ? "silver" : "bronze";
  const config = tierConfig[tier];

  const sizeClasses = {
    sm: "h-5 text-xs gap-0.5 px-1.5",
    md: "h-6 text-xs gap-1 px-2",
    lg: "h-7 text-sm gap-1.5 px-3",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="outline" 
            className={cn(
              "font-medium",
              sizeClasses[size],
              config.bg,
              config.border,
              config.color
            )}
          >
            <Shield className={iconSizes[size]} />
            {showScore && <span>{score}</span>}
            {showTrend && trend !== "stable" && (
              trend === "up" ? (
                <TrendingUp className={cn(iconSizes[size], "text-emerald-500")} />
              ) : (
                <TrendingDown className={cn(iconSizes[size], "text-destructive")} />
              )
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{config.label} Tier</p>
            <p className="text-xs text-muted-foreground">
              Trust Score: {score}/100
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
