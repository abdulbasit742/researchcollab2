import { MainLayout } from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, GitBranch, BarChart3, Shield, AlertTriangle, Archive } from "lucide-react";

export default function EnterpriseScalingPage() {
  const { data: domains } = useQuery({
    queryKey: ["enterprise-domains"],
    queryFn: async () => {
      const { data } = await supabase.from("enterprise_domains" as any).select("*").order("tier").order("domain_name");
      return (data || []) as any[];
    },
  });

  const { data: decisions } = useQuery({
    queryKey: ["decision-matrix"],
    queryFn: async () => {
      const { data } = await supabase.from("decision_matrix" as any).select("*").eq("is_active", true);
      return (data || []) as any[];
    },
  });

  const defaultDomains = [
    { name: "Protocol & Governance", director: "Protocol Director", tier: 3, kpis: ["Amendment stability", "Certification rate"] },
    { name: "Capital & Finance", director: "Finance Director", tier: 3, kpis: ["Escrow volume", "Capital efficiency"] },
    { name: "Intelligence & AI", director: "Intelligence Director", tier: 3, kpis: ["Forecast accuracy", "Bias index"] },
    { name: "Node Deployment", director: "Expansion Director", tier: 3, kpis: ["Deployment cycle time", "Certification speed"] },
    { name: "Enterprise Partnerships", director: "Partnerships Director", tier: 3, kpis: ["Partner retention", "Revenue per partner"] },
    { name: "Compliance & Arbitration", director: "Compliance Director", tier: 3, kpis: ["Resolution time", "Fairness index"] },
    { name: "Product & Engineering", director: "CTO", tier: 3, kpis: ["Uptime", "Feature velocity"] },
    { name: "Security & Infrastructure", director: "CISO", tier: 3, kpis: ["Incident count", "Response time"] },
  ];

  const displayDomains = domains && domains.length > 0 ? domains : defaultDomains.map((d, i) => ({ id: i, domain_name: d.name, domain_director: d.director, tier: d.tier, kpi_ownership: d.kpis, is_active: true }));

  return (
    <MainLayout>
      <div className="px-4 py-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Enterprise Organizational Scaling</h1>
            <p className="text-muted-foreground">Internal operating architecture for institutional-grade operations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Domains", value: displayDomains.length, icon: Building2 },
            { label: "Decision Types", value: decisions?.length || 0, icon: GitBranch },
            { label: "Leadership Tiers", value: 4, icon: Users },
            { label: "Active KPIs", value: displayDomains.reduce((s: number, d: any) => s + (d.kpi_ownership?.length || 0), 0), icon: BarChart3 },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-3 flex items-center gap-3">
                <s.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="domains">
          <TabsList className="flex-wrap">
            <TabsTrigger value="domains"><Building2 className="h-4 w-4 mr-1" />Domains</TabsTrigger>
            <TabsTrigger value="leadership"><Users className="h-4 w-4 mr-1" />Leadership</TabsTrigger>
            <TabsTrigger value="decisions"><GitBranch className="h-4 w-4 mr-1" />Decisions</TabsTrigger>
            <TabsTrigger value="kpis"><BarChart3 className="h-4 w-4 mr-1" />KPIs</TabsTrigger>
            <TabsTrigger value="risk"><AlertTriangle className="h-4 w-4 mr-1" />Risk</TabsTrigger>
            <TabsTrigger value="succession"><Shield className="h-4 w-4 mr-1" />Succession</TabsTrigger>
          </TabsList>

          <TabsContent value="domains">
            <Card>
              <CardHeader><CardTitle>Organizational Domain Structure</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3">
                {displayDomains.map((d: any) => (
                  <div key={d.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{d.domain_name}</span>
                      <Badge variant="outline">Tier {d.tier}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Director: {d.domain_director || "TBD"}</p>
                    <div className="flex flex-wrap gap-1">
                      {(d.kpi_ownership || []).map((k: string) => (
                        <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leadership">
            <Card>
              <CardHeader><CardTitle>4-Tier Leadership Structure</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { tier: 1, title: "Founder–Chair", scope: "Vision & Governance", desc: "Sets strategic direction, proposes protocol amendments, veto on structural changes. Cannot manage Tier 4 directly." },
                  { tier: 2, title: "CEO", scope: "Execution & Growth", desc: "Operational strategy, revenue management, team scaling. Cannot alter protocol or neutrality charter alone." },
                  { tier: 3, title: "Domain Presidents / Directors", scope: "Domain Leadership", desc: "Own domain KPIs, propose domain-level decisions, manage functional leads." },
                  { tier: 4, title: "Functional Leads", scope: "Execution Teams", desc: "Execute domain strategy, report to Domain Directors. Founder cannot directly manage this tier." },
                ].map((t) => (
                  <div key={t.tier} className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{t.tier}</span>
                      <div>
                        <span className="font-semibold text-sm">{t.title}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {t.scope}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground ml-11">{t.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decisions">
            <Card>
              <CardHeader><CardTitle>Decision Rights Matrix</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-muted-foreground font-medium">Decision Type</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">Proposer</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">Reviewer</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">Approver</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">Veto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(decisions && decisions.length > 0 ? decisions : [
                        { decision_type: "Protocol Amendment", proposer_role: "Protocol Director", reviewer_role: "Foundation Board", approver_role: "Governance Vote", veto_authority: "Founder–Chair" },
                        { decision_type: "Capital Allocation Policy", proposer_role: "Finance Director", reviewer_role: "CEO", approver_role: "Board", veto_authority: "Foundation" },
                        { decision_type: "Node Expansion", proposer_role: "Expansion Director", reviewer_role: "Compliance Director", approver_role: "CEO + Board", veto_authority: "Foundation" },
                        { decision_type: "AI Model Update", proposer_role: "Intelligence Director", reviewer_role: "Ethics Council", approver_role: "Protocol Director", veto_authority: "Foundation" },
                        { decision_type: "Equity Framework Change", proposer_role: "Finance Director", reviewer_role: "Legal", approver_role: "Board + Foundation", veto_authority: "Founder–Chair" },
                      ]).map((d: any, i: number) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="p-2 font-medium">{d.decision_type}</td>
                          <td className="p-2 text-muted-foreground">{d.proposer_role}</td>
                          <td className="p-2 text-muted-foreground">{d.reviewer_role}</td>
                          <td className="p-2 text-muted-foreground">{d.approver_role}</td>
                          <td className="p-2 text-muted-foreground">{d.veto_authority || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpis">
            <Card>
              <CardHeader><CardTitle>Domain KPI Dashboard</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { domain: "Protocol & Governance", kpis: [{ name: "Amendment Stability", target: "95%", status: "on_track" }, { name: "Certification Compliance", target: "100%", status: "on_track" }] },
                  { domain: "Capital & Finance", kpis: [{ name: "Escrow Volume (M PKR)", target: "500", status: "on_track" }, { name: "Capital Efficiency", target: ">80%", status: "on_track" }] },
                  { domain: "Intelligence & AI", kpis: [{ name: "Forecast Accuracy", target: ">85%", status: "on_track" }, { name: "Bias Index", target: "<0.05", status: "on_track" }] },
                  { domain: "Node Deployment", kpis: [{ name: "Deployment Cycle (days)", target: "<60", status: "on_track" }, { name: "Certification Speed (days)", target: "<30", status: "on_track" }] },
                  { domain: "Compliance & Arbitration", kpis: [{ name: "Resolution Time (days)", target: "<14", status: "on_track" }, { name: "Fairness Index", target: ">90%", status: "on_track" }] },
                ].map((d) => (
                  <div key={d.domain} className="p-4 rounded-lg border border-border space-y-2">
                    <span className="font-semibold text-sm">{d.domain}</span>
                    <div className="grid md:grid-cols-2 gap-2">
                      {d.kpis.map((k) => (
                        <div key={k.name} className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
                          <span>{k.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Target: {k.target}</span>
                            <Badge variant="default" className="text-xs">On Track</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <Card>
              <CardHeader><CardTitle>Institutional Risk Dashboard</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { risk: "Domain Power Concentration", desc: "Monitor if any single domain accumulates disproportionate decision authority." },
                  { risk: "Decision Bottleneck", desc: "Detect when approval queues exceed SLA thresholds across domains." },
                  { risk: "Founder Dependency", desc: "Track percentage of decisions requiring founder involvement vs delegation." },
                  { risk: "Governance Conflict", desc: "Identify competing directives between protocol governance and commercial operations." },
                  { risk: "Operational Overload", desc: "Monitor team capacity utilization against expansion commitments." },
                ].map((r) => (
                  <div key={r.risk} className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-sm">{r.risk}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="succession">
            <Card>
              <CardHeader><CardTitle>Succession & Bench Planning</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-medium text-sm">Per-Domain Succession Readiness</h4>
                  <div className="space-y-2">
                    {(displayDomains as any[]).slice(0, 8).map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between text-sm">
                        <span>{d.domain_name}</span>
                        <Badge variant="outline">Backup: TBD</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-medium text-sm">Compensation Alignment Principles</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Long-term protocol stability incentives</li>
                    <li>• Neutrality compliance bonuses</li>
                    <li>• Capital efficiency metrics</li>
                    <li>• Dispute fairness KPIs</li>
                    <li>• Node stability contributions</li>
                    <li>• No short-term revenue-only incentives</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
