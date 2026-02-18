import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Globe, Target, Shield, TrendingUp, Building2, Brain, Landmark, Clock, AlertTriangle, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_PHASES = [
  { phase_number: 1, phase_name: "Foundation Consolidation", year_start: 0, year_end: 2, focus_statement: "Density, not breadth", capital_strategy: "Controlled capital. Efficiency focus.", organizational_model: "Founder-led execution", targets: ["10–20 universities onboarded", "100+ corporate-sponsored projects", "Measurable employment conversion", "Documented startup spin-offs", "Arbitration resolution time < threshold", "Trust scoring stability confirmed"], objectives: ["Dominant penetration in 1 primary country", "3–5 anchor corporate alliances", "1–2 strategic government integrations", "Stabilize arbitration + escrow", "Reach near-break-even"] },
  { phase_number: 2, phase_name: "Regional Density Domination", year_start: 2, year_end: 4, focus_statement: "Regional economic gravity", capital_strategy: "Growth capital for regional expansion.", organizational_model: "Professional CEO + domain directors", targets: ["5 country nodes live", "Cross-node corporate alliances", "Regional innovation index published", "AI survival model accuracy > threshold", "Corporate R&D cross-border allocation live"], objectives: ["Expand into 3–5 countries", "Deploy sovereign node model", "Certify nodes under SIP framework", "Increase capital pool density", "Expand intelligence subscription revenue"] },
  { phase_number: 3, phase_name: "Multi-Region Expansion", year_start: 4, year_end: 6, focus_statement: "Cross-continental legitimacy", capital_strategy: "Strategic international capital.", organizational_model: "Regional presidents", targets: ["10–15 country nodes", "25+ enterprise alliance contracts", "Multi-currency capital flow", "Cross-border startup co-investment", "Annual global innovation report"], objectives: ["Enter second global region", "Localize compliance & data residency", "Onboard multinational anchor corps", "Expand foundation governance", "Increase intelligence marketplace revenue"] },
  { phase_number: 4, phase_name: "Intelligence Authority", year_start: 6, year_end: 8, focus_statement: "Influence + authority", capital_strategy: "Institutional & sovereign capital.", organizational_model: "Global governance expansion", targets: ["25+ nodes", "Intelligence subscription ARR significant", "Recognized industry standard protocol", "Corporate ecosystem deeply embedded", "Government reporting institutionalized"], objectives: ["Global innovation intelligence authority", "Publish Global Innovation Signal Index", "Host international innovation summit", "Launch developer ecosystem publicly", "Secure sovereign wealth participation"] },
  { phase_number: 5, phase_name: "Global Infrastructure Entrenchment", year_start: 8, year_end: 10, focus_statement: "Entrenchment, not hype", capital_strategy: "Stability capital or IPO readiness.", organizational_model: "Institutionalized foundation oversight", targets: ["50+ nodes", "Multi-region economic dependency", "High switching cost ecosystem", "Arbitration precedent database unmatched", "Stable profitability"], objectives: ["Default infrastructure for innovation execution", "Deeply integrate into university funding", "Embedded in public innovation budgets", "Achieve defensible data moat scale", "Solidify long-term capital structure"] },
];

const MOAT_PILLARS = [
  { name: "Escrow Data Compounding", category: "Data", risk: "low", years: 5 },
  { name: "Arbitration Precedent Depth", category: "Legal", risk: "low", years: 7 },
  { name: "Cross-Node Capital Learning", category: "Intelligence", risk: "medium", years: 4 },
  { name: "Trust Evolution Database", category: "Data", risk: "low", years: 6 },
  { name: "Startup Lifecycle Tracking", category: "Data", risk: "medium", years: 4 },
  { name: "Employment Conversion Data", category: "Data", risk: "medium", years: 3 },
  { name: "Intelligence Forecasting", category: "Intelligence", risk: "medium", years: 5 },
  { name: "Corporate Alliance Density", category: "Network", risk: "high", years: 3 },
  { name: "Government Integration Stickiness", category: "Network", risk: "medium", years: 4 },
  { name: "Developer Ecosystem Layer", category: "Platform", risk: "high", years: 3 },
];

const RISKS = [
  { name: "Political Capture", severity: "high", category: "Governance" },
  { name: "Capital Concentration", severity: "high", category: "Economic" },
  { name: "AI Bias Drift", severity: "medium", category: "Technical" },
  { name: "Security Breaches", severity: "high", category: "Technical" },
  { name: "Regional Instability", severity: "medium", category: "Geopolitical" },
  { name: "Regulatory Fragmentation", severity: "medium", category: "Legal" },
  { name: "Founder Dependency", severity: "high", category: "Governance" },
  { name: "Governance Stagnation", severity: "medium", category: "Governance" },
];

const EXIT_PATHWAYS = [
  { name: "IPO", description: "Infrastructure SaaS + fintech + intelligence hybrid", alignment: "high" },
  { name: "Strategic Acquisition", description: "By infrastructure-grade entity", alignment: "medium" },
  { name: "Private + Sovereign Wealth", description: "Remain private with sovereign participation", alignment: "high" },
  { name: "Foundation Perpetual Model", description: "Foundation-dominant permanent infrastructure", alignment: "highest" },
];

const phaseColors: Record<number, string> = {
  1: "bg-blue-500",
  2: "bg-emerald-500",
  3: "bg-amber-500",
  4: "bg-purple-500",
  5: "bg-rose-500",
};

