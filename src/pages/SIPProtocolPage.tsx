import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Globe, Shield, FileText, Scale, Landmark, Network, Lock, BookOpen, ArrowRightLeft, Database } from "lucide-react";

function useSIPVersions() {
  return useQuery({
    queryKey: ["sip-versions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sip_versions")
        .select("*")
        .order("activation_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

function useSIPNodes() {
  return useQuery({
    queryKey: ["sip-nodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sip_node_registry")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

const EVENT_TYPES = [
  { type: "FYP_CREATED", desc: "A Final Year Project is registered on the platform", category: "Education" },
  { type: "MILESTONE_APPROVED", desc: "A project milestone passes review and approval", category: "Execution" },
  { type: "ESCROW_FUNDED", desc: "Capital is locked into an escrow wallet for a contract", category: "Finance" },
  { type: "ESCROW_RELEASED", desc: "Escrowed funds are released upon milestone completion", category: "Finance" },
  { type: "CONTRACT_SIGNED", desc: "A legally binding contract receives all required signatures", category: "Legal" },
  { type: "DISPUTE_RESOLVED", desc: "An arbitration case reaches a final verdict", category: "Governance" },
  { type: "STUDENT_HIRED", desc: "A student receives a formal employment offer through the platform", category: "Talent" },
  { type: "SPINOFF_CREATED", desc: "A project converts into a registered startup entity", category: "Innovation" },
  { type: "EQUITY_ISSUED", desc: "New equity shares are allocated in a cap table", category: "Ownership" },
  { type: "CAPITAL_ALLOCATED", desc: "Funds are allocated from a capital pool to a venture", category: "Finance" },
];

const TRUST_INDICES = [
  { name: "Trust Score", key: "trust_score", desc: "Composite score (0-100) derived from all indices below. Determines tier placement (Bronze/Silver/Gold/Platinum)." },
  { name: "Delivery Index", key: "delivery_index", desc: "On-time milestone completion rate weighted by project complexity and escrow value." },
  { name: "Financial Reliability", key: "financial_reliability_index", desc: "Payment consistency, escrow success rate, and absence of financial disputes." },
  { name: "Collaboration Index", key: "collaboration_index", desc: "Peer review scores, team contribution ratings, and communication quality." },
  { name: "Compliance Index", key: "compliance_index", desc: "Adherence to platform contracts, IP agreements, and regulatory requirements." },
  { name: "Consistency Index", key: "consistency_index", desc: "Stability of performance over time. Penalizes erratic behavior patterns." },
];

const categoryColors: Record<string, string> = {
  Education: "bg-chart-1/20 text-chart-1",
  Execution: "bg-chart-2/20 text-chart-2",
  Finance: "bg-chart-3/20 text-chart-3",
  Legal: "bg-chart-4/20 text-chart-4",
  Governance: "bg-chart-5/20 text-chart-5",
  Talent: "bg-primary/10 text-primary",
  Innovation: "bg-accent text-accent-foreground",
  Ownership: "bg-secondary text-secondary-foreground",
};

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/50">
      <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Icon className="h-5 w-5 text-primary" /> {title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function SIPProtocolPage() {
  const { data: versions = [] } = useSIPVersions();
  const { data: nodes = [] } = useSIPNodes();
  const activeVersion = versions.find((v) => v.is_active);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Sovereign Innovation Protocol</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            An open standard for education-to-economy systems. Defines canonical data formats, trust computation, economic flows, contract integrity, and arbitration across sovereign nodes.
          </p>
          {activeVersion && (
            <Badge variant="outline" className="text-sm">Current Version: {activeVersion.version}</Badge>
          )}
        </div>

        <Separator />

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="events">Event Standard</TabsTrigger>
            <TabsTrigger value="trust">Trust Protocol</TabsTrigger>
            <TabsTrigger value="economic">Economic Ledger</TabsTrigger>
            <TabsTrigger value="capital">Capital Allocation</TabsTrigger>
            <TabsTrigger value="contracts">Contract Standard</TabsTrigger>
            <TabsTrigger value="arbitration">Arbitration Protocol</TabsTrigger>
            <TabsTrigger value="nodes">Sovereign Nodes</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
          </TabsList>

          {/* Innovation Event Standard */}
          <TabsContent value="events">
            <Section icon={Database} title="Innovation Event Standard (IES)">
              <p className="text-sm text-muted-foreground mb-4">
                All platform-significant actions emit canonical events following a standardized schema. These events form the global event language for interoperability.
              </p>
              <div className="space-y-2">
                {EVENT_TYPES.map((e) => (
                  <div key={e.type} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
                    <div className="flex items-center gap-3">
                      <Badge className={categoryColors[e.category] || ""}>{e.category}</Badge>
                      <code className="text-xs font-mono text-primary bg-primary/5 px-2 py-1 rounded">{e.type}</code>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-sm text-right">{e.desc}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Event Schema</p>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono text-muted-foreground">
{`{
  "event_id": "uuid",
  "event_type": "MILESTONE_APPROVED",
  "node_id": "primary",
  "timestamp": "ISO-8601",
  "entity_type": "milestone",
  "entity_id": "uuid",
  "actor_id": "uuid",
  "impact_value": 50000,
  "risk_score": 0.12,
  "trust_delta": +3,
  "ledger_reference": "uuid",
  "sip_version": "1.0.0"
}`}
                </pre>
              </div>
            </Section>
          </TabsContent>

          {/* Trust Protocol */}
          <TabsContent value="trust">
            <Section icon={Shield} title="Trust & Reputation Protocol">
              <p className="text-sm text-muted-foreground mb-4">
                Universal trust schema computed locally by each sovereign node. Scores are transparent, versioned, and auditable. The global layer aggregates only anonymized metrics.
              </p>
              <div className="space-y-3">
                {TRUST_INDICES.map((t) => (
                  <div key={t.key} className="p-3 rounded-lg border border-border/50 bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <code className="text-xs font-mono text-muted-foreground">{t.key}</code>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-2">Principles</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Trust calculations are node-local — no central authority</li>
                  <li>Every score change is logged with cause and evidence</li>
                  <li>Tier transitions (Bronze→Silver→Gold→Platinum) require sustained performance</li>
                  <li>Dispute outcomes impact trust bidirectionally</li>
                  <li>Admin overrides are audited and rate-limited</li>
                </ul>
              </div>
            </Section>
          </TabsContent>

          {/* Economic Ledger */}
          <TabsContent value="economic">
            <Section icon={ArrowRightLeft} title="Economic Ledger Protocol">
              <p className="text-sm text-muted-foreground mb-4">
                Standardized ledger entry format ensuring interoperability across sovereign nodes and multi-currency environments.
              </p>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono text-muted-foreground">
{`{
  "ledger_id": "uuid",
  "node_id": "primary",
  "transaction_type": "escrow_release | payment | refund | commission | allocation",
  "capital_flow_direction": "inbound | outbound | internal",
  "amount": 150000,
  "currency": "PKR | USD | EUR | AED",
  "related_contract": "uuid",
  "escrow_reference": "uuid",
  "impact_category": "fyp | startup | research | employment",
  "timestamp": "ISO-8601"
}`}
              </pre>
              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="text-sm font-semibold text-foreground mb-2">Multi-Currency Rules</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>All amounts stored in native currency with USD reference rate</li>
                  <li>FX conversion tracked and auditable</li>
                  <li>Commission calculated in transaction currency</li>
                  <li>Cross-node transfers require currency declaration</li>
                </ul>
              </div>
            </Section>
          </TabsContent>

          {/* Capital Allocation */}
          <TabsContent value="capital">
            <Section icon={Landmark} title="Capital Allocation Standard">
              <p className="text-sm text-muted-foreground mb-4">
                Structured schema for cross-node capital simulation and allocation while preserving compliance and sovereignty.
              </p>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono text-muted-foreground">
{`{
  "allocation_id": "uuid",
  "capital_pool_id": "uuid",
  "destination_node": "node_id",
  "sector_tag": "edtech | biotech | fintech | cleantech",
  "risk_band": "low | medium | high | speculative",
  "allocation_amount": 5000000,
  "currency": "PKR",
  "approval_chain": ["pool_manager", "compliance_officer"],
  "ai_recommendation_score": 0.87,
  "escrow_required": true,
  "contract_reference": "uuid"
}`}
              </pre>
            </Section>
          </TabsContent>

          {/* Contract Standard */}
          <TabsContent value="contracts">
            <Section icon={FileText} title="Contract & Signature Standard">
              <p className="text-sm text-muted-foreground mb-4">
                Ensures document integrity, multi-signature support, and external legal validation capability.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { rule: "Document Hash Required", desc: "SHA-256 content hash stored at signature time" },
                  { rule: "Signature Hash Required", desc: "Cryptographic signature with timestamp and device metadata" },
                  { rule: "Multi-Signature Support", desc: "2-party through N-party agreements with ordered or parallel signing" },
                  { rule: "Immutable Audit Trail", desc: "Every signature action logged with IP, device, and jurisdiction" },
                  { rule: "Jurisdiction Tagging", desc: "Each contract tagged with applicable legal jurisdiction(s)" },
                  { rule: "Revocation Protocol", desc: "Signed contracts can only be voided through formal arbitration" },
                ].map((r) => (
                  <div key={r.rule} className="p-3 rounded-lg border border-border/50 bg-card">
                    <p className="text-sm font-semibold text-foreground">{r.rule}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* Arbitration Protocol */}
          <TabsContent value="arbitration">
            <Section icon={Scale} title="Arbitration Protocol">
              <p className="text-sm text-muted-foreground mb-4">
                Standardized dispute resolution integrating with escrow and equity systems.
              </p>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono text-muted-foreground">
{`{
  "dispute_id": "uuid",
  "dispute_type": "milestone | payment | ip_ownership | equity | quality",
  "freeze_scope": "escrow | cap_table | both | none",
  "evidence_log_reference": "uuid[]",
  "arbitration_tier": "faculty | institutional | platform | external",
  "verdict_type": "full_release | partial_release | refund | redo | penalty | termination",
  "verdict_effect": {
    "escrow_action": "release | refund | split",
    "trust_impact": { "initiator": -5, "respondent": +3 },
    "cap_table_frozen": false
  },
  "appeal_status": "none | filed | reviewed | denied"
}`}
              </pre>
              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="text-sm font-semibold text-foreground mb-2">Arbitration Tiers</p>
                <div className="space-y-2">
                  {[
                    { tier: "Level 1", label: "Faculty Mediation", desc: "Informal resolution by assigned faculty advisor" },
                    { tier: "Level 2", label: "Institutional Arbitration", desc: "Formal review by institution's dispute committee" },
                    { tier: "Level 3", label: "Platform Arbitration", desc: "Cross-institutional panel with trust-weighted selection" },
                    { tier: "Level 4", label: "External Legal", desc: "Referral to jurisdiction-appropriate legal framework" },
                  ].map((t) => (
                    <div key={t.tier} className="flex items-center gap-3 p-2 rounded border border-border/30">
                      <Badge variant="outline" className="text-xs min-w-[60px] justify-center">{t.tier}</Badge>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </TabsContent>

          {/* Sovereign Nodes */}
          <TabsContent value="nodes">
            <Section icon={Network} title="Sovereign Node Registry">
              <p className="text-sm text-muted-foreground mb-4">
                Each node maintains full data sovereignty while participating in the federation network through standardized APIs.
              </p>
              {nodes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active sovereign nodes registered.</p>
              ) : (
                <div className="space-y-3">
                  {nodes.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg border border-border/50 bg-card flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{n.node_name}</p>
                        <p className="text-xs text-muted-foreground">{n.node_id} · {n.country_code || "Global"} · {n.jurisdiction || "—"}</p>
                      </div>
                      <Badge variant="outline">{n.isolation_mode}</Badge>
                    </div>
                  ))}
                </div>
              )}
              <Separator className="my-4" />
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-2">Isolation Rules</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Each node controls its own data, compliance, and arbitration</li>
                  <li>Capital pools remain node-local unless explicitly federated</li>
                  <li>Trust calculations are computed locally using the standard formula</li>
                  <li>Global layer receives only aggregated, anonymized metrics</li>
                  <li>No raw PII crosses node boundaries</li>
                </ul>
              </div>
            </Section>
          </TabsContent>

          {/* Versions */}
          <TabsContent value="versions">
            <Section icon={BookOpen} title="Protocol Versions">
              <p className="text-sm text-muted-foreground mb-4">
                All protocol changes are versioned. Breaking changes require version increments. Backward compatibility is guaranteed within major versions.
              </p>
              {versions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No versions published.</p>
              ) : (
                <div className="space-y-3">
                  {versions.map((v) => (
                    <div key={v.id} className="p-4 rounded-lg border border-border/50 bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-bold text-primary">v{v.version}</code>
                          {v.is_active && <Badge>Active</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {v.activation_date ? new Date(v.activation_date).toLocaleDateString() : "Not activated"}
                        </p>
                      </div>
                      <p className="text-sm text-foreground">{v.change_summary}</p>
                      {v.compatibility_notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{v.compatibility_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
