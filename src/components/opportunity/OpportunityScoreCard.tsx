import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOpportunityScore } from "@/hooks/useOpportunityGraph";
import { useOpportunityMultiplier } from "@/hooks/useOpportunityMultiplier";
import { Target, Shield, TrendingUp, Users, Zap, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const dimensions = [
  { key: "skill", label: "Skill Match", icon: Target, color: "text-blue-500" },
  { key: "trust", label: "Trust Fit", icon: Shield, color: "text-emerald-500" },
  { key: "outcomes", label: "Outcomes", icon: TrendingUp, color: "text-amber-500" },
  { key: "network", label: "Network", icon: Users, color: "text-purple-500" },
  { key: "readiness", label: "Readiness", icon: Zap, color: "text-rose-500" },
] as const;

export function OpportunityScoreCard() {
  const { data: score, isLoading } = useOpportunityScore();
  const { multiplier } = useOpportunityMultiplier();

  if (isLoading) {
    return (
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-20 bg-muted rounded-full w-20 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const overall = score?.overall ?? 0;

  return (
    <Card variant="glass">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Opportunity Score</CardTitle>
          {multiplier > 1 && (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {multiplier}x
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="hsl(var(--primary))" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overall / 100) * 264} 264`}
              />
            </svg>
            <span className="absolute text-2xl font-bold text-foreground">{overall}</span>
          </div>
        </div>

        <div className="space-y-2">
          {dimensions.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="flex items-center gap-2">
              <Icon className={`h-3.5 w-3.5 ${color} shrink-0`} />
              <span className="text-xs text-muted-foreground w-16">{label}</span>
              <Progress value={score?.[key as keyof typeof score] as number ?? 0} className="h-1.5 flex-1" />
              <span className="text-xs font-medium w-6 text-right">
                {score?.[key as keyof typeof score] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
