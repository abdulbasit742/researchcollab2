/**
 * Value Unit Display Component
 * Shows value unit balance, tier, and progress
 */

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useValueUnits } from "@/hooks/useValueUnits";
import { Sparkles, TrendingUp, Award, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TIER_COLORS = {
  emerging: "bg-slate-500",
  established: "bg-blue-500",
  trusted: "bg-green-500",
  distinguished: "bg-purple-500",
  exemplary: "bg-amber-500",
};

const TIER_LABELS = {
  emerging: "Emerging",
  established: "Established",
  trusted: "Trusted",
  distinguished: "Distinguished",
  exemplary: "Exemplary",
};

export function ValueUnitDisplay() {
  const { balance, tierBenefits, loading, contributionValues } = useValueUnits();

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Complete your first outcome to start earning Value Units
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Value Units
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Value Units represent your verified contribution weight. 
                  They're non-transferable and influence your access, visibility, and economics on the platform.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Historical contribution weight</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance and Tier */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{balance.currentBalance.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">VU Balance</p>
          </div>
          <Badge className={`${TIER_COLORS[balance.tier]} text-white`}>
            <Award className="h-3 w-3 mr-1" />
            {TIER_LABELS[balance.tier]}
          </Badge>
        </div>

        {/* Progress to next tier */}
        {balance.tier !== "exemplary" && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to next tier</span>
              <span>{balance.percentToNextTier.toFixed(0)}%</span>
            </div>
            <Progress value={balance.percentToNextTier} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {(balance.nextTierThreshold - balance.currentBalance).toFixed(0)} VU needed
            </p>
          </div>
        )}

        {/* Category breakdown */}
        <div className="pt-2 border-t">
          <p className="text-xs font-medium mb-2">Top Contributions</p>
          <div className="space-y-1">
            {Object.entries(balance.categoryBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([category, value]) => (
                <div key={category} className="flex justify-between text-xs">
                  <span className="text-muted-foreground capitalize">
                    {category.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium">{value.toFixed(0)} VU</span>
                </div>
              ))}
          </div>
        </div>

        {/* Tier benefits */}
        {tierBenefits && tierBenefits.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Your Benefits
            </p>
            <ul className="space-y-1">
              {tierBenefits.slice(0, 3).map((benefit, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span className="text-green-500">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ValueUnitMini() {
  const { balance, loading } = useValueUnits();

  if (loading || !balance) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
            <Sparkles className="h-3 w-3" />
            <span>{balance.currentBalance.toFixed(0)} VU</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Value Units: {balance.currentBalance.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground capitalize">{balance.tier} tier</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
