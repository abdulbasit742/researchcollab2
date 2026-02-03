import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCareerIntelligence } from "@/hooks/useCareerIntelligence";
import { 
  Rocket, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lightbulb,
  TrendingUp,
  Brain,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CareerTrajectoryPanel() {
  const { 
    trajectory, 
    forecasts, 
    skillGaps, 
    failurePatterns, 
    loading, 
    getNextBestAction 
  } = useCareerIntelligence();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trajectory) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Career analysis not available</p>
        </CardContent>
      </Card>
    );
  }

  const phaseLabels = {
    early: "Early Career",
    growth: "Growth Phase",
    established: "Established",
    senior: "Senior Professional",
    expert: "Expert/Leader",
  };

  return (
    <div className="space-y-6">
      {/* Career Phase Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Career Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{phaseLabels[trajectory.currentPhase]}</div>
              <div className="text-sm text-muted-foreground">
                Projected: {trajectory.projectedPhase} in {trajectory.estimatedTimeToNext}
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {trajectory.projectionConfidence}% confidence
            </Badge>
          </div>

          {/* Phase Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next phase</span>
              <span>{trajectory.projectionConfidence}%</span>
            </div>
            <Progress value={trajectory.projectionConfidence} className="h-3" />
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Strength Areas</h4>
              <div className="flex flex-wrap gap-1">
                {trajectory.strengthAreas.map((area, i) => (
                  <Badge key={i} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Growth Areas</h4>
              <div className="flex flex-wrap gap-1">
                {trajectory.growthAreas.map((area, i) => (
                  <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Best Action */}
      {getNextBestAction && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Recommended Next Action</div>
                <div className="font-semibold">{getNextBestAction.action}</div>
                <div className="text-sm text-muted-foreground">{getNextBestAction.reason}</div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">+{getNextBestAction.impact} impact</Badge>
                <div className="text-xs text-muted-foreground mt-1">{getNextBestAction.timeframe}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Milestones */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Key Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trajectory.keyMilestones.map((milestone) => (
              <div 
                key={milestone.id} 
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  milestone.status === "completed" ? "bg-green-50 dark:bg-green-950/30 border-green-200" :
                  milestone.status === "in_progress" ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200" :
                  milestone.status === "blocked" ? "bg-red-50 dark:bg-red-950/30 border-red-200" :
                  "bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  milestone.status === "completed" ? "bg-green-500 text-white" :
                  milestone.status === "in_progress" ? "bg-blue-500 text-white" :
                  milestone.status === "blocked" ? "bg-red-500 text-white" :
                  "bg-muted text-muted-foreground"
                )}>
                  {milestone.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : milestone.status === "in_progress" ? (
                    <Clock className="h-5 w-5" />
                  ) : milestone.status === "blocked" ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <Target className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{milestone.title}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {milestone.description}
                  </div>
                </div>
                <Badge variant="outline">+{milestone.impact} pts</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Forecasts */}
      {forecasts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Opportunity Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecasts.map((forecast, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Badge variant="outline" className="capitalize mr-2">
                        {forecast.type}
                      </Badge>
                      <span className="font-medium">{forecast.title}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{forecast.matchScore}%</div>
                      <div className="text-xs text-muted-foreground">match</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{forecast.timeframe}</span>
                    <span className={cn(
                      forecast.probability >= 70 ? "text-green-600" :
                      forecast.probability >= 40 ? "text-amber-600" :
                      "text-red-600"
                    )}>
                      {forecast.probability}% probability
                    </span>
                  </div>
                  {forecast.blockers.length > 0 && (
                    <div className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {forecast.blockers[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Gaps */}
      {skillGaps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              Skill Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillGaps.map((gap, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{gap.skill}</span>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs",
                          gap.importance === "critical" ? "bg-red-100 text-red-700" :
                          gap.importance === "important" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                        )}
                      >
                        {gap.importance}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {gap.estimatedTimeToAcquire}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Progress 
                        value={(gap.currentLevel / gap.requiredLevel) * 100} 
                        className="h-2"
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {gap.currentLevel}/{gap.requiredLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failure Patterns */}
      {failurePatterns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Pattern Recognition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {failurePatterns.map((pattern, i) => (
                <div key={i} className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{pattern.pattern}</span>
                    <Badge variant="outline">{pattern.frequency} occurrences</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Prevention strategies:
                  </div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {pattern.preventionStrategies.slice(0, 2).map((strategy, j) => (
                      <li key={j}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
