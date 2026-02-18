import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Landmark, Shield, BarChart3, Globe, TrendingUp, FileText, AlertTriangle, CheckCircle, Lock, Users, DollarSign, Building2 } from "lucide-react";

const PARTICIPATION_TYPES = [
  { value: "observer", label: "Observer", color: "bg-muted text-muted-foreground" },
  { value: "capital_contributor", label: "Capital Contributor", color: "bg-blue-500/10 text-blue-600" },
  { value: "policy_partner", label: "Policy Partner", color: "bg-purple-500/10 text-purple-600" },
  { value: "national_anchor", label: "National Anchor", color: "bg-amber-500/10 text-amber-700" },
  { value: "regulatory_alignment", label: "Regulatory Alignment", color: "bg-emerald-500/10 text-emerald-600" },
];

const SAMPLE_PARTNERS = [
  { name: "Ministry of IT & Telecom — Pakistan", type: "national_anchor", funding: 50000000, compliance: "compliant", certified: true },
  { name: "Higher Education Commission — Pakistan", type: "policy_partner", funding: 20000000, compliance: "compliant", certified: true },
  { name: "UAE Innovation Authority", type: "capital_contributor", funding: 35000000, compliance: "under_review", certified: false },
  { name: "Saudi MCIT", type: "observer", funding: 0, compliance: "pending", certified: false },
  { name: "UK Research & Innovation", type: "regulatory_alignment", funding: 15000000, compliance: "compliant", certified: true },
];

export default function GovernmentRolloutPage() {
  const [simSector, setSimSector] = useState("renewable");
  const [simIncrease, setSimIncrease] = useState(15);

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Government Rollout | Public Sector Integration</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Landmark className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Strategic Government Rollout</h1>
          </div>
          <p className="text-muted-foreground">Neutral, policy-aligned public sector integration — national adoption without governance capture.</p>
        </div>

        <Tabs defaultValue="partners" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="dashboard">National View</TabsTrigger>
            <TabsTrigger value="simulation">Policy Sim</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="safeguards">Safeguards</TabsTrigger>
            <TabsTrigger value="comparison">Global View</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-4">
            <div className="grid gap-4">
              {SAMPLE_PARTNERS.map((p, i) => {
                const typeInfo = PARTICIPATION_TYPES.find(t => t.value === p.type);
                return (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={typeInfo?.color}>{typeInfo?.label}</Badge>
                            {p.certified && <Badge variant="outline" className="text-emerald-600 border-emerald-300">SIP Certified</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{p.funding > 0 ? `$${(p.funding / 1e6).toFixed(0)}M` : "—"}</p>
                        <p className="text-xs text-muted-foreground">Funding commitment</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Capital Deployed", val: "$120M", icon: DollarSign },
                { label: "Employment Converted", val: "4,280", icon: Users },
                { label: "Startups Created", val: "87", icon: TrendingUp },
                { label: "Innovation Density", val: "72.4", icon: BarChart3 },
              ].map(m => (
                <Card key={m.label}>
                  <CardContent className="p-4 text-center">
                    <m.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{m.val}</div>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader><CardTitle>Sector Growth Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[{ s: "Technology", v: 82 }, { s: "Biotech", v: 64 }, { s: "Renewable Energy", v: 71 }, { s: "Agriculture", v: 45 }, { s: "Financial Services", v: 58 }].map(x => (
                  <div key={x.s}>
                    <div className="flex justify-between text-sm mb-1"><span>{x.s}</span><span className="font-semibold">{x.v}%</span></div>
                    <Progress value={x.v} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Policy Impact Simulation</CardTitle>
                <CardDescription>"What happens if public funding increases {simIncrease}% in {simSector}?"</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {[
                    { label: "Employment", delta: `+${Math.round(simIncrease * 28)}`, positive: true },
                    { label: "Startup Yield", delta: `+${Math.round(simIncrease * 0.8)}`, positive: true },
                    { label: "Capital Efficiency", delta: `+${(simIncrease * 0.4).toFixed(1)}%`, positive: true },
                    { label: "Risk Variance", delta: `+${(simIncrease * 0.2).toFixed(1)}%`, positive: false },
                    { label: "Dispute Rate", delta: `-${(simIncrease * 0.1).toFixed(1)}%`, positive: true },
                  ].map(r => (
                    <Card key={r.label} className={`p-3 text-center border-2 ${r.positive ? 'border-emerald-200' : 'border-amber-200'}`}>
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                      <p className={`text-lg font-bold ${r.positive ? 'text-emerald-600' : 'text-amber-600'}`}>{r.delta}</p>
                    </Card>
                  ))}
                </div>
                <Button className="mt-4">Run Full Simulation</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Public Fund Compliance Tracker</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Fund Allocation Compliance", val: 96 },
                  { label: "Disbursement Accuracy", val: 92 },
                  { label: "Escrow Adherence", val: 99 },
                  { label: "Policy Objective Alignment", val: 88 },
                ].map(c => (
                  <div key={c.label}>
                    <div className="flex justify-between text-sm mb-1"><span>{c.label}</span><span className="font-semibold">{c.val}%</span></div>
                    <Progress value={c.val} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safeguards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Anti-Political Capture Safeguards</CardTitle>
                <CardDescription>All protections codified — neutrality preserved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { rule: "No direct protocol modification rights", icon: Lock },
                    { rule: "No AI override rights", icon: Shield },
                    { rule: "No arbitration override rights", icon: AlertTriangle },
                    { rule: "No capital re-routing outside escrow", icon: DollarSign },
                    { rule: "No board majority via government participation", icon: Users },
                    { rule: "No individual-level data access", icon: Lock },
                  ].map(s => (
                    <div key={s.rule} className="flex items-center gap-3 p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/10">
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-sm">{s.rule}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Global Government Comparison</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { country: "Pakistan", innovation: 72, employment: 68, capital: 74, sector: 65 },
                    { country: "UAE", innovation: 81, employment: 76, capital: 85, sector: 78 },
                    { country: "UK", innovation: 88, employment: 82, capital: 79, sector: 84 },
                    { country: "Saudi Arabia", innovation: 69, employment: 61, capital: 82, sector: 59 },
                  ].map(c => (
                    <div key={c.country} className="grid grid-cols-5 gap-4 items-center p-3 rounded-lg border">
                      <span className="font-semibold">{c.country}</span>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Innovation</p><p className="font-bold">{c.innovation}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Employment</p><p className="font-bold">{c.employment}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Capital</p><p className="font-bold">{c.capital}</p></div>
                      <div className="text-center"><p className="text-xs text-muted-foreground">Sector</p><p className="font-bold">{c.sector}</p></div>
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
