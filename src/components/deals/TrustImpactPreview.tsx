import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustImpactPreviewProps {
  currentScore: number;
  estimatedImpact: number;
  dealStatus: string;
}

export function TrustImpactPreview({
  currentScore,
  estimatedImpact,
  dealStatus,
}: TrustImpactPreviewProps) {
  const projectedScore = Math.min(100, Math.max(0, currentScore + estimatedImpact));
  const isPositive = estimatedImpact > 0;
  const isNegative = estimatedImpact < 0;
  const isDisputed = dealStatus === "disputed";
  const isCompleted = dealStatus === "completed";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Trust Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Score */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Current Trust Score</p>
          <p className="text-3xl font-bold">{currentScore}</p>
        </div>

        {/* Projected Impact */}
        {estimatedImpact !== 0 && (
          <div className={cn(
            "p-3 rounded-lg text-center",
            isPositive && "bg-emerald-500/10",
            isNegative && "bg-destructive/10"
          )}>
            <div className="flex items-center justify-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <span className={cn(
                "text-lg font-semibold",
                isPositive && "text-emerald-600",
                isNegative && "text-destructive"
              )}>
                {isPositive ? "+" : ""}{estimatedImpact}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isPositive ? "Estimated gain on completion" : "Impact from this outcome"}
            </p>
          </div>
        )}

        {/* Status-based Messages */}
        {isDisputed && (
          <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-md text-destructive text-sm">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>
              <p className="font-medium">Dispute Active</p>
              <p className="text-xs">Trust impact depends on resolution.</p>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="flex items-start gap-2 p-2 bg-emerald-500/10 rounded-md text-emerald-600 text-sm">
            <TrendingUp className="h-4 w-4 mt-0.5" />
            <div>
              <p className="font-medium">Deal Completed</p>
              <p className="text-xs">+{estimatedImpact} trust points earned!</p>
            </div>
          </div>
        )}

        {/* Trust Tier Preview */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            {projectedScore >= 80 ? "Platinum" : 
             projectedScore >= 60 ? "Gold" : 
             projectedScore >= 40 ? "Silver" : "Bronze"} Tier
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
