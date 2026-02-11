import { useVisibilityScore } from "@/hooks/useVisibilityScore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, TrendingUp, TrendingDown, Minus, RefreshCw, Award } from "lucide-react";

const dimensionLabels: Record<string, string> = {
  trust_score: "Trust Score",
  deal_success_rate: "Deal Success",
  collaboration_consistency: "Collaboration",
  dispute_score: "Dispute Record",
  institutional_weight: "Institutional",
  economic_contribution: "Economic Activity",
};

export function VisibilityScoreCard() {
  const { latest, latestLoading, compute, computing, trend, scoreIncreased } = useVisibilityScore();

  if (latestLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  const score = latest?.visibility_score ?? 0;
  const breakdown = latest?.breakdown;
  const isTopTrusted = score >= 80;

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Visibility Score
            {isTopTrusted && (
              <Badge variant="success" className="text-[10px] gap-0.5">
                <Award className="h-2.5 w-2.5" />
                Top Trusted
              </Badge>
            )}
            {scoreIncreased && (
              <Badge variant="info" className="text-[10px] gap-0.5 animate-bounce-subtle">
                ↑ Increased
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => compute()} disabled={computing}>
            <RefreshCw className={`h-3.5 w-3.5 ${computing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Score Display */}
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold">{score}</div>
          <div className="text-sm text-muted-foreground">/100</div>
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
        </div>
        <Progress value={score} className="h-2" />

        {/* Breakdown */}
        {breakdown && (
          <div className="space-y-1.5 pt-1">
            {Object.entries(breakdown).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{dimensionLabels[key] || key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary rounded-full h-1.5 transition-all"
                      style={{ width: `${Math.min(val.raw, 100)}%` }}
                    />
                  </div>
                  <span className="font-medium w-8 text-right">{val.weighted}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!latest && (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground mb-2">No visibility score yet</p>
            <Button size="sm" variant="outline" onClick={() => compute()} disabled={computing}>
              Compute Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
