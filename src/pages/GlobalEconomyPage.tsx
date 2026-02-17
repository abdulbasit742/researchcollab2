import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGlobalFlows, useMarketAdjustments } from "@/hooks/useLIMSE";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Globe, ArrowRight, Shield, History } from "lucide-react";
import { formatPKR } from "@/lib/currency";

export default function GlobalEconomyPage() {
  const { data: flows, isLoading: flowsLoading } = useGlobalFlows();
  const { data: adjustments } = useMarketAdjustments();
  const flowList = flows ?? [];
  const adjList = adjustments ?? [];

  const totalValue = flowList.reduce((s, f) => s + f.total_value, 0);
  const totalDeals = flowList.reduce((s, f) => s + f.deal_volume, 0);
  const uniqueRegions = new Set([...flowList.map(f => f.source_region), ...flowList.map(f => f.target_region)]);

  const topFlows = flowList.slice(0, 10);
  const chartData = topFlows.map(f => ({
    name: `${f.source_region?.slice(0, 3)}→${f.target_region?.slice(0, 3)}`,
    value: f.total_value,
    deals: f.deal_volume,
  }));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            Capital Flow Visualizer
          </h1>
          <p className="text-muted-foreground mt-1">
            Regional deal flow, cross-border value transfer, and currency concentration
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Flow Value</p>
            <p className="text-2xl font-bold">{formatPKR(totalValue)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Deals</p>
            <p className="text-2xl font-bold">{totalDeals}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Active Regions</p>
            <p className="text-2xl font-bold">{uniqueRegions.size}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Stabilization Actions</p>
            <p className="text-2xl font-bold">{adjList.length}</p>
          </CardContent></Card>
        </div>

        {/* Flow Chart */}
        <Card>
          <CardHeader><CardTitle>Top Capital Flows</CardTitle></CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No capital flow data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flow Table */}
        <Card>
          <CardHeader><CardTitle>Regional Deal Flows</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flowList.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{f.source_region}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{f.target_region}</Badge>
                    {f.skill_name && <span className="text-xs text-muted-foreground">({f.skill_name})</span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{f.deal_volume} deals</span>
                    <span className="font-medium">{formatPKR(f.total_value)}</span>
                    <Badge variant="secondary">{f.currency}</Badge>
                  </div>
                </div>
              ))}
              {flowList.length === 0 && !flowsLoading && (
                <div className="p-8 text-center text-muted-foreground">No flow data recorded yet</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Market Adjustments Log */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Market Stabilization Log</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adjList.map(a => (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{a.adjustment_type}</span>
                      {a.skill_name && <Badge variant="secondary" className="text-xs">{a.skill_name}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.trigger_condition}</p>
                    <p className="text-xs">{a.action_taken}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.ai_confidence && (
                      <span className="text-xs text-muted-foreground">{Math.round(a.ai_confidence)}% AI conf</span>
                    )}
                    {a.reversed_at ? (
                      <Badge variant="destructive">Reversed</Badge>
                    ) : a.is_reversible ? (
                      <Badge variant="secondary">Reversible</Badge>
                    ) : (
                      <Badge>Permanent</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {adjList.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No stabilization actions logged</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
