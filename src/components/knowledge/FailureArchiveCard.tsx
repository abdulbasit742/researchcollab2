import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Users,
  BookX,
  ChevronRight,
} from "lucide-react";
import type { FailureRecord, FailureType } from "@/types/knowledge-civilization";

interface FailureArchiveCardProps {
  failure: FailureRecord;
  onView?: () => void;
  onVerify?: () => void;
  showActions?: boolean;
}

const failureTypeConfig: Record<FailureType, { icon: typeof AlertTriangle; label: string; color: string }> = {
  project_failure: { icon: BookX, label: "Project Failure", color: "text-red-600 dark:text-red-400" },
  hypothesis_invalidated: { icon: AlertTriangle, label: "Hypothesis Invalidated", color: "text-orange-600 dark:text-orange-400" },
  method_disproven: { icon: AlertTriangle, label: "Method Disproven", color: "text-yellow-600 dark:text-yellow-400" },
  approach_abandoned: { icon: BookX, label: "Approach Abandoned", color: "text-slate-600 dark:text-slate-400" },
  experiment_failed: { icon: AlertTriangle, label: "Experiment Failed", color: "text-red-500 dark:text-red-400" },
  implementation_failed: { icon: BookX, label: "Implementation Failed", color: "text-pink-600 dark:text-pink-400" },
};

export function FailureArchiveCard({
  failure,
  onView,
  onVerify,
  showActions = true,
}: FailureArchiveCardProps) {
  const typeConfig = failureTypeConfig[failure.type];
  const Icon = typeConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-muted`}>
              <Icon className={`h-4 w-4 ${typeConfig.color}`} />
            </div>
            <div>
              <CardTitle className="text-base">{failure.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{typeConfig.label}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {failure.visibility}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {failure.description}
        </p>

        {failure.lessonsLearned.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span>Lessons Learned</span>
            </div>
            <ScrollArea className="h-20">
              <ul className="text-sm text-muted-foreground space-y-1">
                {failure.lessonsLearned.slice(0, 3).map((lesson, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span className="line-clamp-2">{lesson}</span>
                  </li>
                ))}
                {failure.lessonsLearned.length > 3 && (
                  <li className="text-xs text-muted-foreground/70">
                    +{failure.lessonsLearned.length - 3} more lessons
                  </li>
                )}
              </ul>
            </ScrollArea>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center border-t pt-3">
          <div>
            <span className="font-semibold text-sm">{failure.credibilityScore}%</span>
            <p className="text-xs text-muted-foreground">Credibility</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              <span className="font-semibold text-sm">{failure.verifiedBy.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Users className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-semibold text-sm">{failure.replicationAttempts}</span>
            </div>
            <p className="text-xs text-muted-foreground">Replications</p>
          </div>
        </div>

        {showActions && (
          <div className="flex justify-end gap-2 pt-2 border-t">
            {onVerify && (
              <Button size="sm" variant="outline" onClick={onVerify}>
                Verify
              </Button>
            )}
            {onView && (
              <Button size="sm" onClick={onView}>
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Failure domain statistics card
interface FailureDomainStatsProps {
  domain: string;
  stats: {
    totalFailures: number;
    byType: Record<FailureType, number>;
    topLessons: [string, number][];
    avgCredibility: number;
  };
}

export function FailureDomainStats({ domain, stats }: FailureDomainStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{domain} Failure Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{stats.totalFailures}</p>
            <p className="text-xs text-muted-foreground">Total Failures Recorded</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{stats.avgCredibility.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Avg Credibility</p>
          </div>
        </div>

        {stats.topLessons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Most Common Lessons
            </h4>
            <div className="space-y-1">
              {stats.topLessons.slice(0, 5).map(([lesson, count], i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground line-clamp-1">{lesson}</span>
                  <Badge variant="secondary" className="text-xs">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
