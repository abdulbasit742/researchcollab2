import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { useProfileReadiness } from "@/hooks/useProfessionalIdentity";

interface ProfileReadinessCardProps {
  compact?: boolean;
}

export function ProfileReadinessCard({ compact = false }: ProfileReadinessCardProps) {
  const { data: readiness, isLoading } = useProfileReadiness();

  if (isLoading || !readiness) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-2 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { score, missingItems, nextAction } = readiness;
  const isComplete = score >= 100;

  if (compact) {
    return (
      <Card className={isComplete ? "border-primary/30 bg-primary/5" : ""}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Readiness</span>
            <Badge variant={isComplete ? "default" : "secondary"}>
              {score}%
            </Badge>
          </div>
          <Progress value={score} className="h-2 mb-3" />
          {!isComplete && nextAction && (
            <p className="text-xs text-muted-foreground">
              Next: {nextAction}
            </p>
          )}
          {isComplete && (
            <p className="text-xs text-primary flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Profile complete!
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Profile Readiness
          </CardTitle>
          <Badge variant={isComplete ? "default" : "outline"} className="text-xs">
            {score}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={score} className="h-2" />

        {isComplete ? (
          <div className="text-center py-4">
            <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-medium">Your profile is complete!</p>
            <p className="text-sm text-muted-foreground">
              You're ready to discover opportunities and build trust.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete these steps to unlock more opportunities:
            </p>
            <ul className="space-y-2">
              {missingItems.slice(0, 4).map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.action}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <Circle className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary">
                        {item.label}
                      </p>
                      {item.unlocksFeature && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Lock className="h-3 w-3" />
                          Unlocks: {item.unlocksFeature}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>

            {nextAction && (
              <Button asChild size="sm" className="w-full mt-2">
                <Link to={missingItems[0]?.action || "/profile"}>
                  {nextAction}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
