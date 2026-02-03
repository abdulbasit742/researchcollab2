import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrustSystem, RecoveryStep } from "@/hooks/useTrustSystem";
import { Target, CheckCircle, Circle, Clock, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface TrustRecoveryRoadmapProps {
  userId?: string;
}

export function TrustRecoveryRoadmap({ userId }: TrustRecoveryRoadmapProps) {
  const { breakdown, loading } = useTrustSystem(userId);

  if (loading || !breakdown) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const { recoveryPath } = breakdown;
  const completedSteps = recoveryPath.filter(s => s.completed).length;
  const totalImpact = recoveryPath.reduce((sum, s) => sum + s.impact, 0);
  const progressPercent = recoveryPath.length > 0 ? (completedSteps / recoveryPath.length) * 100 : 0;

  const getDifficultyColor = (difficulty: RecoveryStep["difficulty"]) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/10 text-green-600 border-green-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "hard": return "bg-orange-500/10 text-orange-600 border-orange-500/30";
    }
  };

  const targetTrustScore = Math.min(100, breakdown.overall + totalImpact);
  const estimatedTimeToRecovery = recoveryPath.length > 0 
    ? `${Math.ceil(recoveryPath.length * 2)} weeks` 
    : "N/A";

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Trust Recovery Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current vs Target */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">Current Score</p>
            <p className="text-3xl font-bold">{breakdown.overall}</p>
            <Badge variant="secondary" className="mt-1">
              {breakdown.tier.toUpperCase()}
            </Badge>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 text-center">
            <p className="text-sm text-muted-foreground">Target Score</p>
            <p className="text-3xl font-bold text-primary">{targetTrustScore}</p>
            <Badge className="mt-1">
              +{totalImpact} points
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Recovery Progress</span>
            <span className="text-muted-foreground">
              {completedSteps} of {recoveryPath.length} milestones
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Started</span>
            <span>Est. {estimatedTimeToRecovery}</span>
          </div>
        </div>

        {/* Recovery Steps */}
        {recoveryPath.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Recommended Actions</p>
            {recoveryPath.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  step.completed 
                    ? "bg-green-500/5 border-green-500/30" 
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${step.completed ? "text-green-500" : "text-muted-foreground"}`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${step.completed ? "line-through text-muted-foreground" : ""}`}>
                          {step.action}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getDifficultyColor(step.difficulty)}>
                            {step.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {step.timeEstimate}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-primary/10 text-primary border-0">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{step.impact} pts
                        </Badge>
                      </div>
                    </div>
                    {!step.completed && (
                      <Button variant="ghost" size="sm" className="mt-2 h-8">
                        Start This Step
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-3" />
            <p className="font-medium">Great Job!</p>
            <p className="text-sm text-muted-foreground">
              Your trust score is in good standing. Keep up the excellent work!
            </p>
          </div>
        )}

        {/* Time Estimate */}
        {recoveryPath.length > 0 && (
          <div className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Estimated Time to Full Recovery</p>
                <p className="text-xs text-muted-foreground">
                  Based on typical completion rates
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg py-1 px-3">
              {estimatedTimeToRecovery}
            </Badge>
          </div>
        )}

        {/* Related Opportunities */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Opportunities to Rebuild Trust</p>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="justify-start h-auto py-3">
              <div className="text-left">
                <p className="font-medium">Small Projects Available</p>
                <p className="text-xs text-muted-foreground">3 projects match your skills</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <div className="text-left">
                <p className="font-medium">Quick Reviews Needed</p>
                <p className="text-xs text-muted-foreground">5 colleagues awaiting your review</p>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
