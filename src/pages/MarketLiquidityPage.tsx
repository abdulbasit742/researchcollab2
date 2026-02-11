import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLiquidityIndex } from "@/hooks/useLiquidityIndex";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { TrendingUp, Activity, RefreshCw, Droplets, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function MarketLiquidityPage() {
  const { metrics, metricsLoading, velocity, avgLiquidity, topSkill, compute, computing } = useLiquidityIndex();

  const barData = metrics.slice(0, 12).map(m => ({
    name: m.skill_name?.length > 10 ? m.skill_name.slice(0, 10) + "…" : m.skill_name,
    liquidity: m.liquidity_score,
    projects: m.total_active_projects,
    bids: m.total_active_bids,
  }));

  const radarData = metrics.slice(0, 6).map(m => ({
    skill: m.skill_name,
    liquidity: m.liquidity_score,
    conversion: m.deal_conversion_rate,
    trust: m.trust_weighted_success_rate,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Droplets className="h-8 w-8 text-primary" />
              Global Research Liquidity Index
            </h1>
            <p className="text-muted-foreground mt-1">Real-time talent supply, demand, and market intelligence</p>
          </div>
          <Button onClick={() => compute()} disabled={computing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${computing ? "animate-spin" : ""}`} />
            Refresh Index
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Liquidity</p>
            <p className="text-3xl font-bold">{avgLiquidity}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Skills Tracked</p>
            <p className="text-3xl font-bold">{metrics.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Top Skill</p>
            <p className="text-lg font-bold truncate">{topSkill?.skill_name ?? "—"}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Top Liquidity</p>
            <p className="text-3xl font-bold">{topSkill?.liquidity_score ?? 0}</p>
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Liquidity Chart */}
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5" /> Skill Liquidity</CardTitle></CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="liquidity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>No data yet. Click "Refresh Index" to compute.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trust-Weighted Radar */}
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Multi-Dimension View</CardTitle></CardHeader>
            <CardContent>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis />
                    <Radar dataKey="liquidity" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Radar dataKey="conversion" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metrics Table */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Skill Market Metrics</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left p-2">Skill</th>
                  <th className="text-right p-2">Projects</th>
                  <th className="text-right p-2">Bids</th>
                  <th className="text-right p-2">Avg Price</th>
                  <th className="text-right p-2">Conversion</th>
                  <th className="text-right p-2">Liquidity</th>
                  <th className="text-right p-2">Signal</th>
                </tr></thead>
                <tbody>
                  {metrics.map(m => (
                    <tr key={m.id} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{m.skill_name}</td>
                      <td className="p-2 text-right">{m.total_active_projects}</td>
                      <td className="p-2 text-right">{m.total_active_bids}</td>
                      <td className="p-2 text-right">PKR {m.avg_bid_price?.toLocaleString()}</td>
                      <td className="p-2 text-right">{m.deal_conversion_rate}%</td>
                      <td className="p-2 text-right font-medium">{m.liquidity_score}</td>
                      <td className="p-2 text-right">
                        {m.liquidity_score > 60 ? (
                          <Badge className="bg-green-500/10 text-green-700"><ArrowUpRight className="h-3 w-3 mr-1" />High</Badge>
                        ) : m.liquidity_score > 30 ? (
                          <Badge variant="secondary">Moderate</Badge>
                        ) : (
                          <Badge variant="destructive"><ArrowDownRight className="h-3 w-3 mr-1" />Low</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                  {metrics.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No market data yet</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
