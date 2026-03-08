import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, FlaskConical, BarChart3, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { getForecasts, getPricingExperiments, createPricingExperiment, updateExperimentStatus, invokeRevOptimizer } from "@/lib/revenue/revenueOptimizer";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PricingLabPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("forecasts");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ experiment_name: "", target_segment: "", hypothesis: "", base_price: "", test_price: "" });

  const { data: forecasts } = useQuery({ queryKey: ["rev-forecasts"], queryFn: () => getForecasts(), staleTime: 60_000 });
  const { data: experiments } = useQuery({ queryKey: ["rev-experiments"], queryFn: () => getPricingExperiments(), staleTime: 60_000 });

  const generateForecast = useMutation({
    mutationFn: () => invokeRevOptimizer("forecast", { timestamp: new Date().toISOString() }),
    onSuccess: () => { toast.success("Forecast generated"); qc.invalidateQueries({ queryKey: ["rev-forecasts"] }); },
    onError: () => toast.error("Forecast failed"),
  });

  const createExp = useMutation({
    mutationFn: () => createPricingExperiment({
      experiment_name: form.experiment_name,
      target_segment: form.target_segment,
      pricing_model: { price: parseFloat(form.test_price) || 0 },
      control_model: { price: parseFloat(form.base_price) || 0 },
      hypothesis: form.hypothesis,
    }),
    onSuccess: () => { toast.success("Experiment created"); setShowCreate(false); setForm({ experiment_name: "", target_segment: "", hypothesis: "", base_price: "", test_price: "" }); qc.invalidateQueries({ queryKey: ["rev-experiments"] }); },
  });

  const updateExp = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateExperimentStatus(id, status),
    onSuccess: () => { toast.success("Experiment updated"); qc.invalidateQueries({ queryKey: ["rev-experiments"] }); },
  });

  const forecastChart = (forecasts ?? []).map((f: any) => ({ name: f.forecast_period, revenue: f.projected_revenue, growth: f.projected_growth_rate }));

  return (
    <>
      <Helmet><title>Pricing Lab | RCollab</title></Helmet>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pricing & Forecasting Lab</h1>
            <p className="text-muted-foreground">Revenue forecasting and pricing experimentation</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => generateForecast.mutate()} disabled={generateForecast.isPending}>
              <TrendingUp className="h-4 w-4 mr-2" /> Generate Forecast
            </Button>
            <Button onClick={() => setShowCreate(true)}><FlaskConical className="h-4 w-4 mr-2" /> New Experiment</Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
          </TabsList>

          <TabsContent value="forecasts" className="space-y-4">
            {forecastChart.length > 0 && (
              <Card><CardHeader><CardTitle>Revenue Projections</CardTitle></CardHeader>
                <CardContent><ResponsiveContainer width="100%" height={300}>
                  <BarChart data={forecastChart}><XAxis dataKey="name" fontSize={12} /><YAxis /><Tooltip /><Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer></CardContent>
              </Card>
            )}
            <div className="space-y-3">
              {(forecasts ?? []).map((f: any) => (
                <Card key={f.id}><CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-foreground">{f.forecast_type}</span>
                    <span className="text-sm text-muted-foreground ml-2">{f.forecast_period}</span>
                    <Badge variant="outline" className="ml-2">{f.model_version}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">${(f.projected_revenue ?? 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{f.projected_growth_rate}% growth</p>
                  </div>
                </CardContent></Card>
              ))}
              {(forecasts ?? []).length === 0 && <Card><CardContent className="pt-6 text-center text-muted-foreground py-12">No forecasts yet — generate one</CardContent></Card>}
            </div>
          </TabsContent>

          <TabsContent value="experiments" className="space-y-4">
            {(experiments ?? []).map((exp: any) => (
              <Card key={exp.id}><CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{exp.experiment_name}</h3>
                    <p className="text-sm text-muted-foreground">Segment: {exp.target_segment}</p>
                    {exp.hypothesis && <p className="text-sm text-muted-foreground mt-1">{exp.hypothesis}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={exp.status === "running" ? "default" : "outline"}>{exp.status}</Badge>
                    {exp.status === "draft" && <Button size="sm" onClick={() => updateExp.mutate({ id: exp.id, status: "running" })}>Start</Button>}
                    {exp.status === "running" && <Button size="sm" variant="outline" onClick={() => updateExp.mutate({ id: exp.id, status: "completed" })}>Complete</Button>}
                  </div>
                </div>
              </CardContent></Card>
            ))}
            {(experiments ?? []).length === 0 && <Card><CardContent className="pt-6 text-center text-muted-foreground py-12">No experiments — create one to test pricing</CardContent></Card>}
          </TabsContent>
        </Tabs>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader><DialogTitle>New Pricing Experiment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Experiment Name</Label><Input value={form.experiment_name} onChange={e => setForm(f => ({ ...f, experiment_name: e.target.value }))} placeholder="Q2 Subscription Test" /></div>
              <div><Label>Target Segment</Label><Input value={form.target_segment} onChange={e => setForm(f => ({ ...f, target_segment: e.target.value }))} placeholder="mid-tier institutions" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Control Price ($)</Label><Input type="number" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} /></div>
                <div><Label>Test Price ($)</Label><Input type="number" value={form.test_price} onChange={e => setForm(f => ({ ...f, test_price: e.target.value }))} /></div>
              </div>
              <div><Label>Hypothesis</Label><Textarea value={form.hypothesis} onChange={e => setForm(f => ({ ...f, hypothesis: e.target.value }))} placeholder="Increasing price by 20% won't reduce conversion..." /></div>
              <Button className="w-full" onClick={() => createExp.mutate()} disabled={!form.experiment_name || !form.target_segment}>Create Experiment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
