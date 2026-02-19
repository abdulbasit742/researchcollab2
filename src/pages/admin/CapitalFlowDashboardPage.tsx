import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCapitalFlowMetrics, useSponsorPipeline, useHiringConversions } from "@/hooks/useRevenueEngine";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { DollarSign, TrendingUp, Users, Target, Clock, Repeat, ArrowRight, Activity, Zap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

function LoopNode({ label, emoji, delay }: { label: string; emoji: string; delay: number }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 150 }}
    >
      <span className="text-base">{emoji}</span>
      <span className="text-xs font-medium text-primary whitespace-nowrap">{label}</span>
    </motion.div>
  );
}

function LoopArrow({ delay }: { delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}>
      <ArrowRight className="h-4 w-4 text-primary/40" />
    </motion.div>
  );
}

export default function CapitalFlowDashboardPage() {
  const { data: snapshots, isLoading } = useCapitalFlowMetrics();
  const { pipelineStats } = useSponsorPipeline();
  const { stats: hiringStats } = useHiringConversions();
  const pStats = pipelineStats();
  const hStats = hiringStats();

  const chartData = [...(snapshots ?? [])].reverse().map((s: any) => ({
    date: s.snapshot_date?.slice(5) || "",
    escrow: Number(s.monthly_escrow_volume || 0),
    velocity: Number(s.weekly_funding_velocity || 0),
    retention: Number(s.sponsor_retention_pct || 0),
    cycle: Number(s.avg_deal_cycle_days || 0),
    completion: Number(s.completion_rate || 0),
    hiring: Number(s.hiring_conversion_pct || 0),
  }));

  const latest = chartData[chartData.length - 1];

  const kpis = [
    { label: "Escrow Volume", value: latest ? `PKR ${(latest.escrow / 1e6).toFixed(2)}M` : "—", icon: DollarSign, sub: "monthly" },
    { label: "Capital Velocity", value: latest ? `PKR ${(latest.velocity / 1000).toFixed(0)}K/wk` : "—", icon: TrendingUp, sub: "weekly" },
    { label: "Retention", value: latest ? `${latest.retention.toFixed(0)}%` : `${pStats.repeatRate.toFixed(0)}%`, icon: Repeat, sub: "sponsors" },
    { label: "Deal Cycle", value: latest ? `${latest.cycle.toFixed(0)}d` : "—", icon: Clock, sub: "average" },
    { label: "Completion", value: latest ? `${latest.completion.toFixed(0)}%` : "—", icon: CheckCircle, sub: "rate" },
    { label: "Hiring", value: `${hStats.conversionRate.toFixed(0)}%`, icon: Users, sub: "conversion" },
  ];

  const loopSteps = [
    { label: "Funded FYPs", emoji: "💰" },
    { label: "Trust Data", emoji: "🛡️" },
    { label: "Sponsor Confidence", emoji: "📈" },
    { label: "Fast Funding", emoji: "⚡" },
    { label: "Hiring", emoji: "🤝" },
    { label: "Reputation", emoji: "🏆" },
    { label: "More Sponsors", emoji: "🔄" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            Capital Flow Metrics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">No vanity metrics — only capital flow reality</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                <Card className="group hover:border-primary/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <p className="text-xl font-bold font-mono">{kpi.value}</p>
                    <p className="text-[9px] text-muted-foreground">{kpi.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: "Escrow Volume Trend",
              chart: (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v/1e6).toFixed(1)}M`} className="text-xs" />
                  <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                  <Area type="monotone" dataKey="escrow" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                </AreaChart>
              ),
            },
            {
              title: "Weekly Funding Velocity",
              chart: (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} className="text-xs" />
                  <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                  <Bar dataKey="velocity" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                </BarChart>
              ),
            },
            {
              title: "Retention & Completion",
              chart: (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="retention" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Retention %" />
                  <Line type="monotone" dataKey="completion" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Completion %" />
                </LineChart>
              ),
            },
            {
              title: "Hiring Conversion Trend",
              chart: (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area type="monotone" dataKey="hiring" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2)/0.1)" strokeWidth={2} name="Hiring %" />
                </AreaChart>
              ),
            },
          ].map((panel, i) => (
            <motion.div key={panel.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{panel.title}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    {panel.chart}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Defensibility Loop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-primary/20 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Defensibility Loop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-center gap-2 py-4">
                {loopSteps.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-2">
                    <LoopNode label={step.label} emoji={step.emoji} delay={0.7 + i * 0.1} />
                    {i < loopSteps.length - 1 && <LoopArrow delay={0.75 + i * 0.1} />}
                  </div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="ml-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest"
                >
                  ∞ LOOP
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
