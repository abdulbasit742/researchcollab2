import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Globe, Users, TrendingUp, Shield, Zap, BarChart3, AlertTriangle, Briefcase, Target } from "lucide-react";

const ALLIANCES = [
  { name: "TechCorp Global", tier: "strategic_anchor", hq: "United States", nodes: 8, rnd: 12500000, sector: "AI/ML", compliance: "verified" },
  { name: "InnoHealth Int'l", tier: "innovation_partner", hq: "Germany", nodes: 5, rnd: 8200000, sector: "HealthTech", compliance: "verified" },
  { name: "EduBridge Corp", tier: "sector_specialist", hq: "United Kingdom", nodes: 3, rnd: 4100000, sector: "EdTech", compliance: "verified" },
  { name: "GreenVenture Ltd", tier: "emerging_corporate", hq: "UAE", nodes: 2, rnd: 1800000, sector: "CleanTech", compliance: "pending" },
  { name: "FinScale Partners", tier: "innovation_partner", hq: "Singapore", nodes: 4, rnd: 6700000, sector: "FinTech", compliance: "verified" },
];

const tierLabel = (t: string) => t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const tierVariant = (t: string): "default" | "secondary" | "outline" | "destructive" =>
  t === "strategic_anchor" ? "default" : t === "innovation_partner" ? "secondary" : "outline";

const formatCurrency = (n: number) => `$${(n / 1000000).toFixed(1)}M`;

