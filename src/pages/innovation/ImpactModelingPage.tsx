import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Target, Brain } from "lucide-react";
import { toast } from "sonner";
import { getInnovationMetrics, invokeInnovationGenerator, getProposals } from "@/lib/innovation/innovationGenerator";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ImpactModelingPage() {
  const { data: metrics } = useQuery({ queryKey: ["inn-metrics"], queryFn: () => getInnovationMetrics(), staleTime: 60_000 });
  const { data: proposals } = useQuery({ queryKey: ["inn-proposals-approved"], queryFn: () => getProposals({ status: "approved" }), staleTime: 60_000 });

  const projectImpact = useMutation({
    mutationFn: (proposal: any) => invokeInnovationGenerator("project_impact", { proposal }),
    onSuccess: (data) => { toast.success("Impact projection complete"); },
    onError: () => toast.error("Projection failed"),
  });

  const metricChart = (metrics ?? []).slice(0, 20).map((m: any) => ({ name: m.metric_name, value: m.metric_value }));

  return (
    <>
      <Helmet><title>Impact Modeling | RCollab</title></Helmet>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Impact Modeling</h1>
          <p className="text-muted-foreground">Project financial and growth impact of innovations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{(proposals ?? []).length}</p><p className="text-sm text-muted-foreground">Approved Proposals</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">{(metrics ?? []).length}</p><p className="text-sm text-muted-foreground">Tracked Metrics</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div><p className="text-2xl font-bold">${((proposals ?? []).reduce((s: number, p: any) => s + (p.revenue_potential ?? 0), 0) / 1000).toFixed(0)}k</p><p className="text-sm text-muted-foreground">Total Pipeline Value</p></div>
          </CardContent></Card>
        </div>

        {metricChart.length > 0 && (
          <Card><CardHeader><CardTitle>Innovation Metrics</CardTitle></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricChart}><XAxis dataKey="name" fontSize={11} angle={-45} textAnchor="end" height={80} /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
            </ResponsiveContainer></CardContent>
          </Card>
        )}

        <Card><CardHeader><CardTitle>Approved Proposals — Project Impact</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(proposals ?? []).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <div className="flex gap-2 mt-1"><Badge variant="outline">{p.category}</Badge><Badge>{p.complexity}</Badge></div>
                  {p.overview && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.overview}</p>}
                </div>
                <div className="text-right ml-4 space-y-2 shrink-0">
                  <p className="font-bold text-primary">${(p.revenue_potential ?? 0).toLocaleString()}</p>
                  <Button size="sm" variant="outline" onClick={() => projectImpact.mutate(p)} disabled={projectImpact.isPending}>
                    <Brain className="h-3 w-3 mr-1" /> Project Impact
                  </Button>
                </div>
              </div>
            ))}
            {(proposals ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No approved proposals — approve proposals in the Innovation Lab</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
