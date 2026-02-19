import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCapitalFlowMetrics, useSponsorPipeline, useHiringConversions } from "@/hooks/useRevenueEngine";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { DollarSign, TrendingUp, Users, Target, Clock, Repeat, ArrowUpRight, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function CapitalFlowDashboardPage() {
  const { data: snapshots, isLoading } = useCapitalFlowMetrics();
  const { pipelineStats } = useSponsorPipeline();
  const { stats: hiringStats } = useHiringConversions();
  const pStats = pipelineStats();
  const hStats = hiringStats();

  const chartData = [...(snapshots ?? [])].reverse().map((s: any) => ({
    date: s.snapshot_date,
    escrow: Number(s.monthly_escrow_volume || 0),
    velocity: Number(s.weekly_funding_velocity || 0),
    retention: Number(s.sponsor_retention_pct || 0),
    cycle: Number(s.avg_deal_cycle_days || 0),
    completion: Number(s.completion_rate || 0),
    hiring: Number(s.hiring_conversion_pct || 0),
  }));

  const latest = chartData[chartData.length - 1];

  const kpis = [
    { label: "Monthly Escrow Volume", value: latest ? `PKR ${(latest.escrow / 1e6).toFixed(2)}M` : "—", icon: DollarSign, color: "text-primary" },
    { label: "Capital Velocity", value: latest ? `PKR ${(latest.velocity / 1000).toFixed(0)}K/wk` : "—", icon: TrendingUp, color: "text-green-400" },
    { label: "Sponsor Retention", value: latest ? `${latest.retention.toFixed(0)}%` : `${pStats.repeatRate.toFixed(0)}%`, icon: Repeat, color: "text-blue-400" },
    { label: "Avg Deal Cycle", value: latest ? `${latest.cycle.toFixed(0)}d` : "—", icon: Clock, color: "text-amber-400" },
    { label: "Completion Rate", value: latest ? `${latest.completion.toFixed(0)}%` : "—", icon: Target, color: "text-cyan-400" },
    { label: "Hiring Conversion", value: `${hStats.conversionRate.toFixed(0)}%`, icon: Users, color: "text-emerald-400" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Capital Flow Metrics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">No vanity metrics — only capital flow reality</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-4 w-4 ${kpi.color}`} />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <p className="text-xl font-bold font-mono">{kpi.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Escrow Volume Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v/1e6).toFixed(1)}M`} className="text-xs" />
                  <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                  <Area type="monotone" dataKey="escrow" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Weekly Funding Velocity</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} className="text-xs" />
                  <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                  <Bar dataKey="velocity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Sponsor Retention & Completion</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="retention" stroke="hsl(var(--primary))" strokeWidth={2} name="Retention %" />
                  <Line type="monotone" dataKey="completion" stroke="hsl(var(--accent-foreground))" strokeWidth={2} name="Completion %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Hiring Conversion Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area type="monotone" dataKey="hiring" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.15)" strokeWidth={2} name="Hiring %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Defensibility Loop Visual */}
        <Card>
          <CardHeader><CardTitle className="text-base">Defensibility Loop</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-2 py-4 text-sm">
              {[
                "More Funded FYPs", "Higher Trust Data", "Better Sponsor Confidence",
                "Faster Funding", "Higher Hiring", "Stronger Reputation", "More Sponsors"
              ].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-xs">{step}</span>
                  {i < arr.length - 1 && <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">LOOP</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
