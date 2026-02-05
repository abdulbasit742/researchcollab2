import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCareerEvolution } from "@/hooks/useCareerEvolution";
import { Compass, ArrowRight, Users, BookOpen, TrendingUp } from "lucide-react";

interface CareerEvolutionCardProps {
  userId?: string;
  showPivotOptions?: boolean;
}

const PHASE_LABELS: Record<string, string> = {
  early_career: "Early Career",
  growth: "Growth",
  peak: "Peak",
  transition: "Transition",
  late_career: "Late Career",
  post_retirement: "Post-Retirement",
};

export function CareerEvolutionCard({ userId, showPivotOptions = true }: CareerEvolutionCardProps) {
  const { 
    profile, 
    summary, 
    explorePivotOptions, 
    getMentorshipProfile 
  } = useCareerEvolution(userId);

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

  const pivotOptions = explorePivotOptions();
  const mentorship = getMentorshipProfile();

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case "ascending": return "text-green-600 bg-green-500/10";
      case "lateral": return "text-blue-600 bg-blue-500/10";
      case "pivoting": return "text-purple-600 bg-purple-500/10";
      case "winding_down": return "text-orange-600 bg-orange-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          Career Evolution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current phase */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground">Current Phase</p>
            <p className="font-medium">{PHASE_LABELS[summary.currentPhase]}</p>
          </div>
          <Badge className={getDirectionColor(summary.trajectoryDirection)}>
            {summary.trajectoryDirection}
          </Badge>
        </div>

        {/* Trajectory */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Projected Trajectory</p>
          <div className="flex items-center gap-2">
            {profile.trajectory.projectedPhases.slice(0, 3).map((phase, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="p-2 rounded bg-muted/50 text-center">
                  <p className="text-xs font-medium">{PHASE_LABELS[phase.phase]}</p>
                  <p className="text-xs text-muted-foreground">{phase.estimatedStart}</p>
                </div>
                {i < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>

        {/* Pivot history */}
        {summary.pivotsCompleted > 0 && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {summary.pivotsCompleted} successful pivot{summary.pivotsCompleted > 1 ? "s" : ""}
            </p>
            {profile.pivotHistory.slice(0, 1).map((pivot) => (
              <div key={pivot.id} className="p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <span>{pivot.fromDomain}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium">{pivot.toDomain}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pivot.transferredCapabilities.length} skills transferred
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pivot options */}
        {showPivotOptions && summary.readyForTransition && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground mb-2">Pivot Options</p>
            <div className="space-y-2">
              {pivotOptions.slice(0, 2).map((option, i) => (
                <div key={i} className="p-2 rounded border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{option.targetDomain}</span>
                    <Badge variant="outline" className="text-xs">
                      {(option.feasibility * 100).toFixed(0)}% feasible
                    </Badge>
                  </div>
                  <Progress value={option.capabilityTransferRate * 100} className="h-1 mb-1" />
                  <p className="text-xs text-muted-foreground">
                    {(option.capabilityTransferRate * 100).toFixed(0)}% skill transfer • {option.estimatedTransitionTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentorship */}
        {mentorship && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Mentorship</span>
              </div>
              <Badge variant={mentorship.availability === "active" ? "default" : "secondary"}>
                {mentorship.availability}
              </Badge>
            </div>
            {mentorship.canMentor.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Can mentor in:</p>
                <div className="flex flex-wrap gap-1">
                  {mentorship.canMentor.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
