import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useActivityFeed, useProjectActivitySummary, useComputeActivityScore } from "@/hooks/useResearchWorkflow";
import { Activity, RefreshCw, Loader2, FileText, ListChecks, ClipboardCheck, TrendingUp, Zap } from "lucide-react";
import { format } from "date-fns";

export default function ProjectActivityPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: feed = [], isLoading } = useActivityFeed(projectId);
  const { data: summary } = useProjectActivitySummary(projectId);
  const computeScore = useComputeActivityScore();

  const entityIcon = (type: string) => {
    switch (type) {
      case "task": return <ListChecks className="h-4 w-4" />;
      case "artifact": return <FileText className="h-4 w-4" />;
      case "review": return <ClipboardCheck className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const actionColor = (action: string) => {
    switch (action) {
      case "completed": return "default" as const;
      case "uploaded": return "secondary" as const;
      case "requested": return "outline" as const;
      case "approved": return "default" as const;
      case "rejected": return "destructive" as const;
      default: return "outline" as const;
    }
  };

  return (
    <MainLayout>
      <div className="container py-6 px-4 max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Project Activity
            </h1>
            <p className="text-sm text-muted-foreground">Real-time project intelligence</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => projectId && computeScore.mutate(projectId)}
            disabled={computeScore.isPending}
          >
            {computeScore.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh Score
          </Button>
        </div>

        {/* Activity Summary */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <Zap className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{Number(summary.activity_score).toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Activity Score</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <ListChecks className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{summary.completed_tasks}/{summary.total_tasks}</p>
                <p className="text-xs text-muted-foreground">Tasks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <FileText className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{summary.artifact_count}</p>
                <p className="text-xs text-muted-foreground">Artifacts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <ClipboardCheck className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{summary.review_count}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
                <Progress
                  value={summary.total_tasks > 0 ? (summary.completed_tasks / summary.total_tasks) * 100 : 0}
                  className="h-2 mt-2"
                />
                <p className="text-xs text-muted-foreground text-center mt-1">Completion</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : feed.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {feed.map((item: any) => (
                    <div key={item.id} className="flex gap-3 relative">
                      <div className="h-8 w-8 rounded-full bg-card border flex items-center justify-center shrink-0 z-10 text-primary">
                        {entityIcon(item.entity_type)}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={actionColor(item.action)} className="text-xs">
                            {item.action}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.entity_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                        {item.metadata?.title && (
                          <p className="text-sm mt-1">{item.metadata.title}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
