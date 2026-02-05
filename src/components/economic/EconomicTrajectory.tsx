/**
 * Economic Trajectory Component
 * Long-term economic memory visualization
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEconomicMemory } from "@/hooks/useEconomicMemory";
import { formatPKR } from "@/lib/currency";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles
} from "lucide-react";

export function EconomicTrajectory() {
  const { 
    trajectory, 
    loading, 
    getEarningsTrend, 
    getResilienceScore,
    healthIndicators,
    compareToPeers 
  } = useEconomicMemory();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!trajectory) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Economic History</h3>
          <p className="text-sm text-muted-foreground">
            Complete transactions to build your economic trajectory.
          </p>
        </CardContent>
      </Card>
    );
  }

  const peerComparison = compareToPeers();
  const { lifetimeMetrics, periodMetrics, stabilityScore, recoveryHistory, projections } = trajectory;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Economic Trajectory
        </CardTitle>
        <CardDescription>
          Your long-term economic performance and projections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Lifetime Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Lifetime Earnings</p>
                <p className="text-xl font-bold text-green-600">{formatPKR(lifetimeMetrics.totalEarnings)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Net Value</p>
                <p className="text-xl font-bold">{formatPKR(lifetimeMetrics.netValue)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Outcomes Delivered</p>
                <p className="text-xl font-bold">{lifetimeMetrics.outcomesDelivered}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Avg per Outcome</p>
                <p className="text-xl font-bold">{formatPKR(lifetimeMetrics.avgEarningsPerOutcome)}</p>
              </div>
            </div>

            {/* Trend Indicator */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                {getEarningsTrend.direction === "up" ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : getEarningsTrend.direction === "down" ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : (
                  <Minus className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">Earnings Trend</p>
                  <p className="text-xs text-muted-foreground">
                    {getEarningsTrend.direction === "up" 
                      ? `Growing ${getEarningsTrend.percentage.toFixed(1)}%` 
                      : getEarningsTrend.direction === "down"
                      ? `Declining ${getEarningsTrend.percentage.toFixed(1)}%`
                      : "Stable"}
                  </p>
                </div>
              </div>
              <Badge variant={
                getEarningsTrend.direction === "up" ? "default" : 
                getEarningsTrend.direction === "down" ? "destructive" : "secondary"
              }>
                {getEarningsTrend.direction === "up" ? "Growing" : 
                 getEarningsTrend.direction === "down" ? "Declining" : "Stable"}
              </Badge>
            </div>

            {/* Peer Comparison */}
            <div className="p-3 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Compared to Peers</span>
                <Badge variant="outline">
                  Top {100 - peerComparison.percentile}%
                </Badge>
              </div>
              <Progress value={peerComparison.percentile} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Category average: {formatPKR(peerComparison.avgInCategory)} per outcome
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {/* Period History */}
            <div className="space-y-2">
              {periodMetrics.map((period, i) => (
                <div key={period.period} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="w-20">
                    <p className="text-sm font-medium">{period.period}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{formatPKR(period.earnings)}</p>
                      {period.growthRate !== 0 && (
                        <Badge variant={period.growthRate > 0 ? "default" : "destructive"} className="text-xs">
                          {period.growthRate > 0 ? "+" : ""}{period.growthRate.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {period.outcomes} outcomes • +{period.valueUnitsEarned} VU
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${period.trustChange > 0 ? "text-green-600" : period.trustChange < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                      {period.trustChange > 0 ? "+" : ""}{period.trustChange} trust
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recovery History */}
            {recoveryHistory.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Recovery Events
                </p>
                <div className="space-y-2">
                  {recoveryHistory.map((event, i) => (
                    <div key={i} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">{event.type}</Badge>
                        {event.recoveredAt && (
                          <Badge variant="secondary" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Recovered in {event.recoveryDays} days
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Impact: {formatPKR(Math.abs(event.impactAmount))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="projections" className="space-y-4">
            {projections.map((projection) => (
              <div 
                key={projection.scenario} 
                className={`p-4 rounded-lg border ${
                  projection.scenario === "moderate" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <p className="font-medium capitalize">{projection.scenario} Scenario</p>
                  </div>
                  <Badge variant={
                    projection.confidence >= 0.7 ? "default" :
                    projection.confidence >= 0.4 ? "secondary" : "outline"
                  }>
                    {(projection.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Projected Earnings</p>
                    <p className="text-lg font-bold">{formatPKR(projection.projectedEarnings)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Projected Outcomes</p>
                    <p className="text-lg font-bold">{projection.projectedOutcomes}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Assumptions:</p>
                  <ul className="space-y-0.5">
                    {projection.assumptions.map((assumption, i) => (
                      <li key={i}>• {assumption}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            {healthIndicators && (
              <>
                {/* Overall Health */}
                <div className={`p-4 rounded-lg border ${
                  healthIndicators.overallHealth === "excellent" ? "bg-green-500/10 border-green-500/20" :
                  healthIndicators.overallHealth === "good" ? "bg-blue-500/10 border-blue-500/20" :
                  healthIndicators.overallHealth === "fair" ? "bg-amber-500/10 border-amber-500/20" :
                  "bg-red-500/10 border-red-500/20"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5" />
                    <p className="font-medium">Overall Economic Health</p>
                  </div>
                  <Badge variant={
                    healthIndicators.overallHealth === "excellent" ? "default" :
                    healthIndicators.overallHealth === "good" ? "secondary" :
                    healthIndicators.overallHealth === "fair" ? "outline" : "destructive"
                  } className="capitalize">
                    {healthIndicators.overallHealth.replace("_", " ")}
                  </Badge>
                </div>

                {/* Individual Indicators */}
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(healthIndicators)
                    .filter(([key]) => key !== "overallHealth")
                    .map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg border flex items-center justify-between">
                        <span className="text-sm capitalize">{key.replace("Health", "")}</span>
                        <Badge variant={
                          value === "healthy" ? "default" :
                          value === "stable" ? "secondary" : "destructive"
                        } className="capitalize">
                          {value === "needs_attention" ? "Needs Attention" : value}
                        </Badge>
                      </div>
                    ))}
                </div>

                {/* Stability & Resilience */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">Stability Score</p>
                    <div className="flex items-center gap-2">
                      <Progress value={stabilityScore} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{stabilityScore.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">Resilience Score</p>
                    <div className="flex items-center gap-2">
                      <Progress value={getResilienceScore} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{getResilienceScore.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Consistency */}
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Consistency Score</span>
                    <span className="text-sm font-medium">{lifetimeMetrics.consistencyScore}%</span>
                  </div>
                  <Progress value={lifetimeMetrics.consistencyScore} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {lifetimeMetrics.monthsActive} months of activity
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
