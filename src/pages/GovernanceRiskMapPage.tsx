import {
  useGovernanceAnomalies, useDisputePatternIntelligence,
  useApprovalPatterns, useGovernanceStabilityIndex,
} from "@/hooks/useGovernanceIntelligence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, AlertTriangle, Info, Users, Layers } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const INST_ID = "00000000-0000-0000-0000-000000000001";

function heatColor(score: number) {
  if (score >= 70) return "bg-destructive/20 border-destructive/40";
  if (score >= 40) return "bg-amber-500/15 border-amber-500/30";
  return "bg-emerald-500/10 border-emerald-500/20";
}

function heatDot(score: number) {
  if (score >= 70) return "bg-destructive";
  if (score >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

export default function GovernanceRiskMapPage() {
  const { data: anomalies = [] } = useGovernanceAnomalies(INST_ID);
  const { data: disputeIntel } = useDisputePatternIntelligence(INST_ID);
  const { data: approvalPatterns = [] } = useApprovalPatterns(INST_ID);
  const { data: stability } = useGovernanceStabilityIndex(INST_ID);

  // Group anomalies by entity for heatmap
  const entityMap: Record<string, { count: number; maxScore: number; types: string[] }> = {};
  anomalies.forEach((a: any) => {
    const key = `${a.entity_type}:${a.entity_id}`;
    const existing = entityMap[key] || { count: 0, maxScore: 0, types: [] };
    existing.count++;
    existing.maxScore = Math.max(existing.maxScore, a.anomaly_score);
    if (!existing.types.includes(a.anomaly_type)) existing.types.push(a.anomaly_type);
    entityMap[key] = existing;
  });
  const entities = Object.entries(entityMap)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.maxScore - a.maxScore);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" /> Governance Risk Map
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Visual risk distribution across entities and departments</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] gap-1 cursor-help">
                <Info className="h-2.5 w-2.5" /> Advisory Only
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              This risk map is purely informational. No automated actions are triggered.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Overall Health Strip */}
      {stability && (
        <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/20">
          <div className={`w-4 h-4 rounded-full ${heatDot(100 - stability.overall_governance_score)}`} />
          <div>
            <p className="text-sm font-medium text-foreground">
              Governance Score: <span className="font-bold">{stability.overall_governance_score.toFixed(0)}/100</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Anomaly Density: {stability.anomaly_density} · Review Integrity: {stability.review_integrity_score} · Dispute Stability: {stability.dispute_stability_score}
            </p>
          </div>
        </div>
      )}

      {/* Entity Heatmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Entity Risk Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No risk entities detected.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {entities.map((e) => {
                const [type, id] = e.key.split(":");
                return (
                  <div key={e.key} className={`p-3 rounded-lg border ${heatColor(e.maxScore)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-[10px]">{type}</Badge>
                      <div className={`w-2.5 h-2.5 rounded-full ${heatDot(e.maxScore)}`} />
                    </div>
                    <p className="font-mono text-xs text-foreground">{id?.slice(0, 12)}...</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span>{e.count} anomalies</span>
                      <span>Peak: {e.maxScore}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {e.types.slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Dispute Hotspots */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Dispute Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {disputeIntel ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Rate Trend", value: disputeIntel.dispute_rate_trend },
                    { label: "Clustering", value: disputeIntel.clustering_score },
                    { label: "Escalation Pattern", value: disputeIntel.escalation_pattern_score },
                  ].map((m) => (
                    <div key={m.label} className="p-2.5 rounded bg-muted/30 text-center">
                      <p className="text-lg font-bold text-foreground">{m.value.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
                {disputeIntel.repeat_dispute_pairs && (
                  <div className="text-xs text-muted-foreground">
                    Repeat pairs: {JSON.stringify(disputeIntel.repeat_dispute_pairs).length > 2 ? "Detected" : "None"}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No dispute pattern data.</p>
            )}
          </CardContent>
        </Card>

        {/* Approval Clusters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Approval Pattern Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvalPatterns.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No flagged approval patterns.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {approvalPatterns.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                    <div>
                      <span className="font-mono text-xs">{p.approver_id?.slice(0, 8)}...</span>
                      <span className="text-[10px] text-muted-foreground ml-2">Freq: {p.approval_frequency}</span>
                    </div>
                    <span className={`text-xs font-bold ${p.anomaly_score >= 50 ? "text-destructive" : "text-muted-foreground"}`}>
                      Anomaly: {p.anomaly_score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
