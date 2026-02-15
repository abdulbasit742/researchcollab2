import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiquidityIndex } from "@/hooks/useLiquidityIndex";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Droplets, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminGlobalLiquidityPage() {
  const { metrics, avgLiquidity, topSkill } = useLiquidityIndex();

  const highLiquidity = metrics.filter(m => m.liquidity_score > 60);
  const lowLiquidity = metrics.filter(m => m.liquidity_score < 20);
  const oversupplied = metrics.filter(m => m.total_active_bids > m.total_active_projects * 3);

  const chartData = metrics.slice(0, 15).map(m => ({
    name: m.skill_name?.length > 8 ? m.skill_name.slice(0, 8) + "…" : m.skill_name,
    liquidity: m.liquidity_score,
    conversion: m.deal_conversion_rate,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <Droplets className="h-8 w-8 text-primary" /> Global Liquidity Analytics
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Liquidity</p>
            <p className="text-2xl sm:text-3xl font-bold">{avgLiquidity}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">High Liquidity Skills</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{highLiquidity.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Low Liquidity</p>
            <p className="text-2xl sm:text-3xl font-bold text-destructive">{lowLiquidity.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Oversupplied</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">{oversupplied.length}</p>
          </CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Liquidity vs Conversion</CardTitle></CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="liquidity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversion" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[350px] flex items-center justify-center text-muted-foreground">No data</div>}
          </CardContent>
        </Card>

        {/* Risk Flags */}
        {(lowLiquidity.length > 0 || oversupplied.length > 0) && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Risk Flags</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {lowLiquidity.map(m => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-destructive/5">
                  <span className="text-sm">{m.skill_name}</span>
                  <Badge variant="destructive">Low Liquidity: {m.liquidity_score}</Badge>
                </div>
              ))}
              {oversupplied.map(m => (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-amber-500/5">
                  <span className="text-sm">{m.skill_name}</span>
                  <Badge className="bg-amber-500/10 text-amber-700">Oversupplied ({m.total_active_bids} bids / {m.total_active_projects} projects)</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
