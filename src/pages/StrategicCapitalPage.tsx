import { MainLayout } from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, TrendingUp, Shield, Users, Scale, FileText, Eye, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StrategicCapitalPage() {
  const { data: investors } = useQuery({
    queryKey: ["strategic-investors"],
    queryFn: async () => {
      const { data } = await supabase.from("strategic_investors" as any).select("*").order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const { data: rounds } = useQuery({
    queryKey: ["capital-raise-rounds"],
    queryFn: async () => {
      const { data } = await supabase.from("capital_raise_rounds" as any).select("*").order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const { data: safeguards } = useQuery({
    queryKey: ["founder-safeguards"],
    queryFn: async () => {
      const { data } = await supabase.from("founder_equity_safeguards" as any).select("*").eq("is_active", true);
      return (data || []) as any[];
    },
  });

  const totalRaised = rounds?.reduce((s: number, r: any) => s + (r.raised_amount || 0), 0) || 0;
  const totalInvestors = investors?.filter((i: any) => i.screening_status === "approved").length || 0;

  return (
    <MainLayout>
      <div className="px-4 py-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Landmark className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Strategic Capital Architecture</h1>
            <p className="text-muted-foreground">Institutional funding layer with governance protection</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Raised", value: `PKR ${(totalRaised / 1e6).toFixed(1)}M`, icon: TrendingUp },
            { label: "Approved Investors", value: totalInvestors, icon: Users },
            { label: "Active Rounds", value: rounds?.filter((r: any) => r.status === "open").length || 0, icon: Landmark },
            { label: "Safeguards Active", value: safeguards?.length || 0, icon: Shield },
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

        <Tabs defaultValue="structure">
          <TabsList className="flex-wrap">
            <TabsTrigger value="structure"><Scale className="h-4 w-4 mr-1" />Structure</TabsTrigger>
            <TabsTrigger value="rounds"><TrendingUp className="h-4 w-4 mr-1" />Rounds</TabsTrigger>
            <TabsTrigger value="investors"><Users className="h-4 w-4 mr-1" />Investors</TabsTrigger>
            <TabsTrigger value="safeguards"><Shield className="h-4 w-4 mr-1" />Safeguards</TabsTrigger>
            <TabsTrigger value="transparency"><Eye className="h-4 w-4 mr-1" />Transparency</TabsTrigger>
            <TabsTrigger value="risk"><AlertTriangle className="h-4 w-4 mr-1" />Risk</TabsTrigger>
          </TabsList>

          <TabsContent value="structure">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Entity A — Commercial Platform</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Raises venture/growth capital. Owns revenue-generating operations.</p>
                  <ul className="space-y-1">
                    <li>• Revenue operations</li>
                    <li>• Intelligence products</li>
                    <li>• Enterprise services</li>
                    <li>• Capital intake</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Entity B — SIP Foundation</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Governs protocol. Owns neutrality charter. No profit distribution.</p>
                  <ul className="space-y-1">
                    <li>• Protocol governance</li>
                    <li>• Neutrality enforcement</li>
                    <li>• Standards oversight</li>
                    <li>• No operational control</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4">
              <CardHeader><CardTitle className="text-base">Share Class Architecture</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { cls: "Class A", desc: "Voting common. Founder + early governance stakeholders.", vote: "Full", econ: "Full" },
                    { cls: "Class B", desc: "Economic shares. Limited voting rights. Investor class.", vote: "Limited", econ: "Full" },
                    { cls: "Class C", desc: "Non-voting economic units. Passive investor class.", vote: "None", econ: "Full" },
                  ].map((c) => (
                    <div key={c.cls} className="p-3 rounded-lg border border-border space-y-1">
                      <p className="font-semibold text-sm">{c.cls}</p>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                      <div className="flex gap-3 text-xs">
                        <Badge variant="outline">Vote: {c.vote}</Badge>
                        <Badge variant="outline">Econ: {c.econ}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rounds">
            <Card>
              <CardHeader><CardTitle>Capital Raise Rounds</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(!rounds || rounds.length === 0) && <p className="text-muted-foreground text-sm">No capital raise rounds configured.</p>}
                {rounds?.map((r: any) => (
                  <div key={r.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{r.round_name}</span>
                      <Badge variant={r.status === "open" ? "default" : "secondary"}>{r.status}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>PKR {((r.raised_amount || 0) / 1e6).toFixed(1)}M / {((r.target_amount || 0) / 1e6).toFixed(1)}M</span>
                        <span>{r.target_amount > 0 ? Math.round(((r.raised_amount || 0) / r.target_amount) * 100) : 0}%</span>
                      </div>
                      <Progress value={r.target_amount > 0 ? ((r.raised_amount || 0) / r.target_amount) * 100 : 0} className="h-2" />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Type: {r.round_type}</span>
                      <span>Share Class: {r.share_class_issued}</span>
                      <span>Max Single: {r.max_single_investor_pct}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investors">
            <Card>
              <CardHeader><CardTitle>Strategic Investor Registry</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(!investors || investors.length === 0) && <p className="text-muted-foreground text-sm">No strategic investors registered.</p>}
                {investors?.map((inv: any) => (
                  <div key={inv.id} className="p-4 rounded-lg border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{inv.investor_name}</span>
                      <Badge variant={inv.screening_status === "approved" ? "default" : inv.screening_status === "rejected" ? "destructive" : "secondary"}>
                        {inv.screening_status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Type: {inv.investor_type}</span>
                      <span>Class: {inv.share_class}</span>
                      <span>Equity: {inv.equity_percentage}%</span>
                      <span>Voting: {inv.voting_rights_percentage}%</span>
                      <span>Horizon: {inv.horizon_years}yr</span>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-lg bg-muted/50 mt-4">
                  <h4 className="font-medium text-sm mb-2">Investor Screening Criteria</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    {["Long-term horizon", "No geopolitical pressure", "No data extraction", "No capital control", "Compliance aligned"].map((c) => (
                      <div key={c} className="p-2 rounded bg-background border text-center">{c}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safeguards">
            <Card>
              <CardHeader><CardTitle>Founder Equity & Governance Safeguards</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(!safeguards || safeguards.length === 0) && (
                  <div className="space-y-3">
                    {[
                      { type: "Dilution Floor", desc: "Founder equity cannot drop below 20% without board supermajority", threshold: 20 },
                      { type: "Board Seat Protection", desc: "Founder retains permanent board seat regardless of equity position", threshold: 100 },
                      { type: "Anti-Hostile Takeover", desc: "No single investor can acquire >30% equity without foundation approval", threshold: 30 },
                      { type: "Chair Continuity", desc: "Founder-Chair position protected by constitutional clause", threshold: 100 },
                    ].map((s) => (
                      <div key={s.type} className="p-4 rounded-lg border border-border space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{s.type}</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
                {safeguards?.map((s: any) => (
                  <div key={s.id} className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{s.safeguard_type.replace(/_/g, " ")}</span>
                      <Badge variant={s.is_breached ? "destructive" : "default"}>{s.is_breached ? "Breached" : "Active"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transparency">
            <Card>
              <CardHeader><CardTitle>Ecosystem Transparency</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Dual-Entity Structure", detail: "Commercial operations (Entity A) are legally separated from protocol governance (Entity B / SIP Foundation)." },
                  { title: "Share Class Explanation", detail: "Class A: Voting governance shares. Class B: Economic investor shares with limited voting. Class C: Non-voting economic units." },
                  { title: "Governance Protection", detail: "No single investor >15% per round. No board majority without foundation approval. Protocol modification requires multi-layer consensus." },
                  { title: "Neutrality Safeguards", detail: "AI governance cannot be overridden by capital. Arbitration neutrality is constitutionally protected. Foundation charter is immutable." },
                  { title: "Capital Use Framework", detail: "All capital allocated to: Infrastructure, Compliance, Node Rollout, AI Refinement, Enterprise Integration, Talent." },
                ].map((t) => (
                  <div key={t.title} className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{t.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <Card>
              <CardHeader><CardTitle>Capital Risk Monitoring</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { risk: "Investor Concentration", desc: "Monitor if any single investor exceeds ownership thresholds", status: "Monitoring" },
                  { risk: "Voting Imbalance", desc: "Detect disproportionate voting power relative to economic stake", status: "Monitoring" },
                  { risk: "Board Power Clustering", desc: "Identify aligned board members forming unofficial voting blocs", status: "Monitoring" },
                  { risk: "Strategic Pressure", desc: "Detect investor attempts to influence protocol or neutrality decisions", status: "Monitoring" },
                  { risk: "Rapid Exit Risk", desc: "Monitor for speculative short-term investment patterns", status: "Monitoring" },
                ].map((r) => (
                  <div key={r.risk} className="p-4 rounded-lg border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-sm">{r.risk}</span>
                      </div>
                      <Badge variant="secondary">{r.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
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
