import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePerformanceOutcomes } from "@/hooks/usePerformanceOutcomes";
import { BarChart3, TrendingUp, Shield, Users, AlertCircle, CheckCircle2 } from "lucide-react";

interface PerformanceCardProps {
  userId?: string;
  showPrivacyNotice?: boolean;
}

export function PerformanceCard({ userId, showPrivacyNotice = true }: PerformanceCardProps) {
  const { 
    profile, 
    computePerformance, 
    getImprovementSuggestions, 
    excludedMetrics 
  } = usePerformanceOutcomes(userId);

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-2 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const performance = computePerformance();
  const suggestions = getImprovementSuggestions();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "stable": return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case "declining": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Performance (Outcome-Based)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall score */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Performance</span>
            <div className="flex items-center gap-2">
              {getTrendIcon(profile.performanceTrend)}
              <Badge variant={profile.performanceTrend === "improving" ? "default" : "secondary"}>
                {profile.performanceTrend}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">{profile.overallPerformance}</span>
            <Progress value={profile.overallPerformance} className="h-3 flex-1" />
          </div>
        </div>

        {/* Metrics breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Outcomes</span>
            </div>
            <p className="text-lg font-semibold">{profile.outcomeMetrics.completedOutcomes}</p>
            <p className="text-xs text-muted-foreground">
              {profile.outcomeMetrics.successRate}% success rate
            </p>
          </div>
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Reliability</span>
            </div>
            <p className="text-lg font-semibold">{profile.reliabilityMetrics.onTimeDelivery}%</p>
            <p className="text-xs text-muted-foreground">on-time delivery</p>
          </div>
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Recovery</span>
            </div>
            <p className="text-lg font-semibold">{profile.recoveryMetrics.recoveryRate}%</p>
            <p className="text-xs text-muted-foreground">from setbacks</p>
          </div>
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Collaboration</span>
            </div>
            <p className="text-lg font-semibold">{profile.collaborationMetrics.teamOutcomes}</p>
            <p className="text-xs text-muted-foreground">team outcomes</p>
          </div>
        </div>

        {/* Improvement suggestions */}
        {suggestions.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Growth Opportunities</p>
            {suggestions.slice(0, 2).map((s, i) => (
              <div key={i} className="p-2 rounded bg-muted/50 mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{s.area}</span>
                  <Badge variant="outline" className="text-xs">+{s.potentialGain}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.suggestion}</p>
              </div>
            ))}
          </div>
        )}

        {/* Privacy notice */}
        {showPrivacyNotice && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              What we DON'T track
            </p>
            <div className="flex flex-wrap gap-1">
              {excludedMetrics.slice(0, 5).map((metric) => (
                <Badge key={metric} variant="outline" className="text-xs line-through opacity-50">
                  {metric}
                </Badge>
              ))}
              {excludedMetrics.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{excludedMetrics.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
