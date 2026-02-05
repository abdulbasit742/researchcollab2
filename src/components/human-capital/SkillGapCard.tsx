import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSkillGapEngine } from "@/hooks/useSkillGapEngine";
import { AlertTriangle, TrendingDown, TrendingUp, Minus, BookOpen } from "lucide-react";

interface SkillGapCardProps {
  entityId?: string;
  showReskilling?: boolean;
}

export function SkillGapCard({ entityId, showReskilling = true }: SkillGapCardProps) {
  const { gaps, summary, getRecommendedPaths, findMentors } = useSkillGapEngine(entityId);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-700 border-red-500/30";
      case "moderate": return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "minor": return "bg-blue-500/20 text-blue-700 border-blue-500/30";
      default: return "bg-muted";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "widening": return <TrendingDown className="h-3 w-3 text-red-500" />;
      case "narrowing": return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "stable": return <Minus className="h-3 w-3 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          Skill Gaps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-muted/50">
            <p className="font-semibold">{summary.totalGaps}</p>
            <p className="text-muted-foreground">Total</p>
          </div>
          <div className="p-2 rounded bg-red-500/10">
            <p className="font-semibold text-red-700">{summary.criticalGaps}</p>
            <p className="text-muted-foreground">Critical</p>
          </div>
          <div className="p-2 rounded bg-yellow-500/10">
            <p className="font-semibold text-yellow-700">{summary.emergingRisks}</p>
            <p className="text-muted-foreground">Emerging</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="font-semibold">{summary.activeReskillingPaths}</p>
            <p className="text-muted-foreground">Learning</p>
          </div>
        </div>

        {/* Gap list */}
        <div className="space-y-3">
          {gaps.map((gap) => (
            <div key={gap.id} className={`p-3 rounded-lg border ${getSeverityColor(gap.gapSeverity)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{gap.capability}</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(gap.trend)}
                  <Badge variant="outline" className="text-xs">
                    {gap.gapSeverity}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Current: {gap.currentStrength}%</span>
                  <span>Required: {gap.requiredStrength}%</span>
                </div>
                <div className="relative">
                  <Progress value={gap.requiredStrength} className="h-2 opacity-30" />
                  <Progress 
                    value={gap.currentStrength} 
                    className="h-2 absolute top-0 left-0" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reskilling paths */}
        {showReskilling && gaps.filter(g => g.gapSeverity !== "minor").length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Recommended Learning
            </p>
            {gaps
              .filter(g => g.gapSeverity !== "minor")
              .slice(0, 2)
              .map((gap) => {
                const mentors = findMentors(gap.capability);
                return (
                  <div key={gap.id} className="p-2 rounded bg-muted/50 mb-2">
                    <p className="text-sm font-medium">{gap.capability}</p>
                    <p className="text-xs text-muted-foreground">
                      {mentors.length} mentors available
                    </p>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
