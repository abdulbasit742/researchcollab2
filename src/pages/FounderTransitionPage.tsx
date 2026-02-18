import { MainLayout } from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Clock, Archive, AlertTriangle, Crown, Scale, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function FounderTransitionPage() {
  const { data: roles } = useQuery({
    queryKey: ["governance-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("governance_roles" as any).select("*").order("created_at");
      return (data || []) as any[];
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["role-assignments"],
    queryFn: async () => {
      const { data } = await supabase.from("governance_role_assignments" as any).select("*").eq("is_active", true);
      return (data || []) as any[];
    },
  });

  const { data: successions } = useQuery({
    queryKey: ["succession-events"],
    queryFn: async () => {
      const { data } = await supabase.from("succession_events" as any).select("*").order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const { data: memory } = useQuery({
    queryKey: ["institutional-memory"],
    queryFn: async () => {
      const { data } = await supabase.from("institutional_memory" as any).select("*").order("created_at", { ascending: false }).limit(20);
      return (data || []) as any[];
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ["anti-capture-alerts"],
    queryFn: async () => {
      const { data } = await supabase.from("anti_capture_alerts" as any).select("*").order("created_at", { ascending: false }).limit(20);
      return (data || []) as any[];
    },
  });

  const categoryIcons: Record<string, string> = {
    strategic_decision: "🎯",
    capital_shift: "💰",
    protocol_evolution: "🔄",
    ai_governance: "🤖",
    arbitration_precedent: "⚖️",
  };

  return (
    <MainLayout>
      <div className="px-4 py-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Founder Transition & Governance</h1>
            <p className="text-muted-foreground">Institutional continuity architecture for multi-decade stability</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Roles", value: roles?.length || 0, icon: Shield },
            { label: "Assigned Leaders", value: assignments?.length || 0, icon: Users },
            { label: "Succession Events", value: successions?.length || 0, icon: Clock },
            { label: "Capture Alerts", value: alerts?.filter((a: any) => a.review_status === "open").length || 0, icon: AlertTriangle },
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

        <Tabs defaultValue="roles">
          <TabsList className="flex-wrap">
            <TabsTrigger value="roles"><Shield className="h-4 w-4 mr-1" />Roles</TabsTrigger>
            <TabsTrigger value="succession"><Clock className="h-4 w-4 mr-1" />Succession</TabsTrigger>
            <TabsTrigger value="safeguards"><Scale className="h-4 w-4 mr-1" />Safeguards</TabsTrigger>
            <TabsTrigger value="memory"><Archive className="h-4 w-4 mr-1" />Memory</TabsTrigger>
            <TabsTrigger value="alerts"><AlertTriangle className="h-4 w-4 mr-1" />Alerts</TabsTrigger>
            <TabsTrigger value="emergency"><Zap className="h-4 w-4 mr-1" />Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            <Card>
              <CardHeader><CardTitle>Governance Role Architecture</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(!roles || roles.length === 0) && <p className="text-muted-foreground text-sm">No governance roles defined yet.</p>}
                {roles?.map((r: any) => (
                  <div key={r.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{r.role_name}</span>
                      <Badge variant={r.is_active ? "default" : "secondary"}>{r.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span>Power Level: {r.approval_power_level}</span>
                      <span>Term: {r.term_limit_months ? `${r.term_limit_months} months` : "No limit"}</span>
                      <span>Succession: {r.succession_rule || "Not defined"}</span>
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-medium text-sm">Authority Segmentation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded border border-border">
                      <p className="font-semibold text-primary mb-1">Founder–Chair</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>✅ Propose protocol amendments</li>
                        <li>✅ Veto structural changes</li>
                        <li>❌ Cannot override escrow</li>
                        <li>❌ Cannot modify cap table unilaterally</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded border border-border">
                      <p className="font-semibold text-primary mb-1">CEO</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>✅ Execute operational strategy</li>
                        <li>✅ Revenue management</li>
                        <li>❌ Cannot alter protocol alone</li>
                        <li>❌ Cannot alter neutrality charter</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="succession">
            <Card>
              <CardHeader><CardTitle>Succession Events & Transitions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(!successions || successions.length === 0) && <p className="text-muted-foreground text-sm">No succession events recorded.</p>}
                {successions?.map((s: any) => (
                  <div key={s.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{s.trigger_type}</Badge>
                      <Badge variant={s.status === "resolved" ? "default" : "secondary"}>{s.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.notes || "No notes"}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Audit: {s.audit_review_status}</span>
                      <span>Interim: {s.interim_appointed ? "Yes" : "No"}</span>
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-lg bg-muted/50 space-y-2 mt-4">
                  <h4 className="font-medium text-sm">Succession Triggers</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    {["Voluntary", "Term Limit", "Governance Vote", "Incapacity", "Emergency"].map((t) => (
                      <div key={t} className="p-2 rounded bg-background border text-center">{t}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safeguards">
            <Card>
              <CardHeader><CardTitle>Founder Sunset & Anti-Capture</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <h4 className="font-medium">Founder Sunset Clause</h4>
                  <p className="text-sm text-muted-foreground">Founder voting influence gradually reduces over a defined timeline. Emergency override only in protocol-level crisis.</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span>Year 1–3: Full Authority</span><span>100%</span></div>
                    <Progress value={100} className="h-2" />
                    <div className="flex justify-between text-xs"><span>Year 3–5: Reduced to 75%</span><span>75%</span></div>
                    <Progress value={75} className="h-2" />
                    <div className="flex justify-between text-xs"><span>Year 5–10: Advisory (50%)</span><span>50%</span></div>
                    <Progress value={50} className="h-2" />
                    <div className="flex justify-between text-xs"><span>Year 10+: Observer Role</span><span>25%</span></div>
                    <Progress value={25} className="h-2" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <h4 className="font-medium">Board Term & Rotation</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Fixed terms: 3–5 years</li>
                    <li>• Staggered rotation enforced</li>
                    <li>• No single actor &gt; 25% vote weight</li>
                    <li>• Automatic eligibility review at term end</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memory">
            <Card>
              <CardHeader><CardTitle>Institutional Memory Archive</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(!memory || memory.length === 0) && <p className="text-muted-foreground text-sm">No institutional memory records yet.</p>}
                {memory?.map((m: any) => (
                  <div key={m.id} className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center gap-2">
                      <span>{categoryIcons[m.category] || "📄"}</span>
                      <span className="font-medium text-sm">{m.title}</span>
                      <Badge variant="outline" className="ml-auto text-xs">{m.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                    {m.reasoning && <p className="text-xs text-muted-foreground italic">Reasoning: {m.reasoning}</p>}
                    <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader><CardTitle>Anti-Capture Detection</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(!alerts || alerts.length === 0) && <p className="text-muted-foreground text-sm">No capture alerts detected.</p>}
                {alerts?.map((a: any) => (
                  <div key={a.id} className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${a.severity === "critical" ? "text-destructive" : "text-yellow-500"}`} />
                        <span className="font-medium text-sm">{a.alert_type.replace(/_/g, " ")}</span>
                      </div>
                      <Badge variant={a.review_status === "open" ? "destructive" : "secondary"}>{a.review_status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency">
            <Card>
              <CardHeader><CardTitle>Emergency Stabilization Protocol</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { trigger: "Systemic Financial Failure", action: "Freeze all capital flows, activate emergency council, audit all escrow positions" },
                  { trigger: "Major AI Bias Detection", action: "Suspend affected AI systems, initiate independent review, publish transparency report" },
                  { trigger: "Regulatory Crisis", action: "Engage compliance council, pause affected operations, coordinate with legal advisors" },
                  { trigger: "Security Breach", action: "Lock affected systems, activate incident response, notify affected parties within 24h" },
                  { trigger: "Governance Capture Attempt", action: "Freeze board voting, activate neutrality review, engage independent observers" },
                ].map((e) => (
                  <div key={e.trigger} className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-sm">{e.trigger}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{e.action}</p>
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
