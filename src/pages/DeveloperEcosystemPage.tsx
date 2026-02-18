import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Code2, Shield, Lock, BarChart3, Globe, Key, Package, AlertTriangle, CheckCircle, FileText, Layers, DollarSign, Terminal } from "lucide-react";

const API_TIERS = [
  { tier: 1, label: "Read-Only Aggregated", rate: "1,000/day", access: "Public metrics, innovation index" },
  { tier: 2, label: "Node-Level Intelligence", rate: "5,000/day", access: "Country-level analytics, sector data" },
  { tier: 3, label: "Capital Simulation", rate: "500/day", access: "Allocation simulations, forecasting" },
  { tier: 4, label: "Write-Level Integration", rate: "100/day", access: "Escrow hooks, trust queries (restricted)" },
];

const SAMPLE_APPS = [
  { name: "InnoVis Analytics", type: "Research Visualization", dev: "UniLab Corp", installs: 234, certified: true, status: "certified" },
  { name: "TalentScope", type: "Hiring Integration", dev: "HRTech Solutions", installs: 189, certified: true, status: "certified" },
  { name: "CapitalFlow Dashboard", type: "Capital Intelligence", dev: "FinEdge Labs", installs: 67, certified: true, status: "certified" },
  { name: "ResearchBridge", type: "University Module", dev: "AcadTech", installs: 312, certified: true, status: "certified" },
  { name: "StartupRadar", type: "Startup Accelerator", dev: "VentureLens", installs: 45, certified: false, status: "review" },
];

export default function DeveloperEcosystemPage() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Developer Ecosystem | Programmable Innovation Grid</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Code2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Developer Ecosystem</h1>
          </div>
          <p className="text-muted-foreground">Controlled extensibility on the Sovereign Innovation Protocol — build, certify, and monetize.</p>
        </div>

        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="marketplace">App Store</TabsTrigger>
            <TabsTrigger value="api">API Tiers</TabsTrigger>
            <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
            <TabsTrigger value="certification">Certification</TabsTrigger>
            <TabsTrigger value="extensions">Extensions</TabsTrigger>
            <TabsTrigger value="governance">Safeguards</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_APPS.map((app, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Package className="h-5 w-5 text-primary" />
                      <Badge variant={app.certified ? "default" : "outline"}>{app.status === "certified" ? "Certified" : "In Review"}</Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{app.name}</CardTitle>
                    <CardDescription>{app.type} · by {app.dev}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{app.installs} installs</span>
                      <Button size="sm" variant={app.certified ? "default" : "outline"} disabled={!app.certified}>
                        {app.certified ? "Install" : "Pending"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="grid gap-4">
              {API_TIERS.map(t => (
                <Card key={t.tier} className={t.tier === 4 ? "border-amber-300" : ""}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{t.tier}</div>
                      <div>
                        <p className="font-semibold">{t.label}</p>
                        <p className="text-sm text-muted-foreground">{t.access}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">{t.rate}</p>
                      <p className="text-xs text-muted-foreground">Rate limit</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sandbox" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" /> Sandbox Environment</CardTitle>
                <CardDescription>Test against simulated data — no access to live financial flows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-1">
                  <p className="text-muted-foreground"># Sandbox endpoints</p>
                  <p>GET /sandbox/v1/trust-schema</p>
                  <p>GET /sandbox/v1/capital-simulation</p>
                  <p>GET /sandbox/v1/sector-analytics</p>
                  <p>POST /sandbox/v1/allocation-test</p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {[{ l: "Test Projects", v: "500+" }, { l: "Mock Users", v: "10,000" }, { l: "Simulated Capital", v: "$50M" }].map(s => (
                    <Card key={s.l} className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">{s.l}</p>
                      <p className="font-semibold">{s.v}</p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certification" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>App Certification Requirements</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { check: "Security Audit Passed", icon: Shield },
                    { check: "Compliance Review Passed", icon: FileText },
                    { check: "AI Bias Compliance", icon: AlertTriangle },
                    { check: "Data Sovereignty Check", icon: Globe },
                  ].map(c => (
                    <div key={c.check} className="flex items-center gap-3 p-3 rounded-lg border">
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-sm font-medium">{c.check}</span>
                    </div>
                  ))}
                </div>
                <Button className="mt-4 w-full">Submit App for Certification</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extensions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" /> Protocol Extension Proposals (PEPs)</CardTitle>
                <CardDescription>Propose new event types, scoring metrics, or simulation parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { pep: "PEP-001: Cross-Node Reputation Portability Score", status: "Approved", version: "v2.3" },
                    { pep: "PEP-002: Sector Correlation Index Parameter", status: "Under Review", version: "—" },
                    { pep: "PEP-003: Real-Time Capital Velocity Event", status: "Proposed", version: "—" },
                  ].map(p => (
                    <div key={p.pep} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm">{p.pep}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{p.version}</Badge>
                        <Badge variant={p.status === "Approved" ? "default" : "secondary"}>{p.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full">Submit New PEP</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Developer Governance Safeguards</CardTitle>
                <CardDescription>Core systems remain protected — no developer can compromise protocol integrity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Cannot modify escrow logic",
                    "Cannot override arbitration",
                    "Cannot alter trust scoring core",
                    "Cannot access raw identity data",
                    "Cannot manipulate capital routing",
                    "All API calls fully audited",
                  ].map(r => (
                    <div key={r} className="flex items-center gap-3 p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-900/10">
                      <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-sm">{r}</span>
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
