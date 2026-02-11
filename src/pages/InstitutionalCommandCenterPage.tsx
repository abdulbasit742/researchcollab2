import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  useInstitutionalIntelligence,
  type SkillGap,
} from "@/hooks/useInstitutionalIntelligence";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, LineChart, Line, Legend,
  Cell, PieChart, Pie,
} from "recharts";
import {
  Users, TrendingUp, DollarSign, Shield, Activity, RefreshCw,
  AlertTriangle, Award, Briefcase, Target, Zap, BarChart3,
} from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function InstitutionalCommandCenterPage() {
  const { id: institutionId } = useParams<{ id: string }>();
  const { intelligence, isLoading, error, snapshots, refresh } = useInstitutionalIntelligence(institutionId);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-7xl py-6 px-4 space-y-6">
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </MainLayout>
    );
  }

  if (error || !intelligence) {
    return (
      <MainLayout>
        <div className="container max-w-7xl py-12 px-4 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">{error || "Unable to load institutional intelligence."}</p>
        </div>
      </MainLayout>
    );
  }

  const {
    total_members, avg_trust_score, avg_visibility_score, total_active_deals,
    total_completed_deals, avg_deal_health, skill_distribution,
    income_generated_last_90_days, skill_gaps, forecast, performance,
    health_index, badges,
  } = intelligence;

  const riskColor = forecast.risk_alert_level === "high"
    ? "text-destructive" : forecast.risk_alert_level === "medium"
    ? "text-amber-500" : "text-emerald-500";

  // Skill distribution chart data
  const skillChartData = Object.entries(skill_distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  // Health radial data
  const healthRadialData = [{ name: "Health", value: health_index, fill: "hsl(var(--primary))" }];

  // Snapshot trend data
  const trendData = [...snapshots].reverse().slice(-10).map((s: any) => ({
    date: new Date(s.calculated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    trust: s.avg_trust_score,
    visibility: s.avg_visibility_score,
    income: s.income_generated_last_90_days,
  }));

  return (
    <MainLayout>
      <div className="container max-w-7xl py-6 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Target className="h-7 w-7 text-primary" />
                Global Talent Command Center
              </h1>
              <p className="text-muted-foreground mt-1">Real-time institutional intelligence dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              {badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  {badge}
                </Badge>
              ))}
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard icon={Users} label="Total Members" value={total_members} />
            <MetricCard icon={Shield} label="Avg Trust" value={avg_trust_score.toFixed(1)} suffix="/100" />
            <MetricCard icon={Activity} label="Avg Visibility" value={avg_visibility_score.toFixed(1)} suffix="/100" />
            <MetricCard icon={DollarSign} label="Income (90d)" value={`PKR ${(income_generated_last_90_days / 1000).toFixed(0)}k`} />
            <MetricCard icon={Briefcase} label="Active Deals" value={total_active_deals} />
            <MetricCard icon={TrendingUp} label="Completed Deals" value={total_completed_deals} />
            <MetricCard icon={Zap} label="Avg Deal Health" value={avg_deal_health.toFixed(1)} suffix="/100" />
            <HealthIndexCard healthIndex={health_index} />
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Health Index Radial */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Institutional Health Index</CardTitle>
                    <CardDescription>Composite score across all dimensions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={healthRadialData} startAngle={180} endAngle={0}>
                        <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(var(--muted))" }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="text-center -mt-16">
                      <span className="text-4xl font-bold">{health_index}</span>
                      <span className="text-muted-foreground">/100</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk & Forecast Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">90-Day Forecast</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Risk Level</span>
                      <Badge variant={forecast.risk_alert_level === "low" ? "secondary" : "destructive"} className={riskColor}>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {forecast.risk_alert_level.toUpperCase()}
                      </Badge>
                    </div>
                    <ForecastRow label="Growth Projection" value={`${forecast.projected_growth_90_days}%`} />
                    <ForecastRow label="Income Projection" value={`PKR ${(forecast.projected_income_90_days / 1000).toFixed(0)}k`} />
                    <ForecastRow label="Trust Growth" value={`+${forecast.projected_trust_growth}`} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* SKILLS */}
            <TabsContent value="skills" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Skill Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {skillChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={skillChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis type="number" className="text-xs fill-muted-foreground" />
                          <YAxis dataKey="skill" type="category" width={120} className="text-xs fill-muted-foreground" />
                          <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No skill data available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Skill Gaps (Demand vs Supply)</CardTitle>
                    <CardDescription>Higher gap score = more urgent need</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {skill_gaps.map((gap: SkillGap) => (
                        <SkillGapRow key={gap.skill_name} gap={gap} />
                      ))}
                      {skill_gaps.length === 0 && (
                        <p className="text-center text-muted-foreground py-12">No gaps detected</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* FORECAST */}
            <TabsContent value="forecast">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Talent Forecast Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ForecastCard label="Growth (90d)" value={`${forecast.projected_growth_90_days}%`} icon={TrendingUp} />
                    <ForecastCard label="Income (90d)" value={`PKR ${(forecast.projected_income_90_days / 1000).toFixed(0)}k`} icon={DollarSign} />
                    <ForecastCard label="Trust Growth" value={`+${forecast.projected_trust_growth}`} icon={Shield} />
                    <ForecastCard label="Risk Level" value={forecast.risk_alert_level} icon={AlertTriangle} danger={forecast.risk_alert_level !== "low"} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PERFORMANCE */}
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PerformanceGauge label="Collaboration" value={performance.collaboration_score} />
                    <PerformanceGauge label="Reliability" value={performance.reliability_score} />
                    <PerformanceGauge label="Dispute Ratio" value={performance.dispute_ratio} inverted />
                    <PerformanceGauge label="Economic Velocity" value={Math.min(performance.economic_velocity / 100, 100)} />
                    <PerformanceGauge label="Knowledge Output" value={performance.knowledge_output_score} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TRENDS */}
            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Historical Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {trendData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                        <YAxis className="text-xs fill-muted-foreground" />
                        <RechartsTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                        <Legend />
                        <Line type="monotone" dataKey="trust" name="Trust" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="visibility" name="Visibility" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground py-12">Not enough data for trends yet. Refresh to generate snapshots.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
}

// Sub-components

function MetricCard({ icon: Icon, label, value, suffix }: { icon: any; label: string; value: any; suffix?: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold">
          {value}
          {suffix && <span className="text-sm font-normal text-muted-foreground">{suffix}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

function HealthIndexCard({ healthIndex }: { healthIndex: number }) {
  const color = healthIndex >= 80 ? "text-emerald-500" : healthIndex >= 50 ? "text-amber-500" : "text-destructive";
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Health Index</span>
        </div>
        <p className={`text-2xl font-bold ${color}`}>
          {healthIndex}<span className="text-sm font-normal text-muted-foreground">/100</span>
        </p>
      </CardContent>
    </Card>
  );
}

function ForecastRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold text-sm">{value}</span>
    </div>
  );
}

function ForecastCard({ label, value, icon: Icon, danger }: { label: string; value: string; icon: any; danger?: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${danger ? "border-destructive/50 bg-destructive/5" : "bg-muted/30"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${danger ? "text-destructive" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-xl font-bold ${danger ? "text-destructive" : ""}`}>{value}</p>
    </div>
  );
}

function SkillGapRow({ gap }: { gap: SkillGap }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium truncate">{gap.skill_name}</span>
          <span className="text-xs text-muted-foreground">Gap: {gap.gap_score}%</span>
        </div>
        <div className="flex gap-1 items-center">
          <span className="text-xs text-muted-foreground w-14">D: {gap.demand_index}</span>
          <Progress value={gap.gap_score} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground w-12">S: {gap.supply_index}</span>
        </div>
      </div>
    </div>
  );
}

function PerformanceGauge({ label, value, inverted }: { label: string; value: number; inverted?: boolean }) {
  const displayVal = Math.round(value * 10) / 10;
  const pct = Math.min(Math.max(value, 0), 100);
  const color = inverted
    ? (pct > 15 ? "text-destructive" : pct > 5 ? "text-amber-500" : "text-emerald-500")
    : (pct >= 70 ? "text-emerald-500" : pct >= 40 ? "text-amber-500" : "text-destructive");

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{displayVal}%</span>
      </div>
      <Progress value={inverted ? 100 - pct : pct} className="h-2" />
    </div>
  );
}
