import {
  useInstitutionBottlenecks, useCrossProjectInsights,
} from "@/hooks/useOrchestration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Workflow, AlertTriangle, Users, Layers, Info, TrendingUp, Zap,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const INST_ID = "00000000-0000-0000-0000-000000000001";

function sc(v: number) {
  if (v >= 70) return "text-destructive";
  if (v >= 40) return "text-amber-600";
  return "text-emerald-600";
}

function AdvisoryTag() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-[10px] gap-1 cursor-help">
            <Info className="h-2.5 w-2.5" /> Advisory Only
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">
          Orchestration suggestions are advisory. No automated execution, financial changes, or state mutations are triggered.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function OrchestrationDashboardPage() {
  const { data: bottlenecks = [] } = useInstitutionBottlenecks(INST_ID);
  const { data: crossInsights } = useCrossProjectInsights(INST_ID);

  const typeGroups: Record<string, any[]> = {};
  bottlenecks.forEach((b: any) => {
    const t = b.bottleneck_type || "unknown";
    if (!typeGroups[t]) typeGroups[t] = [];
    typeGroups[t].push(b);
  });

  const avgScore = bottlenecks.length > 0
    ? bottlenecks.reduce((s: number, b: any) => s + (b.bottleneck_score ?? 0), 0) / bottlenecks.length
    : 0;
  const efficiencyScore = Math.max(0, 100 - avgScore).toFixed(0);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" /> AI Orchestration Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Execution coordination, bottleneck detection, and workflow optimization</p>
        </div>
        <AdvisoryTag />
      </div>

      {/* Executive Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Zap className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-3xl font-bold text-foreground">{efficiencyScore}%</p>
            <p className="text-xs text-muted-foreground">Orchestration Efficiency</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-amber-600" />
            <p className="text-3xl font-bold text-foreground">{bottlenecks.length}</p>
            <p className="text-xs text-muted-foreground">Active Bottlenecks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-emerald-600" />
            <p className="text-3xl font-bold text-foreground">
              {crossInsights?.coordination_overlap_score?.toFixed(0) ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">Coordination Overlap</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottlenecks by Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Execution Bottlenecks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bottlenecks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No bottlenecks detected.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {Object.entries(typeGroups).map(([type, items]) => (
                <div key={type}>
                  <Badge variant="secondary" className="text-[10px] mb-1.5">{type}</Badge>
                  {items.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm ml-2">
                      <div className="flex-1">
                        <p className="text-foreground text-xs">{b.suggested_resolution || "No resolution suggested"}</p>
                        <p className="text-[10px] text-muted-foreground">{b.affected_entity || "—"}</p>
                      </div>
                      <span className={`text-xs font-bold ${sc(b.bottleneck_score)}`}>{b.bottleneck_score}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cross-Project Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Cross-Project Coordination
          </CardTitle>
        </CardHeader>
        <CardContent>
          {crossInsights ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className="text-lg font-bold text-foreground">{crossInsights.coordination_overlap_score?.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">Overlap Score</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <p className={`text-lg font-bold ${sc(crossInsights.multi_project_delay_risk)}`}>
                    {crossInsights.multi_project_delay_risk?.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Multi-Project Delay Risk</p>
                </div>
              </div>

              {crossInsights.reviewer_overload_clusters?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Reviewer Overload Clusters
                  </p>
                  <div className="space-y-1">
                    {(crossInsights.reviewer_overload_clusters as any[]).slice(0, 5).map((c: any, i: number) => (
                      <div key={i} className="text-xs p-1.5 rounded bg-muted/20 text-muted-foreground">
                        {typeof c === "string" ? c : JSON.stringify(c)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {crossInsights.suggested_rebalancing?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1.5">Suggested Rebalancing</p>
                  <div className="space-y-1">
                    {(crossInsights.suggested_rebalancing as any[]).slice(0, 5).map((s: any, i: number) => (
                      <div key={i} className="text-xs p-1.5 rounded bg-muted/20 text-muted-foreground">
                        {typeof s === "string" ? s : JSON.stringify(s)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground">
                Generated: {new Date(crossInsights.created_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No cross-project insights available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