export default function GlobalDominationBlueprintPage() {
  const { data: dbPhases = [] } = useQuery({
    queryKey: ["strategic-phases"],
    queryFn: async () => {
      const { data } = await supabase.from("strategic_phases").select("*").order("phase_number");
      return data ?? [];
    },
  });

  const { data: dbMoat = [] } = useQuery({
    queryKey: ["strategic-moat"],
    queryFn: async () => {
      const { data } = await supabase.from("strategic_moat_tracking").select("*");
      return data ?? [];
    },
  });

  const { data: dbRisks = [] } = useQuery({
    queryKey: ["strategic-risks"],
    queryFn: async () => {
      const { data } = await supabase.from("strategic_risk_registry").select("*");
      return data ?? [];
    },
  });

  const phases = dbPhases.length > 0 ? dbPhases : DEFAULT_PHASES;
  const moatPillars = dbMoat.length > 0 ? dbMoat : MOAT_PILLARS;
  const risks = dbRisks.length > 0 ? dbRisks : RISKS;

  const severityColor = (s: string) => {
    if (s === "high" || s === "critical") return "destructive";
    if (s === "medium") return "secondary";
    return "outline";
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">10-Year Global Domination Blueprint</h1>
            <p className="text-sm text-muted-foreground">Sovereign Innovation Operating System — Strategic Expansion Master Plan</p>
          </div>
        </div>

        {/* Phase Timeline */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Phase Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="relative">
              <div className="flex gap-1 mb-4">
                {[0,1,2,3,4,5,6,7,8,9,10].map(y => (
                  <div key={y} className="flex-1 text-center text-xs text-muted-foreground font-medium">Y{y}</div>
                ))}
              </div>
              <div className="space-y-2">
                {DEFAULT_PHASES.map(p => (
                  <div key={p.phase_number} className="flex items-center gap-2">
                    <span className="text-xs w-8 text-right text-muted-foreground">P{p.phase_number}</span>
                    <div className="flex-1 relative h-7 bg-muted/30 rounded">
                      <div
                        className={`absolute h-full rounded ${phaseColors[p.phase_number]} opacity-80 flex items-center justify-center`}
                        style={{ left: `${p.year_start * 10}%`, width: `${(p.year_end - p.year_start) * 10}%` }}
                      >
                        <span className="text-[10px] text-white font-semibold truncate px-2">{p.phase_name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="phases">
          <div className="overflow-x-auto">
            <TabsList>
              <TabsTrigger value="phases">Phases</TabsTrigger>
              <TabsTrigger value="moat">Moat Expansion</TabsTrigger>
              <TabsTrigger value="capital">Capital Strategy</TabsTrigger>
              <TabsTrigger value="risks">Risk Management</TabsTrigger>
              <TabsTrigger value="org">Organizational</TabsTrigger>
              <TabsTrigger value="exit">Exit Pathways</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="phases" className="space-y-4">
            {DEFAULT_PHASES.map(phase => (
              <Card key={phase.phase_number}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${phaseColors[phase.phase_number]}`} />
                      Phase {phase.phase_number}: {phase.phase_name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">Year {phase.year_start}–{phase.year_end}</Badge>
                      <Badge variant="secondary">{phase.focus_statement}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">OBJECTIVES</p>
                      <ul className="space-y-1">
                        {(phase.objectives as string[]).map((o, i) => (
                          <li key={i} className="text-sm flex items-start gap-2"><Target className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />{o}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">TARGETS</p>
                      <ul className="space-y-1">
                        {(phase.targets as string[]).map((t, i) => (
                          <li key={i} className="text-sm flex items-start gap-2"><TrendingUp className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" />{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="moat" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOAT_PILLARS.map((m, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{m.name}</p>
                      <Badge variant={m.risk === "low" ? "default" : m.risk === "medium" ? "secondary" : "destructive"}>
                        {m.risk} replicability
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{m.category}</span>
                      <span>{m.years}+ years to replicate</span>
                    </div>
                    <Progress value={Math.min(100, m.years * 14)} className="mt-2 h-1.5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="capital" className="space-y-4">
            {DEFAULT_PHASES.map(p => (
              <div key={p.phase_number} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className={`w-2 h-12 rounded-full ${phaseColors[p.phase_number]}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">Year {p.year_start}–{p.year_end}: {p.phase_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.capital_strategy}</p>
                </div>
                <Badge variant="outline">{p.organizational_model}</Badge>
              </div>
            ))}
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Capital must never compromise protocol neutrality.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RISKS.map((r, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-4 w-4 ${r.severity === "high" ? "text-destructive" : "text-amber-500"}`} />
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.category}</p>
                      </div>
                    </div>
                    <Badge variant={severityColor(r.severity)}>{r.severity}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Quarterly risk audit required across all categories</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="org" className="space-y-3">
            {DEFAULT_PHASES.map(p => (
              <div key={p.phase_number} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className={`w-10 h-10 rounded-full ${phaseColors[p.phase_number]} flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{p.year_start}–{p.year_end}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{p.organizational_model}</p>
                  <p className="text-xs text-muted-foreground">{p.phase_name}</p>
                </div>
              </div>
            ))}
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                Succession planning mandatory at every phase transition.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exit" className="space-y-3">
            <p className="text-sm text-muted-foreground">Decision point at Year 8+. Must align with neutrality and long-term integrity.</p>
            {EXIT_PATHWAYS.map((e, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.description}</p>
                  </div>
                  <Badge variant={e.alignment === "highest" ? "default" : e.alignment === "high" ? "secondary" : "outline"}>
                    {e.alignment} alignment
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Final Positioning */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center space-y-3">
            <Globe className="h-10 w-10 mx-auto text-primary" />
            <h2 className="text-xl font-bold">By Year 10: Global Innovation Execution Infrastructure</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl mx-auto">
              {["Universities rely on it", "Corporations allocate through it", "Governments report via it", "Capital routes through it", "Startups originate inside it", "Intelligence references it"].map(s => (
                <Badge key={s} variant="outline" className="justify-center py-1.5">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
