import { useState } from "react";
import {
  useWorkflowRecommendations, useRoleCoordinationSuggestions,
  useExecutionBottlenecks, useOrchestratedTimeline, useOrchestrationFeedback,
} from "@/hooks/useOrchestration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GitBranch, Users, AlertTriangle, Clock, Info, CheckCircle, XCircle, Sparkles,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

function sc(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

export default function ExecutionFlowPage() {
  const [projectId, setProjectId] = useState("");
  const activeId = projectId.trim() || undefined;

  const { data: workflows = [] } = useWorkflowRecommendations(activeId);
  const { data: coordSuggestions = [] } = useRoleCoordinationSuggestions(activeId);
  const { data: bottlenecks = [] } = useExecutionBottlenecks(activeId);
  const { data: timeline } = useOrchestratedTimeline(activeId);
  const feedback = useOrchestrationFeedback();

  const handleFeedback = (recId: string, type: string, accepted: boolean) => {
    feedback.mutate({ recommendation_id: recId, recommendation_type: type, accepted }, {
      onSuccess: () => toast.success(accepted ? "Accepted" : "Dismissed"),
    });
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" /> Execution Flow
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-enhanced workflow sequencing and coordination guidance</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] gap-1 cursor-help">
                <Info className="h-2.5 w-2.5" /> Advisory Only
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              All suggestions are advisory. No milestone, escrow, or financial state is modified.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Project Selector */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter Project ID to view execution flow..."
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="font-mono text-sm max-w-md"
        />
      </div>

      {!activeId && (
        <p className="text-sm text-muted-foreground text-center py-12">Enter a project ID above to view orchestration data.</p>
      )}

      {activeId && (
        <>
          {/* Workflow Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Workflow Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No workflow recommendations yet.</p>
              ) : (
                <div className="space-y-3">
                  {workflows.map((w: any) => (
                    <div key={w.id} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-[10px]">State: {w.current_state}</Badge>
                        <span className={`text-xs font-medium ${sc(w.confidence_score)}`}>
                          Confidence: {w.confidence_score}%
                        </span>
                      </div>
                      {w.reasoning && <p className="text-xs text-muted-foreground mb-2">{w.reasoning}</p>}
                      {Array.isArray(w.recommended_next_actions) && w.recommended_next_actions.length > 0 && (
                        <div className="space-y-1">
                          {w.recommended_next_actions.map((a: any, i: number) => (
                            <div key={i} className="text-xs p-2 rounded bg-muted/30 text-foreground">
                              {typeof a === "string" ? a : JSON.stringify(a)}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          Model: {w.model_version} · {new Date(w.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]"
                            onClick={() => handleFeedback(w.id, "workflow", true)}>
                            <CheckCircle className="h-3 w-3 mr-0.5" /> Accept
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]"
                            onClick={() => handleFeedback(w.id, "workflow", false)}>
                            <XCircle className="h-3 w-3 mr-0.5" /> Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Role Coordination */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" /> Role Coordination
                </CardTitle>
              </CardHeader>
              <CardContent>
                {coordSuggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No coordination gaps detected.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {coordSuggestions.map((c: any) => (
                      <div key={c.id} className="p-2.5 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-[10px]">{c.role_type}</Badge>
                          <Badge variant="outline" className="text-[10px]">{c.coordination_gap_type}</Badge>
                        </div>
                        <p className="text-xs text-foreground">{c.suggestion_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bottlenecks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Bottlenecks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bottlenecks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No bottlenecks for this project.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {bottlenecks.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                        <div>
                          <Badge variant="secondary" className="text-[10px]">{b.bottleneck_type}</Badge>
                          <p className="text-xs text-muted-foreground mt-0.5">{b.suggested_resolution}</p>
                        </div>
                        <span className={`text-xs font-bold ${sc(100 - b.bottleneck_score)}`}>{b.bottleneck_score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Optimized Timeline */}
          {timeline && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Optimized Timeline Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-lg font-bold text-emerald-600">+{timeline.predicted_efficiency_gain?.toFixed(1)}%</p>
                    <p className="text-[10px] text-muted-foreground">Predicted Efficiency Gain</p>
                  </div>
                </div>
                {Array.isArray(timeline.optimized_milestone_sequence) && timeline.optimized_milestone_sequence.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Optimized Sequence</p>
                    <div className="flex flex-wrap gap-1.5">
                      {timeline.optimized_milestone_sequence.map((m: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px]">
                          {typeof m === "string" ? m : JSON.stringify(m)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Model: {timeline.model_version} · Simulation only — no changes applied
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
