import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useReadinessEngine } from "@/hooks/useReadinessEngine";
import { Target, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import type { ResponsibilityLevel } from "@/types/human-capital";

interface ReadinessIndicatorProps {
  userId?: string;
  showDetails?: boolean;
}

const LEVEL_LABELS: Record<ResponsibilityLevel, string> = {
  individual_execution: "Individual Execution",
  team_leadership: "Team Leadership",
  project_ownership: "Project Ownership",
  institutional_responsibility: "Institutional Responsibility",
  policy_influence: "Policy Influence",
};

export function ReadinessIndicator({ userId, showDetails = true }: ReadinessIndicatorProps) {
  const { profile, summary, getBlockers, getNextLevelRequirements } = useReadinessEngine(userId);

  if (!profile || !summary) {
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

  const highestLevel = summary.highestReadyLevel;
  const nextRequirements = getNextLevelRequirements(highestLevel);
  const blockers = getBlockers(nextRequirements.level);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Responsibility Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current highest level */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Ready for</p>
              <p className="font-medium">{LEVEL_LABELS[highestLevel]}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Readiness scores by level */}
        {showDetails && (
          <div className="space-y-3">
            {profile.scores.map((score) => {
              const avgReadiness = (score.readinessRange[0] + score.readinessRange[1]) / 2;
              const isReady = score.readinessRange[0] >= 60;

              return (
                <div key={score.level} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{LEVEL_LABELS[score.level]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {score.readinessRange[0]}-{score.readinessRange[1]}%
                      </span>
                      {isReady ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={avgReadiness} 
                    className={`h-2 ${isReady ? "" : "opacity-60"}`} 
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Next level requirements */}
        {nextRequirements && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              To reach {LEVEL_LABELS[nextRequirements.level]}
            </p>
            <ul className="space-y-1">
              {nextRequirements.requirements.slice(0, 3).map((req, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <ChevronRight className="h-3 w-3 mt-1 text-muted-foreground shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Estimated: {nextRequirements.estimatedTimeToReady}
            </p>
          </div>
        )}

        {/* Blockers */}
        {blockers.length > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Blockers to address
            </p>
            {blockers.map((blocker, i) => (
              <div key={i} className="text-sm p-2 rounded bg-yellow-500/10 border border-yellow-500/20 mb-2">
                <p className="font-medium">{blocker.blocker}</p>
                <p className="text-xs text-muted-foreground mt-1">{blocker.remediation}</p>
              </div>
            ))}
          </div>
        )}

        {/* Trajectory */}
        <div className="flex items-center justify-between pt-2 border-t text-sm">
          <span className="text-muted-foreground">Overall trajectory</span>
          <Badge variant={summary.overallTrajectory === "ascending" ? "default" : "secondary"}>
            {summary.overallTrajectory}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
