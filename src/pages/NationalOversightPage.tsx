import { useState } from "react";
import { useNationalRegistries, useRegionalClusters, useNationalComplianceMetrics, useNationalExecutionIndex, useNationalRegistrySettings } from "@/hooks/useNationalDeployment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, ShieldCheck, Activity, MapPin, Globe, Lock } from "lucide-react";

function sc(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

function tl(v: number) {
  if (v >= 75) return { color: "bg-emerald-500", label: "Healthy" };
  if (v >= 50) return { color: "bg-amber-500", label: "Moderate" };
  return { color: "bg-destructive", label: "At Risk" };
}

export default function NationalOversightPage() {
  const { data: registries = [] } = useNationalRegistries();
  const [selectedId, setSelectedId] = useState<string>("");
  const { data: clusters = [] } = useRegionalClusters(selectedId);
  const { data: compliance } = useNationalComplianceMetrics(selectedId);
  const { data: execution } = useNationalExecutionIndex(selectedId);
  const { data: settings } = useNationalRegistrySettings(selectedId);

  const selectedRegistry = registries.find((r: any) => r.id === selectedId);
  const healthScore = execution?.overall_health_score ?? 0;
  const health = tl(healthScore);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> National Oversight Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Sovereign institutional execution monitoring</p>
        </div>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select national registry" />
          </SelectTrigger>
          <SelectContent>
            {registries.map((r: any) => (
              <SelectItem key={r.id} value={r.id}>{r.country_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedId && (
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Select a national registry to view oversight data.</CardContent></Card>
      )}

      {selectedId && (
        <>
          {/* Header */}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="default">{selectedRegistry?.country_code}</Badge>
            <span className="text-sm text-muted-foreground">{selectedRegistry?.regulatory_authority_name}</span>
            <Badge variant="secondary">{selectedRegistry?.compliance_framework}</Badge>
            {settings?.federation_enabled && <Badge variant="outline" className="gap-1"><Globe className="h-3 w-3" /> Federation</Badge>}
            {settings?.data_residency_policy === "local_only" && <Badge variant="outline" className="gap-1"><Lock className="h-3 w-3" /> Local Residency</Badge>}
          </div>

          {/* Execution Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> National Execution Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-4 h-4 rounded-full ${health.color}`} />
                <span className={`text-3xl font-bold ${sc(healthScore)}`}>{healthScore.toFixed(0)}</span>
                <span className="text-sm text-muted-foreground">/ 100 — {health.label}</span>
              </div>
              {execution ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Execution Velocity", value: execution.execution_velocity_index },
                    { label: "Milestone Completion", value: execution.milestone_completion_index },
                    { label: "Engagement", value: execution.engagement_index },
                    { label: "Predictive Stability", value: execution.predictive_stability_index },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                      <p className={`text-xl font-bold ${sc(m.value)}`}>{m.value.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No execution index data available.</p>
              )}
            </CardContent>
          </Card>

          {/* Compliance + Clusters */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Compliance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {compliance ? (
                  <div className="space-y-2">
                    {[
                      { label: "Audit Completeness", value: compliance.audit_completeness_avg },
                      { label: "Dispute Resolution Speed", value: compliance.dispute_resolution_speed_avg },
                      { label: "Review Integrity", value: compliance.review_integrity_score_avg },
                      { label: "Governance Stability", value: compliance.governance_stability_score_avg },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className={`font-bold ${sc(m.value)}`}>{m.value.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No compliance data.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Regional Clusters ({clusters.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clusters.length > 0 ? (
                  <div className="space-y-1.5">
                    {clusters.map((c: any) => (
                      <div key={c.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-foreground">{c.region_name}</span>
                        {c.region_code && <Badge variant="outline" className="text-[10px] ml-auto">{c.region_code}</Badge>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No regional clusters defined.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
