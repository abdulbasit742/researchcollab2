import {
  useGovernanceAnomalies, useReviewIntegrity, useGovernanceStabilityIndex,
  useGovernanceStabilityHistory, useBehavioralDrift, useEndorsementIntegrity,
} from "@/hooks/useGovernanceIntelligence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield, AlertTriangle, Eye, Users, Activity, Info, TrendingDown, TrendingUp,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const INST_ID = "00000000-0000-0000-0000-000000000001";

function sc(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

function trafficLight(v: number) {
  if (v >= 75) return "bg-emerald-500";
  if (v >= 50) return "bg-amber-500";
  return "bg-destructive";
}

function severityBadge(s: string) {
  if (s === "critical") return "destructive" as const;
  if (s === "high") return "destructive" as const;
  return "secondary" as const;
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
          Governance intelligence is purely advisory. No automated penalties, suspensions, or state changes are triggered.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function GovernanceIntelligencePage() {
  const { data: stability } = useGovernanceStabilityIndex(INST_ID);
  const { data: anomalies = [] } = useGovernanceAnomalies(INST_ID);
  const { data: reviewMetrics = [] } = useReviewIntegrity(INST_ID);
  const { data: drifts = [] } = useBehavioralDrift(INST_ID);
  const { data: endorsements = [] } = useEndorsementIntegrity(INST_ID);
  const { data: history = [] } = useGovernanceStabilityHistory(INST_ID);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Governance Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Anomaly detection, review integrity, and behavioral drift monitoring</p>
        </div>
        <AdvisoryTag />
      </div>

      {/* Governance Stability Index */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Governance Stability Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stability ? (
            <div className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${trafficLight(stability.overall_governance_score)}`} />
                  <p className={`text-4xl font-bold ${sc(stability.overall_governance_score)}`}>
                    {stability.overall_governance_score.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Overall Score</p>
                </div>
                <div className="flex-1 grid grid-cols-4 gap-3">
                  {[
                    { label: "Anomaly Density", value: stability.anomaly_density, invert: true },
                    { label: "Review Integrity", value: stability.review_integrity_score },
                    { label: "Dispute Stability", value: stability.dispute_stability_score },
                    { label: "Role Integrity", value: stability.role_integrity_score },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                      <p className={`text-lg font-bold ${sc(m.invert ? 100 - m.value : m.value)}`}>
                        {m.value.toFixed(0)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Generated: {new Date(stability.generated_at).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No governance stability data available.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Anomalies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Detected Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {anomalies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No anomalies detected.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {anomalies.map((a: any) => (
                  <div key={a.id} className="p-2.5 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={severityBadge(a.severity_level)} className="text-[10px]">{a.severity_level}</Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(a.detected_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-foreground">{a.anomaly_type}</p>
                    {a.explanation && <p className="text-xs text-muted-foreground mt-0.5">{a.explanation}</p>}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>Score: <span className={`font-medium ${sc(100 - a.anomaly_score)}`}>{a.anomaly_score}</span></span>
                      <span>{a.entity_type}: <code className="text-[10px]">{a.entity_id?.slice(0, 8)}...</code></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Integrity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Review Integrity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewMetrics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No review integrity data.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {reviewMetrics.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                    <div>
                      <span className="font-mono text-xs">{r.reviewer_id?.slice(0, 8)}...</span>
                      <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                        <span>Approve: {r.approval_rate}%</span>
                        <span>Reject: {r.rejection_rate}%</span>
                        <span>Avg: {r.average_review_time}h</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${sc(100 - r.bias_risk_score)}`}>Bias: {r.bias_risk_score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Behavioral Drift */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Behavioral Drift
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drifts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No drift signals.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {drifts.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                    <div className="flex items-center gap-2">
                      {d.drift_percentage > 20 ? (
                        <TrendingDown className="h-3.5 w-3.5 text-destructive shrink-0" />
                      ) : (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span className="font-mono text-xs">{d.entity_id?.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${sc(100 - d.drift_percentage)}`}>
                        {d.drift_percentage.toFixed(1)}% drift
                      </span>
                      {d.risk_flag !== "none" && (
                        <Badge variant="destructive" className="text-[10px]">{d.risk_flag}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Endorsement Integrity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Endorsement Integrity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {endorsements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No endorsement anomalies.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {endorsements.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                    <span className="font-mono text-xs">{e.user_id?.slice(0, 8)}...</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span>Circular: <span className={`font-bold ${sc(100 - e.circular_endorsement_score)}`}>{e.circular_endorsement_score}</span></span>
                      <span>Density: {e.endorsement_density}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stability History */}
      {history.length > 1 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Governance Stability Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-2 rounded text-sm hover:bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${trafficLight(h.overall_governance_score)}`} />
                    <span className={`font-bold ${sc(h.overall_governance_score)}`}>{h.overall_governance_score.toFixed(0)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(h.generated_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
