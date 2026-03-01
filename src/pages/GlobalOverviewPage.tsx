import { useState } from "react";
import { useGlobalFederations, useFederationMembers, useGlobalExecutionIndex, useFederationComplianceIndex, useCrossBorderCollaborations, useFederationInteropStatus } from "@/hooks/useGlobalFederation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Activity, ShieldCheck, Network, Handshake } from "lucide-react";

function sc(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

function statusDot(s: string) {
  if (s === "active") return "bg-emerald-500";
  if (s === "syncing") return "bg-amber-500";
  return "bg-muted-foreground";
}

export default function GlobalOverviewPage() {
  const { data: federations = [] } = useGlobalFederations();
  const [selectedId, setSelectedId] = useState<string>("");
  const { data: members = [] } = useFederationMembers(selectedId);
  const { data: execution } = useGlobalExecutionIndex(selectedId);
  const { data: compliance } = useFederationComplianceIndex(selectedId);
  const { data: collabs = [] } = useCrossBorderCollaborations();
  const { data: interop = [] } = useFederationInteropStatus(selectedId);

  const globalScore = execution?.overall_global_score ?? 0;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Global Federation Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Cross-national institutional execution intelligence</p>
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
        <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">Select a federation to view global overview.</CardContent></Card>
      )}

      {selectedId && (
        <>
          {/* Global Score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Global Execution Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <span className={`text-4xl font-bold ${sc(globalScore)}`}>{globalScore.toFixed(0)}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
                <Badge variant="outline">{members.length} countries</Badge>
                <Badge variant="outline">{collabs.length} cross-border projects</Badge>
              </div>
              {execution ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Completion Rate", value: execution.aggregate_completion_rate },
                    { label: "Governance", value: execution.aggregate_governance_score },
                    { label: "Compliance", value: execution.aggregate_compliance_score },
                    { label: "Engagement", value: execution.aggregate_engagement_score },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                      <p className={`text-xl font-bold ${sc(m.value)}`}>{m.value.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No execution data available.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Member Countries */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Network className="h-4 w-4 text-primary" /> Member Countries</CardTitle>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <div className="space-y-1.5">
                    {members.map((m: any) => (
                      <div key={m.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span className="text-foreground">{m.national_registry?.country_name ?? "Unknown"}</span>
                        <Badge variant="outline" className="text-[10px] ml-auto">{m.national_registry?.country_code}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No members.</p>
                )}
              </CardContent>
            </Card>

            {/* Compliance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Federation Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                {compliance ? (
                  <div className="space-y-2">
                    {[
                      { label: "Cross-Border Transparency", value: compliance.cross_border_transparency_score },
                      { label: "Audit Integrity", value: compliance.audit_integrity_score },
                      { label: "Certification Verifiability", value: compliance.certification_verifiability_score },
                      { label: "Governance Alignment", value: compliance.governance_alignment_score },
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
          </div>

          {/* Interoperability */}
          {interop.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Handshake className="h-4 w-4" /> Node Interoperability Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {interop.map((n: any) => (
                    <div key={n.id} className="flex items-center gap-3 text-sm p-2 rounded bg-muted/30">
                      <span className="font-medium text-foreground w-32 shrink-0">{n.national_registry?.country_name ?? "—"}</span>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] gap-1"><div className={`w-1.5 h-1.5 rounded-full ${statusDot(n.metadata_exchange_status)}`} />Metadata</Badge>
                        <Badge variant="outline" className="text-[10px] gap-1"><div className={`w-1.5 h-1.5 rounded-full ${statusDot(n.verification_sync_status)}`} />Verification</Badge>
                        <Badge variant="outline" className="text-[10px] gap-1"><div className={`w-1.5 h-1.5 rounded-full ${statusDot(n.compliance_sync_status)}`} />Compliance</Badge>
                      </div>
                      {n.last_sync_at && <span className="text-[10px] text-muted-foreground ml-auto">{new Date(n.last_sync_at).toLocaleDateString()}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cross-Border Collaborations */}
          {collabs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cross-Border Collaborations ({collabs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {collabs.slice(0, 10).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/30">
                      <span className="text-foreground">{c.originating_country}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-foreground">{c.collaborating_country}</span>
                      <Badge variant="secondary" className="text-[10px] ml-auto">{c.collaboration_type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