export default function CorporateAlliancePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Global Corporate Alliance Network</h1>
          </div>
          <p className="text-muted-foreground">Enterprise integration & strategic anchor layer for multinational participation</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mb-6">
            <TabsTrigger value="overview">Alliances</TabsTrigger>
            <TabsTrigger value="rnd">R&D Allocation</TabsTrigger>
            <TabsTrigger value="talent">Talent Pipeline</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="risk">Risk & Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card><CardContent className="pt-6"><div className="text-3xl font-bold">{ALLIANCES.length}</div><p className="text-sm text-muted-foreground">Active Alliances</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-3xl font-bold">{formatCurrency(ALLIANCES.reduce((s, a) => s + a.rnd, 0))}</div><p className="text-sm text-muted-foreground">Total R&D Commitment</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-3xl font-bold">{ALLIANCES.reduce((s, a) => s + a.nodes, 0)}</div><p className="text-sm text-muted-foreground">Node Participations</p></CardContent></Card>
              <Card><CardContent className="pt-6"><div className="text-3xl font-bold">{ALLIANCES.filter(a => a.tier === "strategic_anchor").length}</div><p className="text-sm text-muted-foreground">Strategic Anchors</p></CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Alliance Registry</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {ALLIANCES.map((a) => (
                  <div key={a.name} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{a.name}</span>
                        <Badge variant={tierVariant(a.tier)}>{tierLabel(a.tier)}</Badge>
                        <Badge variant={a.compliance === "verified" ? "default" : "outline"}>{a.compliance}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.hq} · {a.sector} · {a.nodes} nodes</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(a.rnd)}</div>
                      <p className="text-xs text-muted-foreground">Annual R&D</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Alliance Tier Structure</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3">
                  {[
                    { tier: "Strategic Anchor", desc: "Full ecosystem access, advisory council seat, cross-node intelligence", min: "$10M+" },
                    { tier: "Innovation Partner", desc: "Multi-node R&D, talent pipeline, sector intelligence", min: "$5M+" },
                    { tier: "Sector Specialist", desc: "Single-sector focus, capital pools, innovation challenges", min: "$2M+" },
                    { tier: "Emerging Corporate", desc: "Entry-level participation, basic intelligence, talent scouting", min: "$500K+" },
                  ].map((t) => (
                    <div key={t.tier} className="p-4 border rounded-lg">
                      <div className="font-semibold">{t.tier}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                      <div className="text-sm font-medium mt-2 text-primary">{t.min}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rnd" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Cross-Node R&D Allocation Engine</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { corp: "TechCorp Global", allocations: [{ node: "Pakistan", amount: 3200000, sector: "AI/ML" }, { node: "UAE", amount: 2800000, sector: "AI/ML" }, { node: "UK", amount: 2100000, sector: "FinTech" }] },
                  { corp: "InnoHealth Int'l", allocations: [{ node: "Germany", amount: 3500000, sector: "HealthTech" }, { node: "Singapore", amount: 2200000, sector: "BioTech" }] },
                ].map((c) => (
                  <div key={c.corp} className="border rounded-lg p-4">
                    <div className="font-semibold mb-3">{c.corp}</div>
                    <div className="space-y-2">
                      {c.allocations.map((al, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-sm w-28">{al.node}</span>
                          <Progress value={(al.amount / 5000000) * 100} className="flex-1 h-3" />
                          <span className="text-sm w-20 text-right">{formatCurrency(al.amount)}</span>
                          <Badge variant="outline" className="text-xs">{al.sector}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">All allocations comply with node-level data sovereignty and capital isolation rules.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Sector Innovation Tracks</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { title: "AI Healthcare Challenge 2026", type: "innovation_challenge", budget: 2000000, corp: "InnoHealth Int'l" },
                    { title: "FinTech Capital Pool", type: "capital_pool", budget: 5000000, corp: "FinScale Partners" },
                    { title: "CleanTech Incubation Track", type: "incubation", budget: 1500000, corp: "GreenVenture Ltd" },
                    { title: "EdTech Employment Guarantee", type: "employment_guarantee", budget: 800000, corp: "EduBridge Corp" },
                  ].map((t) => (
                    <div key={t.title} className="p-4 border rounded-lg">
                      <div className="font-medium">{t.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{t.type.replace(/_/g, " ")}</Badge>
                        <span className="text-xs text-muted-foreground">{t.corp}</span>
                      </div>
                      <div className="font-bold mt-2">{formatCurrency(t.budget)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="talent" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Corporate Talent Pipeline</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { corp: "TechCorp Global", type: "hiring", positions: 120, filled: 87, sector: "AI/ML" },
                    { corp: "InnoHealth Int'l", type: "internship", positions: 50, filled: 34, sector: "HealthTech" },
                    { corp: "FinScale Partners", type: "scouting", positions: 30, filled: 12, sector: "FinTech" },
                    { corp: "EduBridge Corp", type: "alumni_tracking", positions: 200, filled: 156, sector: "EdTech" },
                    { corp: "GreenVenture Ltd", type: "hiring", positions: 25, filled: 8, sector: "CleanTech" },
                  ].map((p) => (
                    <div key={`${p.corp}-${p.type}`} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{p.corp}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{p.type.replace(/_/g, " ")}</Badge>
                          <span className="text-xs text-muted-foreground">{p.sector}</span>
                        </div>
                      </div>
                      <div className="w-40">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{p.filled} filled</span>
                          <span>{p.positions} total</span>
                        </div>
                        <Progress value={(p.filled / p.positions) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Pipeline Integration Features</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { feature: "Trust-Based Talent Ranking", desc: "Candidates ranked by contribution trust scores and verified credentials" },
                    { feature: "Cross-Border Internships", desc: "Multi-node internship programs with sovereign compliance" },
                    { feature: "Startup Talent Scouting", desc: "Identify high-potential founders from FYP ecosystem" },
                    { feature: "Alumni Tracking Network", desc: "Long-term career trajectory monitoring for institutional ROI" },
                  ].map((f) => (
                    <div key={f.feature} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">{f.feature}</div>
                      <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Alliance Performance Dashboard</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ALLIANCES.filter(a => a.compliance === "verified").map((a) => (
                    <div key={a.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">{a.name}</div>
                        <Badge variant={tierVariant(a.tier)}>{tierLabel(a.tier)}</Badge>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {[
                          { label: "Capital Deployed", value: formatCurrency(a.rnd * 0.65) },
                          { label: "Projects Funded", value: String(Math.floor(a.rnd / 200000)) },
                          { label: "Hires Made", value: String(Math.floor(a.rnd / 100000)) },
                          { label: "Startup Investments", value: String(Math.floor(a.rnd / 500000)) },
                          { label: "Success Rate", value: `${70 + Math.floor(Math.random() * 20)}%` },
                          { label: "ROI Proxy", value: `${(1.2 + Math.random() * 0.8).toFixed(1)}x` },
                        ].map((m) => (
                          <div key={m.label} className="text-center">
                            <div className="text-xs text-muted-foreground">{m.label}</div>
                            <div className="font-bold mt-1">{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Co-Investment Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { deal: "AI Diagnostics Spin-off", corps: ["TechCorp Global", "InnoHealth Int'l"], amount: 2500000 },
                    { deal: "FinTech Platform Co-Fund", corps: ["FinScale Partners"], amount: 1800000 },
                    { deal: "EdTech SaaS Joint Pool", corps: ["EduBridge Corp", "TechCorp Global"], amount: 900000 },
                  ].map((d) => (
                    <div key={d.deal} className="p-4 border rounded-lg">
                      <div className="font-medium">{d.deal}</div>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {d.corps.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                      </div>
                      <div className="font-bold mt-2">{formatCurrency(d.amount)}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">All co-investments tracked via cap table infrastructure with full equity audit trails.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Alliance Risk Monitoring</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { type: "capital_concentration", severity: "medium", desc: "TechCorp Global holds 37% of total R&D allocation", corp: "TechCorp Global" },
                  { type: "node_dependency", severity: "low", desc: "Pakistan node receives 28% of all corporate capital", corp: "Multiple" },
                  { type: "sector_distortion", severity: "low", desc: "AI/ML sector receives disproportionate funding vs. others", corp: "System" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 ${r.severity === "high" ? "text-destructive" : r.severity === "medium" ? "text-yellow-500" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <div className="font-medium">{r.desc}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={r.severity === "high" ? "destructive" : "outline"}>{r.severity}</Badge>
                        <span className="text-xs text-muted-foreground">{r.type.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Governance Participation Rules</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { rule: "Advisory Only", desc: "Strategic anchors participate in advisory council — no override authority on protocol decisions" },
                    { rule: "Neutrality Preserved", desc: "No corporate alliance can influence trust scoring, arbitration outcomes, or escrow rules" },
                    { rule: "Amendment Input", desc: "Alliances may suggest protocol amendments but cannot directly propose or vote" },
                    { rule: "Capital Isolation", desc: "Corporate capital pools remain node-compliant with sovereign data isolation" },
                    { rule: "Transparency Required", desc: "All alliance participation, capital flows, and governance input publicly disclosed" },
                  ].map((r) => (
                    <div key={r.rule} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">{r.rule}</div>
                        <p className="text-sm text-muted-foreground">{r.desc}</p>
                      </div>
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
