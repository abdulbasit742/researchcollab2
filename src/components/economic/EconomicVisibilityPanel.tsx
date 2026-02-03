import { useEconomicProfile, useTrustIncomeCorrelation, useMarketInsights } from "@/hooks/useEconomicVisibility";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  TrendingUp,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { formatPKR } from "@/lib/currency";

export function EconomicVisibilityPanel() {
  const { data: profile, isLoading: profileLoading } = useEconomicProfile();
  const { data: correlation, isLoading: corrLoading } = useTrustIncomeCorrelation();
  const { data: marketInsights, isLoading: marketLoading } = useMarketInsights();

  if (profileLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Economic Profile Not Available</h3>
          <p className="text-sm text-muted-foreground">
            Complete projects to see your economic visibility data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-500" />
          Economic Visibility
        </h2>
        <p className="text-sm text-muted-foreground">
          See how trust translates to economic opportunity.
        </p>
      </div>

      {/* Capital Account Summary */}
      <Card className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Professional Capital Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Lifetime Earnings</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatPKR(profile.capitalAccount.totalLifetimeEarnings)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">
                {formatPKR(profile.capitalAccount.currentBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Escrow</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatPKR(profile.capitalAccount.escrowBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {formatPKR(profile.capitalAccount.totalLifetimeSpent)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trust Economics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Trust Economics
            </CardTitle>
            <CardDescription>How your trust affects your economics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Trust Tier</span>
              <Badge variant="default" className="capitalize">
                {profile.trustEconomics.trustTier}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Access Level</span>
              <span className="text-sm font-medium">{profile.trustEconomics.accessLevel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Platform Fee Rate</span>
              <Badge variant={profile.trustEconomics.feeTier <= 8 ? "default" : "secondary"}>
                {profile.trustEconomics.feeTier}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Escrow Hold Time</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {profile.trustEconomics.escrowRequirement} hours
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Value of Reliability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Value of Reliability
            </CardTitle>
            <CardDescription>Benefits you've earned from high trust</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Fee Savings</span>
              <span className="text-sm font-bold text-emerald-600">
                +{formatPKR(profile.reliabilityValue.premiumEarned)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Time Saved</span>
              <span className="text-sm font-medium">
                {profile.reliabilityValue.timesSaved} hours
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Opportunities Unlocked</span>
              <span className="text-sm font-medium">
                {profile.reliabilityValue.opportunitiesUnlocked}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI & Costs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Performance ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg Project Earnings</span>
              <span className="font-medium">{formatPKR(profile.roi.averageProjectEarnings)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Success Rate</span>
              <Badge variant={profile.roi.projectSuccessRate >= 80 ? "default" : "secondary"}>
                {profile.roi.projectSuccessRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Costs & Losses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Platform Fees Paid</span>
              <span className="font-medium text-muted-foreground">
                {formatPKR(profile.costs.platformFeesPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dispute Losses</span>
              <span className={`font-medium ${profile.costs.disputeLosses > 0 ? "text-destructive" : ""}`}>
                {formatPKR(profile.costs.disputeLosses)}
              </span>
            </div>
            {profile.costs.opportunityCost > 0 && (
              <div className="flex items-center justify-between text-destructive">
                <span className="text-sm">Opportunity Cost (Low Trust)</span>
                <span className="font-medium">~{formatPKR(profile.costs.opportunityCost)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trust-Income Correlation */}
      {correlation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Platform Trust-Income Correlation
            </CardTitle>
            <CardDescription>
              How trust tiers affect earnings across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {correlation.tiers.map((tier) => (
                <div key={tier.tier} className="flex items-center gap-4">
                  <Badge variant={
                    tier.tier === "Platinum" ? "default" :
                    tier.tier === "Gold" ? "secondary" : "outline"
                  } className="w-20 justify-center">
                    {tier.tier}
                  </Badge>
                  <div className="flex-1">
                    <Progress value={(tier.avgMonthlyEarning / 150000) * 100} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-24 text-right">
                    {formatPKR(tier.avgMonthlyEarning)}/mo
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {correlation.insight}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      {marketInsights && marketInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Skills Market Insights</CardTitle>
            <CardDescription>Demand and rates for your proven skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketInsights.map((insight) => (
                <div key={insight.skill} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">{insight.skill}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant={
                      insight.demandLevel === "high" ? "default" :
                      insight.demandLevel === "medium" ? "secondary" : "outline"
                    }>
                      {insight.demandLevel} demand
                    </Badge>
                    <span className="text-muted-foreground">
                      Avg: {formatPKR(insight.averageRate)}
                    </span>
                    <span className="font-medium">
                      {insight.projectsAvailable} open
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
