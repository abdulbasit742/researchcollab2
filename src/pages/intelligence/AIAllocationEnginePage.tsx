import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Shield, Activity, BarChart3, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const bandColors: Record<string, string> = {
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const AIAllocationEnginePage = () => {
  const { data: recommendations } = useQuery({
    queryKey: ["ai-allocation-recs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_allocation_recommendations").select("*").order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: simulations } = useQuery({
    queryKey: ["allocation-sims"],
    queryFn: async () => {
      const { data, error } = await supabase.from("allocation_simulations").select("*").order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: aiPerf } = useQuery({
    queryKey: ["ai-perf-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_performance_metrics").select("*").order("measured_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: biasLogs } = useQuery({
    queryKey: ["ai-bias-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_bias_logs").select("*").order("detected_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  const pending = (recommendations || []).filter(r => r.status === "pending").length;
  const approved = (recommendations || []).filter(r => r.status === "approved").length;
  const rejected = (recommendations || []).filter(r => r.status === "rejected").length;

  return (
    <MainLayout>
      <Helmet><title>AI Allocation Engine | RCollab</title></Helmet>
      <div className="container max-w-7xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI-Driven Allocation Engine</h1>
            <p className="text-muted-foreground">Human-in-the-loop capital optimization with explainable AI.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pending", value: pending, icon: Activity, color: "text-yellow-500" },
            { label: "Approved", value: approved, icon: CheckCircle, color: "text-green-500" },
            { label: "Rejected", value: rejected, icon: XCircle, color: "text-red-500" },
            { label: "Bias Alerts", value: biasLogs?.length || 0, icon: AlertTriangle, color: "text-orange-500" },
          ].map(m => (
            <Card key={m.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <p className="text-2xl font-bold">{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="recommendations">
          <TabsList>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="simulations">Simulations</TabsTrigger>
            <TabsTrigger value="performance">AI Performance</TabsTrigger>
            <TabsTrigger value="bias">Bias Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <div className="space-y-3">
              {(recommendations || []).map(r => (
                <Card key={r.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{r.recommended_action}</p>
                          <Badge variant="outline">{r.entity_type}</Badge>
                          <span className={`px-2 py-0.5 rounded text-xs ${bandColors[r.confidence_band || "yellow"]}`}>
                            {r.confidence_band?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.rationale_summary}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>Confidence: {Number(r.confidence_score).toFixed(0)}%</span>
                          <span>Success: {Number(r.success_probability).toFixed(0)}%</span>
                          <span>Risk: {Number(r.risk_score).toFixed(0)}</span>
                        </div>
                      </div>
                      <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>
                        {r.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!recommendations?.length && <p className="text-muted-foreground text-center py-8">No recommendations yet.</p>}
            </div>
          </TabsContent>

          <TabsContent value="simulations">
            <div className="space-y-3">
              {(simulations || []).map(s => (
                <Card key={s.id}>
                  <CardContent className="pt-4">
                    <p className="font-medium">{s.simulation_name}</p>
                    <Badge variant="outline" className="mt-1">{s.scenario_type}</Badge>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
                      <div><span className="text-muted-foreground">Completion:</span> {Number(s.projected_completion_rate).toFixed(1)}%</div>
                      <div><span className="text-muted-foreground">Employment:</span> {Number(s.projected_employment).toFixed(0)}</div>
                      <div><span className="text-muted-foreground">Startups:</span> {Number(s.projected_startup_yield).toFixed(0)}</div>
                      <div><span className="text-muted-foreground">Efficiency:</span> {Number(s.projected_capital_efficiency).toFixed(1)}</div>
                      <div><span className="text-muted-foreground">Risk:</span> {Number(s.projected_risk_exposure).toFixed(1)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!simulations?.length && <p className="text-muted-foreground text-center py-8">No simulations yet.</p>}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader><CardTitle>AI Model Performance</CardTitle></CardHeader>
              <CardContent>
                {aiPerf?.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={aiPerf.map(p => ({
                      version: p.model_version,
                      accuracy: Number(p.prediction_accuracy_pct),
                      success: Number(p.allocation_success_rate),
                      efficiency: Number(p.capital_efficiency_gain_pct),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="version" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="hsl(var(--primary))" name="Accuracy %" />
                      <Bar dataKey="success" fill="hsl(var(--accent))" name="Success %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No performance data yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bias">
            <div className="space-y-3">
              {(biasLogs || []).map(b => (
                <Card key={b.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{b.bias_type}</p>
                        <p className="text-sm text-muted-foreground">{b.description}</p>
                      </div>
                      <Badge variant={b.severity === "high" ? "destructive" : "secondary"}>{b.severity}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!biasLogs?.length && <p className="text-muted-foreground text-center py-8">No bias alerts detected.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AIAllocationEnginePage;
