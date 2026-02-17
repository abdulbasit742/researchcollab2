import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLiquidityIndex } from "@/hooks/useLiquidityIndex";
import { useLIMSEStats, useSkillForecasts } from "@/hooks/useLIMSE";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Cell, ScatterChart, Scatter, ZAxis
} from "recharts";
import { TrendingUp, Activity, RefreshCw, Droplets, ArrowUpRight, ArrowDownRight, Flame, BarChart3, Target } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CATEGORY_COLORS: Record<string, string> = {
  Scarce: "hsl(0, 84%, 60%)",
  Balanced: "hsl(142, 71%, 45%)",
  Oversupplied: "hsl(38, 92%, 50%)",
  Inflated: "hsl(270, 70%, 60%)",
  Underpriced: "hsl(200, 80%, 50%)",
};

function classifySkill(score: number, bids: number, projects: number): string {
  if (score < 20) return "Scarce";
  if (bids > projects * 3) return "Oversupplied";
  if (score > 80) return "Inflated";
  if (score < 40 && bids < projects) return "Underpriced";
  return "Balanced";
}

export default function MarketLiquidityPage() {
  const { metrics: rawMetrics, metricsLoading, velocity, avgLiquidity, topSkill, compute, computing } = useLiquidityIndex();
  const { scarce, oversupplied } = useLIMSEStats();
  const { data: forecasts } = useSkillForecasts();

  const metrics = rawMetrics.map(m => ({
    ...m,
    category: classifySkill(m.liquidity_score, m.total_active_bids, m.total_active_projects),
  }));

  const heatmapData = metrics.slice(0, 20).map(m => ({
    name: m.skill_name?.length > 12 ? m.skill_name.slice(0, 12) + "…" : m.skill_name,
    supply: m.total_active_bids,
    demand: m.total_active_projects,
    liquidity: m.liquidity_score,
    category: m.category,
  }));

  const radarData = metrics.slice(0, 6).map(m => ({
    skill: m.skill_name,
    liquidity: m.liquidity_score,
    conversion: m.deal_conversion_rate,
    trust: m.trust_weighted_success_rate,
  }));

  const trendData = (velocity ?? []).slice(0, 20).map((v: any) => ({
    name: v.skill_name?.length > 10 ? v.skill_name.slice(0, 10) + "…" : v.skill_name,
    growth: v.growth_rate ?? 0,
    velocity: v.velocity_score ?? 0,
  }));

  const categoryBreakdown = Object.entries(
    metrics.reduce<Record<string, number>>((acc, m) => {
      acc[m.category] = (acc[m.category] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Droplets className="h-8 w-8 text-primary" />
              Global Skill Liquidity Index
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time supply/demand intelligence across the professional economy
            </p>
          </div>
          <Button onClick={() => compute()} disabled={computing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${computing ? "animate-spin" : ""}`} />
            Recompute
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg Liquidity</p>
            <p className="text-2xl font-bold">{avgLiquidity}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Skills Tracked</p>
            <p className="text-2xl font-bold">{metrics.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Scarce Skills</p>
            <p className="text-2xl font-bold text-destructive">{scarce.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Oversupplied</p>
            <p className="text-2xl font-bold text-amber-600">{oversupplied.length}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Top Skill</p>
            <p className="text-sm font-bold truncate">{topSkill?.skill_name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{topSkill?.liquidity_score ?? 0} score</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="heatmap">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="heatmap"><BarChart3 className="h-4 w-4 mr-1" />Heatmap</TabsTrigger>
            <TabsTrigger value="radar"><Target className="h-4 w-4 mr-1" />Multi-Dim</TabsTrigger>
            <TabsTrigger value="trends"><TrendingUp className="h-4 w-4 mr-1" />Trends</TabsTrigger>
            <TabsTrigger value="forecast"><Flame className="h-4 w-4 mr-1" />Forecast</TabsTrigger>
          </TabsList>

          {/* Heatmap: Supply vs Demand scatter */}
          <TabsContent value="heatmap">
            <Card>
              <CardHeader><CardTitle>Supply vs Demand by Skill</CardTitle></CardHeader>
              <CardContent>
                {heatmapData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                      <XAxis dataKey="demand" name="Demand (Projects)" type="number" />
                      <YAxis dataKey="supply" name="Supply (Bids)" type="number" />
                      <ZAxis dataKey="liquidity" range={[50, 500]} name="Liquidity" />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload?.length) return null;
                          const d = payload[0]?.payload;
                          return (
                            <div className="bg-popover border rounded-lg p-3 shadow-lg text-sm">
                              <p className="font-semibold">{d?.name}</p>
                              <p>Demand: {d?.demand} projects</p>
                              <p>Supply: {d?.supply} bids</p>
                              <p>Liquidity: {d?.liquidity}</p>
                              <Badge className="mt-1" style={{ backgroundColor: CATEGORY_COLORS[d?.category] + "22", color: CATEGORY_COLORS[d?.category] }}>
                                {d?.category}
                              </Badge>
                            </div>
                          );
                        }}
                      />
                      <Scatter data={heatmapData}>
                        {heatmapData.map((entry, i) => (
                          <Cell key={i} fill={CATEGORY_COLORS[entry.category] ?? "hsl(var(--primary))"} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    No data yet. Click "Recompute" to generate.
                  </div>
                )}
                {/* Category Legend */}
                <div className="flex flex-wrap gap-3 mt-4 justify-center">
                  {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
                    <div key={name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Radar */}
          <TabsContent value="radar">
            <Card>
              <CardHeader><CardTitle>Multi-Dimension Analysis</CardTitle></CardHeader>
              <CardContent>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis />
                      <Radar dataKey="liquidity" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      <Radar dataKey="conversion" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} />
                      <Radar dataKey="trust" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.15} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends">
            <Card>
              <CardHeader><CardTitle>Economic Velocity Trends</CardTitle></CardHeader>
              <CardContent>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={trendData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="growth" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="velocity" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">No velocity data</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast */}
          <TabsContent value="forecast">
            <Card>
              <CardHeader><CardTitle>30-Day Skill Forecasts</CardTitle></CardHeader>
              <CardContent>
                {(forecasts ?? []).length > 0 ? (
                  <div className="space-y-3">
                    {(forecasts ?? []).map(f => (
                      <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{f.skill_name}</p>
                          <p className="text-xs text-muted-foreground">{f.ai_reasoning ?? "AI forecast"}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Demand</p>
                            <p className={f.predicted_demand_change > 0 ? "text-green-600" : "text-destructive"}>
                              {f.predicted_demand_change > 0 ? "+" : ""}{f.predicted_demand_change}%
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className={f.predicted_price_change > 0 ? "text-green-600" : "text-destructive"}>
                              {f.predicted_price_change > 0 ? "+" : ""}{f.predicted_price_change}%
                            </p>
                          </div>
                          <Badge variant={f.signal === "rising" ? "default" : f.signal === "declining" ? "destructive" : "secondary"}>
                            {f.signal}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{Math.round(f.confidence_score)}% conf</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No forecasts available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Full Metrics Table */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5" /> Skill Market Metrics</CardTitle></CardHeader>
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
                  {metrics.map(m => {
                    const cat = m.category;
                    return (
                      <tr key={m.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{m.skill_name}</td>
                        <td className="p-2 text-right">{m.total_active_projects}</td>
                        <td className="p-2 text-right">{m.total_active_bids}</td>
                        <td className="p-2 text-right">PKR {m.avg_bid_price?.toLocaleString()}</td>
                        <td className="p-2 text-right">{m.deal_conversion_rate}%</td>
                        <td className="p-2 text-right font-medium">{m.liquidity_score}</td>
                        <td className="p-2 text-right">
                          <Badge style={{ backgroundColor: CATEGORY_COLORS[cat] + "18", color: CATEGORY_COLORS[cat] }}>
                            {cat === "Scarce" && <ArrowDownRight className="h-3 w-3 mr-1 inline" />}
                            {cat === "Oversupplied" && <ArrowUpRight className="h-3 w-3 mr-1 inline" />}
                            {cat}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {metrics.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No market data yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
