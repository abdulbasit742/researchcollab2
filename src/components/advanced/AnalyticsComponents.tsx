import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, TrendingDown, Target, BarChart3, Activity, Zap, Award,
  Globe, Users, DollarSign, Clock, Star, ChevronRight, AlertTriangle,
  CheckCircle, Lightbulb, Calendar, ArrowRight, Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCareerAnalytics, useMarketIntelligence, useBenchmarking, usePredictiveInsights, useGoalTracking, useActivityHeatmap } from "@/hooks/useAnalyticsIntelligence";

// Career Metrics Dashboard
export function CareerMetricsDashboard() {
  const { metrics, snapshot, skillDemand, topOpportunities, skillGaps } = useCareerAnalytics();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Career Metrics
        </CardTitle>
        <CardDescription>
          Your professional performance overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Trust Score</span>
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold">{metrics.trustScore}</p>
            <p className="text-xs text-emerald-500">+{metrics.trustTrend}% this month</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Projects</span>
              <CheckCircle className="h-3 w-3 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold">{metrics.projectsCompleted}</p>
            <p className="text-xs text-muted-foreground">{metrics.projectSuccessRate}% success rate</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Earnings</span>
              <DollarSign className="h-3 w-3 text-amber-500" />
            </div>
            <p className="text-2xl font-bold">PKR {metrics.totalEarnings.toLocaleString()}</p>
            <p className="text-xs text-emerald-500">+{metrics.earningsTrend}% this quarter</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Network</span>
              <Users className="h-3 w-3 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{metrics.networkSize}</p>
            <p className="text-xs text-emerald-500">+{metrics.networkGrowth}% growth</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Top Opportunities (By Your Skills)</h4>
          <div className="space-y-2">
            {topOpportunities.map((skill) => (
              <div key={skill.skill} className="flex items-center justify-between p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                <div>
                  <span className="font-medium text-sm">{skill.skill}</span>
                  <p className="text-xs text-muted-foreground">
                    {skill.projectCount} projects • ${skill.averageRate}/hr avg
                  </p>
                </div>
                <Badge variant="outline" className="text-emerald-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {skill.demandLevel}% demand
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {skillGaps.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Skill Gaps
            </h4>
            <div className="space-y-2">
              {skillGaps.slice(0, 2).map((skill) => (
                <div key={skill.skill} className="flex items-center justify-between p-2 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <div>
                    <span className="font-medium text-sm">{skill.skill}</span>
                    <p className="text-xs text-muted-foreground">
                      Your level: {skill.yourProficiency}% • Market demand: {skill.demandLevel}%
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">Learn</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Market Intelligence Panel
export function MarketIntelligencePanel() {
  const { trends, competitors, forecasts } = useMarketIntelligence();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Market Intelligence
        </CardTitle>
        <CardDescription>
          Industry trends and opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="trends">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="competition">Competition</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="mt-4">
            <ScrollArea className="h-56">
              <div className="space-y-3">
                {trends.map((trend) => (
                  <div key={trend.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{trend.category}</Badge>
                      <div className="flex items-center gap-1">
                        {trend.direction === "up" ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        )}
                        <span className="text-xs font-medium">{trend.magnitude}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{trend.trend}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {trend.implications[0]}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{trend.timeframe}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(trend.confidence * 100)}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="competition" className="mt-4">
            <ScrollArea className="h-56">
              <div className="space-y-2">
                {competitors.map((comp, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{comp.segment}</span>
                      <Badge variant={
                        comp.supplyLevel === "undersupplied" ? "default" :
                        comp.supplyLevel === "oversupplied" ? "destructive" : "secondary"
                      } className="text-xs">
                        {comp.supplyLevel}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Avg Trust</p>
                        <p className="font-medium">{comp.averageTrustScore}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Rate</p>
                        <p className="font-medium">${comp.averageRate}/hr</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Growth</p>
                        <p className="font-medium text-emerald-500">+{comp.growthRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="forecast" className="mt-4">
            <ScrollArea className="h-56">
              <div className="space-y-3">
                {forecasts.map((forecast, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{forecast.category}</span>
                      <Badge variant="outline" className={cn(
                        forecast.budgetTrend === "increasing" ? "text-emerald-600" :
                        forecast.budgetTrend === "decreasing" ? "text-destructive" : ""
                      )}>
                        {forecast.budgetTrend === "increasing" ? <TrendingUp className="h-3 w-3 mr-1" /> : null}
                        PKR {forecast.averageBudget.toLocaleString()} avg
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{forecast.currentVolume}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-sm font-medium text-primary">{forecast.projectedVolume}</span>
                      <Badge className="text-xs">+{forecast.projectedGrowth}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Peak seasons: {forecast.peakSeason.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Benchmarking Panel
export function BenchmarkingPanel() {
  const { benchmarks, peerGroups, selectPeerGroup, overallPercentile, strengthAreas, improvementAreas } = useBenchmarking();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Benchmarking
        </CardTitle>
        <CardDescription>
          Compare with your peers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Overall Percentile</p>
          <p className="text-4xl font-bold text-primary">{overallPercentile}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            You outperform {overallPercentile}% of your peers
          </p>
        </div>

        <div className="space-y-2">
          {benchmarks.slice(0, 4).map((benchmark) => (
            <div key={benchmark.metric} className="flex items-center gap-3">
              <div className="w-24 text-sm truncate">{benchmark.metric}</div>
              <div className="flex-1">
                <div className="relative h-2 bg-muted rounded-full">
                  <div
                    className="absolute h-2 bg-muted-foreground/30 rounded-full"
                    style={{ width: `${(benchmark.peerAverage / benchmark.topPerformer) * 100}%` }}
                  />
                  <div
                    className={cn(
                      "absolute h-2 rounded-full",
                      benchmark.trend === "above" ? "bg-emerald-500" :
                      benchmark.trend === "below" ? "bg-amber-500" : "bg-primary"
                    )}
                    style={{ width: `${(benchmark.yourValue / benchmark.topPerformer) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right">
                <span className={cn(
                  "text-sm font-medium",
                  benchmark.trend === "above" ? "text-emerald-600" :
                  benchmark.trend === "below" ? "text-amber-600" : ""
                )}>
                  {benchmark.percentile}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <h4 className="text-xs font-medium text-emerald-600 mb-2">Strengths</h4>
            {strengthAreas.slice(0, 2).map((area, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {area}</p>
            ))}
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <h4 className="text-xs font-medium text-amber-600 mb-2">To Improve</h4>
            {improvementAreas.slice(0, 2).map((area, i) => (
              <p key={i} className="text-xs text-muted-foreground">• {area.metric}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Predictive Insights Panel
export function PredictiveInsightsPanel() {
  const { insights, scenarios, criticalInsights } = usePredictiveInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "opportunity": return Zap;
      case "risk": return AlertTriangle;
      case "milestone": return Award;
      case "trend": return TrendingUp;
      default: return Lightbulb;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Predictive Insights
        </CardTitle>
        <CardDescription>
          AI-powered forecasts for your career
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div key={insight.id} className={cn(
                  "p-3 rounded-lg border",
                  insight.impact === "critical" || insight.impact === "high"
                    ? "border-primary/50 bg-primary/5"
                    : ""
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center",
                      insight.type === "opportunity" ? "bg-emerald-500/20" :
                      insight.type === "risk" ? "bg-destructive/20" :
                      insight.type === "milestone" ? "bg-amber-500/20" : "bg-blue-500/20"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        insight.type === "opportunity" ? "text-emerald-600" :
                        insight.type === "risk" ? "text-destructive" :
                        insight.type === "milestone" ? "text-amber-600" : "text-blue-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="capitalize text-xs">{insight.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                      {insight.suggestedActions.length > 0 && (
                        <div className="mt-2">
                          <Button size="sm" variant="outline" className="h-6 text-xs gap-1">
                            View Actions <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Goal Tracking Panel
export function GoalTrackingPanel() {
  const { goals, updateProgress, overallProgress } = useGoalTracking();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Goals
        </CardTitle>
        <CardDescription>
          Track your professional objectives
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <ScrollArea className="h-48">
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{goal.title}</h4>
                  <Badge variant={
                    goal.status === "completed" ? "default" :
                    goal.status === "on_track" ? "secondary" :
                    goal.status === "at_risk" ? "outline" : "destructive"
                  } className={cn(
                    "text-xs",
                    goal.status === "at_risk" && "border-amber-500 text-amber-600",
                    goal.status === "behind" && "border-destructive text-destructive"
                  )}>
                    {goal.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={(goal.currentValue / goal.targetValue) * 100} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground">
                    {goal.currentValue}/{goal.targetValue} {goal.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{goal.category}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Button className="w-full" variant="outline">
          Add Goal
        </Button>
      </CardContent>
    </Card>
  );
}

// Activity Heatmap
export function ActivityHeatmapPanel() {
  const { activityData, summary } = useActivityHeatmap();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Activity
        </CardTitle>
        <CardDescription>
          Your professional activity over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-muted/50 rounded-lg text-center">
            <p className="text-lg font-bold">{summary.totalActivities}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg text-center">
            <p className="text-lg font-bold">{summary.averageDaily}</p>
            <p className="text-[10px] text-muted-foreground">Daily Avg</p>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg text-center">
            <p className="text-lg font-bold text-amber-600">{summary.streakCurrent}</p>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-center">
            <p className="text-lg font-bold text-emerald-600">{summary.streakLongest}</p>
            <p className="text-[10px] text-muted-foreground">Best</p>
          </div>
        </div>

        {/* Simplified heatmap visualization */}
        <div className="grid grid-cols-52 gap-0.5">
          {activityData.slice(-52 * 7).map((day, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded-sm",
                day.count === 0 ? "bg-muted" :
                day.count <= 2 ? "bg-emerald-200 dark:bg-emerald-900" :
                day.count <= 5 ? "bg-emerald-400 dark:bg-emerald-700" :
                day.count <= 8 ? "bg-emerald-500 dark:bg-emerald-600" : "bg-emerald-600 dark:bg-emerald-500"
              )}
              title={`${day.date}: ${day.count} activities`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Most active: {summary.mostActiveDay}</span>
          <span>Top activity: {summary.mostActiveType}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Combined Analytics Dashboard
export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <CareerMetricsDashboard />
        <MarketIntelligencePanel />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <BenchmarkingPanel />
        <PredictiveInsightsPanel />
        <GoalTrackingPanel />
      </div>
      <ActivityHeatmapPanel />
    </div>
  );
}
