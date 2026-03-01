import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSovereignNodes, useSovereignMetrics } from "@/hooks/useSovereignFederation";
import { Globe, Activity, TrendingUp, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SovereignNodeDashboardPage() {
  const { data: nodes, isLoading: loadingNodes } = useSovereignNodes();
  const { data: metrics } = useSovereignMetrics();

  const nodeList = nodes ?? [];
  const metricsList = metrics ?? [];

  const activeNodes = nodeList.filter((n: any) => n.status === "active").length;
  const avgTrust = metricsList.length
    ? Math.round(metricsList.reduce((s: number, m: any) => s + (m.national_trust_score || 0), 0) / metricsList.length)
    : 0;

  const chartData = metricsList.slice(0, 12).map((m: any) => ({
    name: m.node_id?.slice(0, 6) ?? "—",
    research: m.research_output_index || 0,
    execution: m.execution_efficiency_index || 0,
    trust: m.national_trust_score || 0,
  }));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            Sovereign Node Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">National execution infrastructure monitoring and sovereign metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <Globe className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{nodeList.length}</p>
            <p className="text-xs text-muted-foreground">Total Nodes</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{activeNodes}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{avgTrust}</p>
            <p className="text-xs text-muted-foreground">Avg National Trust</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{metricsList.length}</p>
            <p className="text-xs text-muted-foreground">Metrics Computed</p>
          </CardContent></Card>
        </div>

        {chartData.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Node Performance Overview</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="research" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="execution" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="trust" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {nodeList.map((node: any) => (
            <Card key={node.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{node.node_name || `Node ${node.id.slice(0, 8)}`}</p>
                      <p className="text-xs text-muted-foreground">{node.country_code || "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={node.status === "active" ? "default" : "secondary"}>{node.status}</Badge>
                    {node.governance_mode && <Badge variant="outline">{node.governance_mode}</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {nodeList.length === 0 && !loadingNodes && (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              No sovereign nodes deployed yet
            </CardContent></Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
