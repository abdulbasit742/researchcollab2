import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Shield, Users, FileText, Award, Scale, ScrollText, Globe, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

function useFoundationData() {
  const board = useQuery({
    queryKey: ["sip-foundation-board"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sip_foundation_board").select("*").eq("is_active", true).order("appointed_at");
      if (error) throw error;
      return data || [];
    },
  });
  const amendments = useQuery({
    queryKey: ["sip-amendments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sip_amendment_logs").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
  });
  const certifiedNodes = useQuery({
    queryKey: ["sip-certified-nodes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sip_certified_nodes").select("*").eq("is_active", true).order("certified_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
  const charter = useQuery({
    queryKey: ["sip-neutrality-charter"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sip_neutrality_charter").select("*").order("enacted_at");
      if (error) throw error;
      return data || [];
    },
  });
  const decisions = useQuery({
    queryKey: ["sip-governance-decisions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sip_governance_decisions").select("*").order("created_at", { ascending: false }).limit(30);
      if (error) throw error;
      return data || [];
    },
  });
  return { board, amendments, certifiedNodes, charter, decisions, isLoading: board.isLoading };
}

const memberTypeColor: Record<string, string> = {
  university: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  corporate: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  capital: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  technical: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  observer: "bg-muted text-muted-foreground border-border",
};

const statusColor: Record<string, string> = {
  proposed: "bg-muted text-muted-foreground",
  review: "bg-blue-500/10 text-blue-400",
  voting: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-destructive/10 text-destructive",
  activated: "bg-primary/10 text-primary",
};

export default function SIPFoundationPage() {
  const { board, amendments, certifiedNodes, charter, decisions, isLoading } = useFoundationData();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="h-4 w-4" /> Independent Foundation
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">SIP Foundation Governance</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparent governance ensuring protocol neutrality, institutional trust, and long-term adoption across sovereign nodes.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Board Members", value: board.data?.length || 0, icon: Users },
            { label: "Amendments", value: amendments.data?.length || 0, icon: FileText },
            { label: "Certified Nodes", value: certifiedNodes.data?.length || 0, icon: Award },
            { label: "Charter Principles", value: charter.data?.length || 0, icon: ScrollText },
            { label: "Decisions", value: decisions.data?.length || 0, icon: Scale },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4 text-center">
                <s.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="board" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1">
            <TabsTrigger value="board"><Users className="h-3 w-3 mr-1" />Board</TabsTrigger>
            <TabsTrigger value="charter"><ScrollText className="h-3 w-3 mr-1" />Neutrality Charter</TabsTrigger>
            <TabsTrigger value="amendments"><FileText className="h-3 w-3 mr-1" />Amendments</TabsTrigger>
            <TabsTrigger value="certifications"><Award className="h-3 w-3 mr-1" />Certifications</TabsTrigger>
            <TabsTrigger value="decisions"><Scale className="h-3 w-3 mr-1" />Decisions</TabsTrigger>
            <TabsTrigger value="succession"><AlertTriangle className="h-3 w-3 mr-1" />Succession</TabsTrigger>
            <TabsTrigger value="risk"><Globe className="h-3 w-3 mr-1" />Risk Framework</TabsTrigger>
          </TabsList>

          {/* Board */}
          <TabsContent value="board">
            <Card>
              <CardHeader><CardTitle className="text-sm">Governance Board</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">No single actor may hold &gt;25% influence. Board ensures protocol neutrality.</p>
                {(board.data?.length || 0) === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No board members appointed yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {board.data?.map((m: any) => (
                      <div key={m.id} className="p-4 rounded-lg border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{m.member_name}</span>
                          <Badge className={memberTypeColor[m.member_type] || ""} variant="outline">{m.member_type}</Badge>
                        </div>
                        {m.organization && <p className="text-xs text-muted-foreground">{m.organization}</p>}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Weight: {m.influence_weight}</span>
                          {m.term_ends_at && <span>Term ends: {format(new Date(m.term_ends_at), "MMM yyyy")}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Neutrality Charter */}
          <TabsContent value="charter">
            <Card>
              <CardHeader><CardTitle className="text-sm">Neutrality Charter</CardTitle></CardHeader>
              <CardContent>
                {(charter.data?.length || 0) === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-muted-foreground text-sm">Charter principles define immutable commitments.</p>
                    <div className="grid md:grid-cols-2 gap-3 text-left">
                      {[
                        { cat: "governance", title: "No Geopolitical Bias", text: "Protocol governance remains politically neutral across all jurisdictions." },
                        { cat: "data", title: "Transparent Scoring", text: "All trust and reputation algorithms are versioned, auditable, and explainable." },
                        { cat: "sovereignty", title: "Sovereign Node Independence", text: "Each node maintains full control over local data and compliance." },
                        { cat: "capital", title: "No Capital Manipulation", text: "Capital allocation follows transparent rules without preferential treatment." },
                        { cat: "ai", title: "AI Explainability Required", text: "All AI-driven decisions must provide human-readable reasoning." },
                        { cat: "dispute", title: "Audit Openness", text: "Foundation governance decisions and financials are publicly auditable." },
                      ].map((p) => (
                        <div key={p.title} className="p-4 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs capitalize">{p.cat}</Badge>
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Immutable</Badge>
                          </div>
                          <p className="font-medium text-foreground text-sm">{p.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{p.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {charter.data?.map((p: any) => (
                      <div key={p.id} className="p-4 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          {p.category && <Badge variant="outline" className="text-xs capitalize">{p.category}</Badge>}
                          {p.is_immutable && <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Immutable</Badge>}
                        </div>
                        <p className="font-medium text-foreground text-sm">{p.principle_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{p.principle_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amendments */}
          <TabsContent value="amendments">
            <Card>
              <CardHeader><CardTitle className="text-sm">Protocol Amendment History</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">All protocol changes follow: Proposal → Review → Technical Review → Board Vote → Version Increment → Activation.</p>
                {(amendments.data?.length || 0) === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No amendments submitted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {amendments.data?.map((a: any) => (
                      <div key={a.id} className="p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground text-sm">{a.amendment_title}</span>
                          <Badge className={statusColor[a.status] || ""} variant="outline">{a.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{a.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          {a.proposed_by && <span>By: {a.proposed_by}</span>}
                          {a.target_version && <span>Target: v{a.target_version}</span>}
                          <span>For: {a.votes_for} / Against: {a.votes_against}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certifications */}
          <TabsContent value="certifications">
            <Card>
              <CardHeader><CardTitle className="text-sm">SIP Certified Nodes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">Nodes must pass data compliance, arbitration compliance, escrow integrity, and trust transparency audits.</p>
                {(certifiedNodes.data?.length || 0) === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No certified nodes yet.</p>
                ) : (
                  <div className="space-y-3">
                    {certifiedNodes.data?.map((n: any) => (
                      <div key={n.id} className="p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{n.node_name}</span>
                          <Badge variant="outline" className="capitalize">{n.certification_level}</Badge>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <Badge variant={n.data_compliance ? "default" : "outline"} className="text-xs">Data ✓</Badge>
                          <Badge variant={n.arbitration_compliance ? "default" : "outline"} className="text-xs">Arbitration ✓</Badge>
                          <Badge variant={n.escrow_integrity ? "default" : "outline"} className="text-xs">Escrow ✓</Badge>
                          <Badge variant={n.trust_transparency ? "default" : "outline"} className="text-xs">Trust ✓</Badge>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{n.node_type} · {n.jurisdiction}</span>
                          {n.next_audit_due && <span>Next audit: {format(new Date(n.next_audit_due), "MMM yyyy")}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decisions */}
          <TabsContent value="decisions">
            <Card>
              <CardHeader><CardTitle className="text-sm">Governance Decisions</CardTitle></CardHeader>
              <CardContent>
                {(decisions.data?.length || 0) === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No governance decisions recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {decisions.data?.map((d: any) => (
                      <div key={d.id} className="p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground text-sm">{d.decision_title}</span>
                          <Badge variant="outline" className={d.outcome === "approved" ? "bg-emerald-500/10 text-emerald-400" : ""}>{d.outcome || "pending"}</Badge>
                        </div>
                        {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
                        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs capitalize">{d.decision_type}</Badge>
                          {d.quorum_met && <span className="text-emerald-400">Quorum met</span>}
                          <span>{format(new Date(d.created_at), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Succession */}
          <TabsContent value="succession">
            <Card>
              <CardHeader><CardTitle className="text-sm">Long-Term Succession Model</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Founder Sunset Clause", desc: "Founding influence decreases by 5% annually after year 5, ensuring gradual transition to community governance." },
                    { title: "Governance Continuity Plan", desc: "If board membership drops below quorum, emergency succession protocol activates with pre-designated stewards." },
                    { title: "Voting Quorum Thresholds", desc: "Protocol amendments require ≥60% participation. Constitutional changes require ≥75% supermajority." },
                    { title: "Emergency Override Safeguards", desc: "Emergency powers are time-limited (72h max) and require post-hoc ratification by full board within 14 days." },
                  ].map((item) => (
                    <div key={item.title} className="p-4 rounded-lg border border-border">
                      <p className="font-medium text-foreground text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Framework */}
          <TabsContent value="risk">
            <Card>
              <CardHeader><CardTitle className="text-sm">Risk Containment Framework</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { risk: "Political Capture", response: "Board diversity requirements, term limits, and geographic distribution mandates prevent any single political interest from controlling governance.", severity: "critical" },
                    { risk: "Hostile Capital Control", response: "No single capital contributor may exceed 25% influence. Voting power is capped regardless of financial contribution.", severity: "critical" },
                    { risk: "Governance Manipulation", response: "All votes are recorded immutably. Proxy voting is prohibited. Conflict of interest declarations are mandatory.", severity: "high" },
                    { risk: "Data Sovereignty Breach", response: "Sovereign nodes maintain full data isolation. Cross-node queries return only aggregated, anonymized metrics.", severity: "high" },
                    { risk: "AI Abuse", response: "AI Constitutional Guardian monitors all automated decisions. Manual override always available. Bias audits published quarterly.", severity: "medium" },
                  ].map((r) => (
                    <div key={r.risk} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground text-sm">{r.risk}</span>
                        <Badge variant="outline" className={r.severity === "critical" ? "bg-destructive/10 text-destructive" : r.severity === "high" ? "bg-amber-500/10 text-amber-400" : ""}>{r.severity}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.response}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
