import { MainLayout } from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Shield, AlertTriangle, CheckCircle, Clock, Rocket, Lock, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function GlobalNodeDeploymentPage() {
  const { data: nodes } = useQuery({
    queryKey: ["country-nodes"],
    queryFn: async () => {
      const { data } = await supabase.from("country_nodes" as any).select("*").order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const { data: onboarding } = useQuery({
    queryKey: ["node-onboarding"],
    queryFn: async () => {
      const { data } = await supabase.from("node_onboarding_status" as any).select("*").order("step_order");
      return (data || []) as any[];
    },
  });

  const { data: riskAlerts } = useQuery({
    queryKey: ["node-risk-alerts"],
    queryFn: async () => {
      const { data } = await supabase.from("node_risk_alerts" as any).select("*").order("created_at", { ascending: false }).limit(20);
      return (data || []) as any[];
    },
  });

  const { data: throttleRules } = useQuery({
    queryKey: ["expansion-throttle"],
    queryFn: async () => {
      const { data } = await supabase.from("expansion_throttle_rules" as any).select("*").eq("is_active", true);
      return (data || []) as any[];
    },
  });

  const activeNodes = nodes?.filter((n: any) => n.node_status === "active").length || 0;
  const pilotNodes = nodes?.filter((n: any) => n.node_status === "pilot").length || 0;
  const certifiedNodes = nodes?.filter((n: any) => n.certification_status === "certified").length || 0;

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "default";
      case "pilot": return "secondary";
      case "suspended": return "destructive";
      default: return "outline";
    }
  };

  return (
    <MainLayout>
      <div className="px-4 py-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Global Node Deployment</h1>
            <p className="text-muted-foreground">Sovereign innovation infrastructure across countries</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Nodes", value: nodes?.length || 0, icon: Globe },
            { label: "Active", value: activeNodes, icon: CheckCircle },
            { label: "Pilot", value: pilotNodes, icon: Rocket },
            { label: "SIP Certified", value: certifiedNodes, icon: Shield },
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

        <Tabs defaultValue="nodes">
          <TabsList className="flex-wrap">
            <TabsTrigger value="nodes"><Globe className="h-4 w-4 mr-1" />Nodes</TabsTrigger>
            <TabsTrigger value="onboarding"><Clock className="h-4 w-4 mr-1" />Onboarding</TabsTrigger>
            <TabsTrigger value="isolation"><Lock className="h-4 w-4 mr-1" />Isolation</TabsTrigger>
            <TabsTrigger value="certification"><Shield className="h-4 w-4 mr-1" />Certification</TabsTrigger>
            <TabsTrigger value="risk"><AlertTriangle className="h-4 w-4 mr-1" />Risk</TabsTrigger>
            <TabsTrigger value="throttle"><BarChart3 className="h-4 w-4 mr-1" />Throttle</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes">
            <Card>
              <CardHeader><CardTitle>Country Node Registry</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(!nodes || nodes.length === 0) && <p className="text-muted-foreground text-sm">No country nodes deployed yet.</p>}
                {nodes?.map((n: any) => (
                  <div key={n.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌍</span>
                        <span className="font-semibold">{n.country_name}</span>
                        {n.country_code && <span className="text-xs text-muted-foreground">({n.country_code})</span>}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={statusColor(n.node_status) as any}>{n.node_status}</Badge>
                        <Badge variant={n.certification_status === "certified" ? "default" : "outline"}>{n.certification_status}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <span>Residency: {n.data_residency_location || "TBD"}</span>
                      <span>Currencies: {(n.currency_supported || []).join(", ") || "TBD"}</span>
                      <span>Compliance: {n.compliance_status}</span>
                      <span>Launch: {n.launch_date || "Pending"}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding">
            <Card>
              <CardHeader><CardTitle>Node Onboarding Workflow</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-medium text-sm">Standard Onboarding Steps</h4>
                  <div className="space-y-2">
                    {["Legal Review", "Regulatory Compatibility", "Data Residency Setup", "Financial Gateway Integration", "Local Arbitration Approval", "Governance Alignment Certification", "SIP Compliance Audit", "Pilot University Activation"].map((step, i) => (
                      <div key={step} className="flex items-center gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {(!onboarding || onboarding.length === 0) && <p className="text-muted-foreground text-sm">No active onboarding processes.</p>}
                {onboarding?.map((o: any) => (
                  <div key={o.id} className="p-3 rounded-lg border border-border flex items-center justify-between">
                    <span className="text-sm">{o.step_name}</span>
                    <Badge variant={o.status === "completed" ? "default" : o.status === "in_progress" ? "secondary" : "outline"}>{o.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="isolation">
            <Card>
              <CardHeader><CardTitle>Sovereign Data Isolation</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { rule: "Country-Specific Data Partition", desc: "Each node operates on isolated database partitions with no cross-node raw data sharing." },
                  { rule: "Anonymized Global Feed", desc: "Global intelligence layer receives only aggregated, anonymized metrics." },
                  { rule: "Local Audit Storage", desc: "All audit logs and compliance records stored within the node's data residency jurisdiction." },
                  { rule: "Local Arbitration Independence", desc: "Dispute resolution operates autonomously within each sovereign node." },
                  { rule: "Cross-Border Simulation Only", desc: "Capital cannot move cross-border without compliance validation. Simulation mode available." },
                ].map((r) => (
                  <div key={r.rule} className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{r.rule}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certification">
            <Card>
              <CardHeader><CardTitle>SIP Node Certification</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { req: "Escrow Integrity", desc: "All escrow flows audited and compliant with SIP standard." },
                    { req: "Arbitration Independence", desc: "Local arbitration body operates without external interference." },
                    { req: "Trust Score Transparency", desc: "Trust calculations are versioned, auditable, and node-local." },
                    { req: "Compliance Audit", desc: "Annual regulatory compliance audit completed and published." },
                    { req: "AI Bias Audit", desc: "AI systems audited for bias with public report." },
                    { req: "Data Sovereignty", desc: "Data residency requirements met with cryptographic proof." },
                  ].map((r) => (
                    <div key={r.req} className="p-3 rounded-lg border border-border space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{r.req}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <Card>
              <CardHeader><CardTitle>Node Risk Monitoring</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(!riskAlerts || riskAlerts.length === 0) && <p className="text-muted-foreground text-sm">No risk alerts detected.</p>}
                {riskAlerts?.map((a: any) => (
                  <div key={a.id} className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${a.severity === "critical" ? "text-destructive" : "text-yellow-500"}`} />
                        <span className="font-medium text-sm">{a.risk_type.replace(/_/g, " ")}</span>
                      </div>
                      <Badge variant={a.review_status === "open" ? "destructive" : "secondary"}>{a.review_status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                  </div>
                ))}
                <div className="p-4 rounded-lg bg-muted/50 mt-4">
                  <h4 className="font-medium text-sm mb-2">Monitored Risk Types</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    {["Political Interference", "Capital Concentration", "Governance Imbalance", "Arbitration Bias", "Financial Irregularities"].map((r) => (
                      <div key={r} className="p-2 rounded bg-background border text-center">{r}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="throttle">
            <Card>
              <CardHeader><CardTitle>Expansion Throttle Controls</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(!throttleRules || throttleRules.length === 0) && (
                  <div className="space-y-3">
                    {[
                      { rule: "Max New Nodes Per Year", threshold: 5, current: nodes?.length || 0 },
                      { rule: "Revenue Threshold (M PKR)", threshold: 100, current: 0 },
                      { rule: "Capital Buffer Requirement (M PKR)", threshold: 50, current: 0 },
                      { rule: "Operational Capacity Score", threshold: 80, current: 0 },
                    ].map((r) => (
                      <div key={r.rule} className="p-4 rounded-lg border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{r.rule}</span>
                          <Badge variant={r.current >= r.threshold ? "destructive" : "default"}>
                            {r.current >= r.threshold ? "Blocking" : "Clear"}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Current: {r.current}</span><span>Threshold: {r.threshold}</span>
                        </div>
                        <Progress value={r.threshold > 0 ? (r.current / r.threshold) * 100 : 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                )}
                {throttleRules?.map((r: any) => (
                  <div key={r.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{r.rule_name}</span>
                      <Badge variant={r.is_blocking ? "destructive" : "default"}>{r.is_blocking ? "Blocking" : "Clear"}</Badge>
                    </div>
                    <Progress value={r.threshold_value > 0 ? ((r.current_value || 0) / r.threshold_value) * 100 : 0} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
