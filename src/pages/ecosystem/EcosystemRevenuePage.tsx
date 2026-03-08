import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, BarChart3, PieChart as PieIcon } from "lucide-react";
import { toast } from "sonner";
import { getRevenueAnalytics, invokeOrchestrator } from "@/lib/ecosystem/ecosystemOrchestrator";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function EcosystemRevenuePage() {
  const qc = useQueryClient();

  const { data: revenue } = useQuery({
    queryKey: ["eco-revenue"],
    queryFn: () => getRevenueAnalytics(),
    staleTime: 60_000,
  });

  const totalRevenue = (revenue ?? []).reduce((s: number, r: any) => s + (r.amount ?? 0), 0);
  const totalTx = (revenue ?? []).reduce((s: number, r: any) => s + (r.transaction_count ?? 0), 0);

  const bySource: Record<string, number> = {};
  (revenue ?? []).forEach((r: any) => { bySource[r.revenue_source] = (bySource[r.revenue_source] ?? 0) + r.amount; });
  const sourceData = Object.entries(bySource).map(([name, value]) => ({ name, value }));

  return (
    <>
      <Helmet><title>Ecosystem Revenue | RCollab</title></Helmet>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ecosystem Revenue Analytics</h1>
          <p className="text-muted-foreground">Track revenue across all ecosystem layers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalTx}</p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{sourceData.length}</p>
              <p className="text-sm text-muted-foreground">Revenue Sources</p>
            </div>
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardHeader><CardTitle>Revenue by Source</CardTitle></CardHeader>
            <CardContent>
              {sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceData}><XAxis dataKey="name" fontSize={11} /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-12">No revenue data yet</p>}
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>Source Distribution</CardTitle></CardHeader>
            <CardContent>
              {sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart><Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-12">No data to display</p>}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Detail Table */}
        <Card><CardHeader><CardTitle>Revenue Records</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(revenue ?? []).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded border border-border">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{r.revenue_source}</Badge>
                    <span className="text-sm text-muted-foreground">{r.period}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">${(r.amount ?? 0).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground ml-2">({r.transaction_count} tx)</span>
                  </div>
                </div>
              ))}
              {(revenue ?? []).length === 0 && <p className="text-center text-muted-foreground py-8">No revenue records yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
