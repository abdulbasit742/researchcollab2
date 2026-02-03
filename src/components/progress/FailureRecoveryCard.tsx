import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface FailureEvent {
  id: string;
  type: "lost_bid" | "failed_project" | "dispute" | "rejection";
  title: string;
  date: string;
  trustImpact: number;
  recoveryProgress: number;
  recoverySteps: string[];
  completedSteps: number;
}

interface FailureRecoveryCardProps {
  failures: FailureEvent[];
  currentTrustScore: number;
}

export function FailureRecoveryCard({ failures, currentTrustScore }: FailureRecoveryCardProps) {
  const typeConfig = {
    lost_bid: {
      icon: Target,
      label: "Lost Bid",
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    failed_project: {
      icon: XCircle,
      label: "Failed Project",
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
    dispute: {
      icon: AlertTriangle,
      label: "Dispute",
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
    rejection: {
      icon: XCircle,
      label: "Rejected",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  };

  const activeRecoveries = failures.filter((f) => f.recoveryProgress < 100);
  const completedRecoveries = failures.filter((f) => f.recoveryProgress >= 100);

  if (failures.length === 0) {
    return (
      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <CardContent className="py-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h4 className="font-medium mb-1">Clean Record</h4>
          <p className="text-sm text-muted-foreground">
            No failures or setbacks. Keep delivering to maintain your standing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Recovery Progress
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {activeRecoveries.length} Active
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Failure is part of growth. Here's your recovery path.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Recoveries */}
        {activeRecoveries.map((failure) => {
          const config = typeConfig[failure.type];
          const Icon = config.icon;
          
          return (
            <div key={failure.id} className="p-3 rounded-lg border space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{failure.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(failure.date).toLocaleDateString()} • {config.label}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  -{failure.trustImpact} trust
                </Badge>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Recovery progress</span>
                  <span className="font-medium">{failure.recoveryProgress}%</span>
                </div>
                <Progress value={failure.recoveryProgress} className="h-1.5" />
              </div>

              {/* Recovery Steps */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium">Next steps to recover:</p>
                {failure.recoverySteps.slice(0, 3).map((step, i) => {
                  const isCompleted = i < failure.completedSteps;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs ${
                        isCompleted ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      )}
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Completed Recoveries Summary */}
        {completedRecoveries.length > 0 && (
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <p className="text-sm">
                <span className="font-medium">{completedRecoveries.length} setback{completedRecoveries.length !== 1 ? "s" : ""}</span>{" "}
                successfully recovered
              </p>
            </div>
          </div>
        )}

        {/* Philosophy */}
        <div className="pt-2 border-t">
          <p className="text-[10px] text-center text-muted-foreground italic">
            "Setbacks are visible, but so is your recovery. This builds deeper trust than a perfect record."
          </p>
        </div>

        {/* View All */}
        <Button variant="ghost" size="sm" className="w-full text-xs gap-1" asChild>
          <Link to="/profile#failures">
            View Full History
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
