import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Rocket, TrendingUp, Brain, Star, DollarSign, Layers } from "lucide-react";
import { toast } from "sonner";
import { getInnovationDashboard, invokeInnovationGenerator, updateProposalStatus } from "@/lib/innovation/innovationGenerator";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function InnovationLabPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [tab, setTab] = useState("proposals");

  const { data: dashboard } = useQuery({ queryKey: ["inn-dashboard"], queryFn: getInnovationDashboard, staleTime: 60_000 });

  const generate = useMutation({
    mutationFn: (category: string) => invokeInnovationGenerator("generate_innovation", { category, platform_context: "Global Execution Economy with escrow-backed milestones, trust engine, institutional coordination, talent exchange, research capital market" }),
    onSuccess: () => { toast.success("Innovation proposal generated"); qc.invalidateQueries({ queryKey: ["inn-dashboard"] }); },
    onError: () => toast.error("Generation failed"),
  });

  const evaluate = useMutation({
    mutationFn: (proposal: any) => invokeInnovationGenerator("evaluate_proposal", { proposal }),
    onSuccess: (data) => { toast.success("Evaluation complete"); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateProposalStatus(id, status, undefined, user?.id),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["inn-dashboard"] }); },
  });

  const s = dashboard?.summary;
  const statusChart = s ? Object.entries(s.byStatus).map(([name, value]) => ({ name, value })) : [];
  const categoryChart = s ? Object.entries(s.byCategory).map(([name, value]) => ({ name, value })) : [];

  const categories = ["research_marketplace", "talent_exchange", "startup_incubation", "dataset_marketplace", "ai_collaboration", "knowledge_monetization", "industry_challenges", "institution_intelligence"];

  return (
    <>
      <Helmet><title>Innovation Lab | RCollab</title></Helmet>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Continuous Innovation Lab</h1>
            <p className="text-muted-foreground">AI-powered platform expansion and capability design</p>
          </div>
          <Button onClick={() => generate.mutate("general")} disabled={generate.isPending}>
            <Brain className="h-4 w-4 mr-2" /> Generate Innovation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Lightbulb, label: "Total Proposals", value: s?.totalProposals ?? 0 },
            { icon: Star, label: "Avg Innovation Score", value: s?.avgScore ?? 0 },
            { icon: DollarSign, label: "Revenue Potential", value: `$${((s?.totalPotential ?? 0) / 1000).toFixed(0)}k` },
            { icon: Layers, label: "Roadmap Items", value: s?.roadmapItems ?? 0 },
          ].map(({ icon: Icon, label, value }) => (
            <Card key={label}><CardContent className="pt-6 flex items-center gap-3">
              <Icon className="h-8 w-8 text-primary" />
              <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
            </CardContent></Card>
          ))}
        </div>

        {/* Quick Generate by Category */}
        <Card><CardHeader><CardTitle className="text-lg">Generate by Category</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button key={cat} variant="outline" size="sm" onClick={() => generate.mutate(cat)} disabled={generate.isPending}>
                {cat.replace(/_/g, " ")}
              </Button>
            ))}
          </div></CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals" className="space-y-4">
            {(dashboard?.proposals ?? []).map((p: any) => (
              <Card key={p.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-foreground">{p.title}</h3>
                        <Badge variant="outline">{p.category}</Badge>
                        <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>{p.status}</Badge>
                        <Badge>{p.complexity}</Badge>
                      </div>
                      {p.overview && <p className="text-sm text-muted-foreground">{p.overview}</p>}
                      {Array.isArray(p.core_components) && p.core_components.length > 0 && (
                        <div className="flex flex-wrap gap-1">{p.core_components.slice(0, 5).map((c: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{c.name || c}</Badge>
                        ))}</div>
                      )}
                      {p.revenue_model?.streams && (
                        <div className="text-xs text-muted-foreground">Revenue: {p.revenue_model.streams.map((s: any) => s.source).join(", ")}</div>
                      )}
                    </div>
                    <div className="text-right ml-4 space-y-2 shrink-0">
                      <div className="text-2xl font-bold text-primary">{p.innovation_score ?? 0}</div>
                      <p className="text-xs text-muted-foreground">Innovation Score</p>
                      <p className="font-medium">${(p.revenue_potential ?? 0).toLocaleString()}</p>
                      {p.status === "proposed" && (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => updateStatus.mutate({ id: p.id, status: "approved" })}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: p.id, status: "rejected" })}>Reject</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(dashboard?.proposals ?? []).length === 0 && (
              <Card><CardContent className="pt-6 text-center text-muted-foreground py-12">No proposals yet — generate your first innovation</CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card><CardHeader><CardTitle className="text-lg">By Status</CardTitle></CardHeader>
                <CardContent>{statusChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie><Tooltip /></PieChart></ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-8">No data</p>}</CardContent>
              </Card>
              <Card><CardHeader><CardTitle className="text-lg">By Category</CardTitle></CardHeader>
                <CardContent>{categoryChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}><BarChart data={categoryChart}><XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={80} /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-8">No data</p>}</CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-4">
            {(dashboard?.roadmap ?? []).length > 0 ? (
              Object.entries(
                (dashboard?.roadmap ?? []).reduce((acc: Record<string, any[]>, item: any) => {
                  (acc[item.phase] = acc[item.phase] ?? []).push(item);
                  return acc;
                }, {})
              ).map(([phase, items]) => (
                <Card key={phase}><CardHeader><CardTitle className="text-lg">Phase: {phase}</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {(items as any[]).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded border border-border">
                        <div>
                          <span className="font-medium text-foreground">{item.title}</span>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{item.priority}</Badge>
                            {item.target_quarter && <Badge variant="secondary">{item.target_quarter}</Badge>}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={item.status === "completed" ? "default" : "outline"}>{item.status}</Badge>
                          {item.estimated_effort && <p className="text-xs text-muted-foreground mt-1">{item.estimated_effort}</p>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            ) : <Card><CardContent className="pt-6 text-center text-muted-foreground py-12">No roadmap items yet</CardContent></Card>}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
