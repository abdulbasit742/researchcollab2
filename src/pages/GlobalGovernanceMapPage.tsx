import { useState } from "react";
import { useGlobalFederations, useFederationMembers, useFederationInteropStatus } from "@/hooks/useGlobalFederation";
import { useNationalComplianceMetrics, useNationalExecutionIndex } from "@/hooks/useNationalDeployment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Globe } from "lucide-react";

function sc(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

function riskBand(v: number) {
  if (v >= 75) return { label: "Stable", cls: "bg-emerald-500/20 text-emerald-700 border-emerald-300" };
  if (v >= 50) return { label: "Moderate", cls: "bg-amber-500/20 text-amber-700 border-amber-300" };
  return { label: "At Risk", cls: "bg-destructive/20 text-destructive border-destructive/30" };
}

export default function GlobalGovernanceMapPage() {
  const { data: federations = [] } = useGlobalFederations();
  const [selectedId, setSelectedId] = useState<string>("");
  const { data: members = [] } = useFederationMembers(selectedId);
  const { data: interop = [] } = useFederationInteropStatus(selectedId);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Global Governance Stability Map
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Country-level governance health — aggregated, strategic overview only</p>
        </div>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-72">
            <SelectValue placeholder="Select federation" />
          </SelectTrigger>
          <SelectContent>
            {federations.map((f: any) => (
              <SelectItem key={f.id} value={f.id}>{f.federation_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedId && (
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Select a federation to view governance map.</CardContent></Card>
      )}

      {selectedId && members.length === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No member countries in this federation.</CardContent></Card>
      )}

      {selectedId && members.length > 0 && (
        <div className="space-y-3">
          {members.map((m: any) => {
            const interopNode = interop.find((i: any) => i.national_registry_id === m.national_registry_id);
            return (
              <CountryGovernanceCard
                key={m.id}
                countryName={m.national_registry?.country_name ?? "Unknown"}
                countryCode={m.national_registry?.country_code ?? "—"}
                registryId={m.national_registry_id}
                interopNode={interopNode}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function CountryGovernanceCard({ countryName, countryCode, registryId, interopNode }: { countryName: string; countryCode: string; registryId: string; interopNode?: any }) {
  const { data: compliance } = useNationalComplianceMetrics(registryId);
  const { data: execution } = useNationalExecutionIndex(registryId);

  const govScore = compliance?.governance_stability_score_avg ?? 0;
  const band = riskBand(govScore);

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{countryName}</span>
            <Badge variant="outline" className="text-[10px]">{countryCode}</Badge>
          </div>
          <Badge variant="outline" className={`text-[10px] border ${band.cls}`}>{band.label}</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 rounded bg-muted/30">
            <p className={`text-sm font-bold ${sc(govScore)}`}>{govScore.toFixed(1)}</p>
            <p className="text-[9px] text-muted-foreground">Governance Stability</p>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <p className={`text-sm font-bold ${sc(compliance?.review_integrity_score_avg ?? 0)}`}>{(compliance?.review_integrity_score_avg ?? 0).toFixed(1)}</p>
            <p className="text-[9px] text-muted-foreground">Review Integrity</p>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <p className={`text-sm font-bold ${sc(compliance?.dispute_resolution_speed_avg ?? 0)}`}>{(compliance?.dispute_resolution_speed_avg ?? 0).toFixed(1)}</p>
            <p className="text-[9px] text-muted-foreground">Dispute Resolution</p>
          </div>
          <div className="text-center p-2 rounded bg-muted/30">
            <p className={`text-sm font-bold ${sc(execution?.overall_health_score ?? 0)}`}>{(execution?.overall_health_score ?? 0).toFixed(1)}</p>
            <p className="text-[9px] text-muted-foreground">Execution Health</p>
          </div>
        </div>
        {interopNode && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {["metadata_exchange_status", "verification_sync_status", "compliance_sync_status"].map((k) => (
              <Badge key={k} variant="outline" className="text-[9px] gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${interopNode[k] === "active" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                {k.replace(/_/g, " ").replace(" status", "")}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
