import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useCareerSimulation } from "@/hooks/useCareerSimulation";
import { Sparkles, Target, TrendingUp, Clock } from "lucide-react";

export function CareerPathSimulator() {
  const { currentState, goals, skillPathways, scenarios } = useCareerSimulation();

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Career Path Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{currentState.trustScore}</p>
              <p className="text-xs text-muted-foreground">Trust Score</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">${(currentState.monthlyEarnings/1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">Monthly</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{currentState.projectsCompleted}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />Goals</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {goals.map(goal => (
            <div key={goal.id} className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{goal.type.replace("_", " ")}</span>
                <Badge variant="secondary">{goal.probability}% likely</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Target: {String(goal.target)} • Est: {goal.estimatedTimeToReach}</p>
              <Progress value={goal.probability} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Skill Pathways</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {skillPathways.map(path => (
            <div key={path.skill} className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium">{path.skill}</span>
                <Badge variant={path.marketDemand === "very_high" ? "default" : "secondary"}>
                  {path.earningsMultiplier}x earnings
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {path.timeToMaster}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full"><Sparkles className="h-4 w-4 mr-2" />Create New Scenario</Button>
    </div>
  );
}
