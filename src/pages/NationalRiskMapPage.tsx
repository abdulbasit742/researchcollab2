import { useState } from "react";
import { useNationalRegistries, useRegionalClusters, useNationalComplianceMetrics, useNationalExecutionIndex } from "@/hooks/useNationalDeployment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin } from "lucide-react";

function riskLevel(score: number) {
  if (score >= 75) return { label: "Low Risk", color: "bg-emerald-500/20 text-emerald-700 border-emerald-300" };
  if (score >= 50) return { label: "Medium Risk", color: "bg-amber-500/20 text-amber-700 border-amber-300" };
  return { label: "High Risk", color: "bg-destructive/20 text-destructive border-destructive/30" };
}

export default function NationalRiskMapPage() {
  const { data: registries = [] } = useNationalRegistries();
  const [selectedId, setSelectedId] = useState<string>("");
  const { data: clusters = [] } = useRegionalClusters(selectedId);
  const { data: compliance } = useNationalComplianceMetrics(selectedId);
  const { data: execution } = useNationalExecutionIndex(selectedId);

  const overallRisk = execution?.overall_health_score
    ? riskLevel(execution.overall_health_score)
    : null;

  const riskFactors = compliance ? [
    { label: "Audit Risk", score: 100 - (compliance.audit_completeness_avg ?? 0) },
    { label: "Dispute Density", score: 100 - (compliance.dispute_resolution_speed_avg ?? 0) },
    { label: "Review Integrity Risk", score: 100 - (compliance.review_integrity_score_avg ?? 0) },
    { label: "Governance Instability", score: 100 - (compliance.governance_stability_score_avg ?? 0) },
  ].sort((a, b) => b.score - a.score) : [];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" /> National Risk Map
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Strategic risk overview — aggregated, no operational details</p>
        </div>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select registry" />
          </SelectTrigger>
          <SelectContent>
            {registries.map((r: any) => (
              <SelectItem key={r.id} value={r.id}>{r.country_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedId && (
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Select a national registry to view risk map.</CardContent></Card>
      )}

      {selectedId && (
        <>
          {overallRisk && (
            <div className={`p-4 rounded-lg border ${overallRisk.color}`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">National Risk Level: {overallRisk.label}</span>
                <span className="text-sm ml-auto">Health Score: {execution?.overall_health_score?.toFixed(0)}/100</span>
              </div>
            </div>
          )}

          {/* Risk Factors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Risk Factor Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {riskFactors.length > 0 ? (
                <div className="space-y-3">
                  {riskFactors.map((f) => {
                    const r = riskLevel(100 - f.score);
                    return (
                      <div key={f.label} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-44 shrink-0">{f.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${f.score >= 50 ? "bg-destructive" : f.score >= 25 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(f.score, 100)}%` }}
                          />
                        </div>
                        <Badge variant="outline" className="text-[10px]">{r.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No compliance data for risk analysis.</p>
              )}
            </CardContent>
          </Card>

          {/* Regional Risk */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Regional Cluster Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clusters.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {clusters.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-lg bg-muted/30 text-center">
                      <p className="text-sm font-medium text-foreground">{c.region_name}</p>
                      {c.region_code && <p className="text-[10px] text-muted-foreground">{c.region_code}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No clusters configured.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
