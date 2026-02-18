import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scissors, Target, BarChart3, Gauge } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const engineNames: Record<number, string> = {
  1: "Capital-Backed Execution",
  2: "Verified Professional Identity",
  3: "Research-to-Startup Pipeline",
};

const featureAudit = [
  { name: "Escrow System", engine: 1, revenue: "high", adoption: "high", complexity: "medium", decision: "keep" },
  { name: "Trust Scoring", engine: 2, revenue: "high", adoption: "high", complexity: "medium", decision: "keep" },
  { name: "FYP Dashboard", engine: 1, revenue: "high", adoption: "high", complexity: "low", decision: "keep" },
  { name: "Research Funding", engine: 3, revenue: "medium", adoption: "medium", complexity: "medium", decision: "keep" },
  { name: "Macro Simulation", engine: 1, revenue: "low", adoption: "low", complexity: "high", decision: "deprioritize" },
  { name: "Planetary Intelligence", engine: 0, revenue: "low", adoption: "low", complexity: "high", decision: "cut" },
  { name: "Federation Layer", engine: 0, revenue: "low", adoption: "low", complexity: "high", decision: "cut" },
  { name: "Civilization Treasury", engine: 0, revenue: "low", adoption: "low", complexity: "high", decision: "cut" },
  { name: "Developer Ecosystem", engine: 0, revenue: "low", adoption: "low", complexity: "medium", decision: "deprioritize" },
  { name: "Governance Proposals", engine: 0, revenue: "low", adoption: "low", complexity: "medium", decision: "merge" },
];

const decisionColors: Record<string, string> = {
  keep: "bg-chart-2/20 text-chart-2",
  cut: "bg-destructive/20 text-destructive",
  merge: "bg-chart-4/20 text-chart-4",
  deprioritize: "bg-muted text-muted-foreground",
};

const distributionData = [
  { name: "Keep", value: featureAudit.filter(f => f.decision === "keep").length, color: "hsl(var(--chart-2))" },
  { name: "Cut", value: featureAudit.filter(f => f.decision === "cut").length, color: "hsl(var(--destructive))" },
  { name: "Merge", value: featureAudit.filter(f => f.decision === "merge").length, color: "hsl(var(--chart-4))" },
  { name: "Deprioritize", value: featureAudit.filter(f => f.decision === "deprioritize").length, color: "hsl(var(--muted-foreground))" },
];

const kpis = [
  { name: "Funded FYPs", current: 42, target: 500 },
  { name: "Escrow Volume (M)", current: 8.2, target: 50 },
  { name: "Corp Sponsors", current: 12, target: 50 },
  { name: "Employment Conv %", current: 18, target: 40 },
  { name: "Startup Spin-offs", current: 3, target: 10 },
  { name: "Dispute Rate %", current: 4.2, target: 2 },
];

const SimplificationProtocolPage = () => (
  <>
    <Helmet><title>Simplification Protocol | RCollab</title></Helmet>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Scissors className="h-8 w-8 text-primary" />
            Ruthless Simplification Protocol
          </h1>
          <p className="text-muted-foreground mt-1">
            Cut 40% complexity — focus on 3 core engines — double real-world impact
          </p>
        </div>

        <Tabs defaultValue="audit" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-xl">
            <TabsTrigger value="audit">Feature Audit</TabsTrigger>
            <TabsTrigger value="engines">Core Engines</TabsTrigger>
            <TabsTrigger value="kpis">Success KPIs</TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2">
                <CardHeader><CardTitle>Feature Alignment Audit</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {featureAudit.map((f) => (
                      <div key={f.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">{f.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {f.engine ? `Engine ${f.engine}: ${engineNames[f.engine]}` : "No engine alignment"}
                            {" · "}Revenue: {f.revenue} · Complexity: {f.complexity}
                          </p>
                        </div>
                        <Badge className={decisionColors[f.decision]}>{f.decision.toUpperCase()}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Decision Distribution</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={distributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {distributionData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-destructive">40%</p>
                    <p className="text-sm text-muted-foreground">Complexity Reduction Target</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engines" className="space-y-6">
            {[
              { num: 1, name: "Capital-Backed Execution Engine", desc: "Escrow, milestones, deals, FYP funding, corporate deposits", icon: Target },
              { num: 2, name: "Verified Professional Identity Engine", desc: "Trust scores, verified skills, delivery consistency, opportunity routing", icon: Gauge },
              { num: 3, name: "Research-to-Startup Pipeline Engine", desc: "Research funding, execution tracking, spin-off lifecycle, impact measurement", icon: BarChart3 },
            ].map((eng) => (
              <Card key={eng.num}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">{eng.num}</span>
                    <eng.icon className="h-5 w-5 text-primary" />
                    {eng.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{eng.desc}</p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {featureAudit.filter(f => f.engine === eng.num && f.decision === "keep").map(f => (
                      <Badge key={f.name} variant="outline">{f.name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="kpis" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>6-Month Success Metrics</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={kpis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                    <Bar dataKey="current" name="Current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" name="Target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </>
);

export default SimplificationProtocolPage;
