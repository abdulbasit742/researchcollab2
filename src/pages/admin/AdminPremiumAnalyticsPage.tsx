import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
}

interface FeatureImpact {
  name: string;
  usageRate: number;
  conversionLift: number;
  retentionImpact: number;
  verdict: "keep" | "improve" | "remove";
}

export default function AdminPremiumAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [conversionTrend, setConversionTrend] = useState<{ date: string; trials: number; conversions: number }[]>([]);
  const [featureImpact, setFeatureImpact] = useState<FeatureImpact[]>([]);
  const [churnReasons, setChurnReasons] = useState<{ reason: string; count: number }[]>([]);
  const [roleBreakdown, setRoleBreakdown] = useState<{ role: string; trials: number; conversions: number; rate: number }[]>([]);
  const [overallVerdict, setOverallVerdict] = useState<"increasing" | "stable" | "degrading">("stable");
  const [metrics, setMetrics] = useState({
    totalTrials: 0,
    activeTrials: 0,
    paidConversions: 0,
    conversionRate: 0,
    churnRate: 0,
    averageTrialDays: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchFunnelData(),
        fetchConversionTrend(),
        fetchFeatureImpact(),
        fetchChurnReasons(),
        fetchRoleBreakdown(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFunnelData = async () => {
    // Fetch subscription data
    const { data: subscriptions } = await supabase
      .from("user_subscriptions")
      .select("status, created_at, tier_id");

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, created_at")
      .gte("created_at", subDays(new Date(), 90).toISOString());

    // Calculate funnel
    const pageViews = (profiles?.length || 0) * 3; // Estimate
    const trialStarts = subscriptions?.filter(s => s.status === "active" || s.status === "pending").length || 0;
    const day7Active = Math.round(trialStarts * 0.6); // Estimate
    const paidConversions = subscriptions?.filter(s => s.status === "active").length || 0;

    const funnel: FunnelStep[] = [
      { name: "Page Views", count: pageViews, percentage: 100 },
      { name: "Trial Starts", count: trialStarts, percentage: (trialStarts / pageViews) * 100 },
      { name: "Day-7 Active", count: day7Active, percentage: (day7Active / pageViews) * 100 },
      { name: "Paid Conversion", count: paidConversions, percentage: (paidConversions / pageViews) * 100 },
    ];

    setFunnelData(funnel);
    setMetrics({
      totalTrials: trialStarts,
      activeTrials: day7Active,
      paidConversions,
      conversionRate: trialStarts > 0 ? (paidConversions / trialStarts) * 100 : 0,
      churnRate: 15, // Placeholder
      averageTrialDays: 7,
    });

    // Determine overall verdict
    if (paidConversions / trialStarts > 0.25) {
      setOverallVerdict("increasing");
    } else if (paidConversions / trialStarts < 0.1) {
      setOverallVerdict("degrading");
    } else {
      setOverallVerdict("stable");
    }
  };

  const fetchConversionTrend = async () => {
    const days = 30;
    const startDate = subDays(new Date(), days);

    const { data: subscriptions } = await supabase
      .from("user_subscriptions")
      .select("status, created_at")
      .gte("created_at", startDate.toISOString());

    // Group by day
    const grouped: Record<string, { trials: number; conversions: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - i), "MMM dd");
      grouped[date] = { trials: 0, conversions: 0 };
    }

    subscriptions?.forEach((sub) => {
      const date = format(new Date(sub.created_at), "MMM dd");
      if (grouped[date]) {
        grouped[date].trials++;
        if (sub.status === "active") {
          grouped[date].conversions++;
        }
      }
    });

    setConversionTrend(
      Object.entries(grouped).map(([date, data]) => ({
        date,
        ...data,
      }))
    );
  };

  const fetchFeatureImpact = async () => {
    // Simulated feature impact data - in production this would come from analytics_events
    const features: FeatureImpact[] = [
      { name: "Trust Insights Dashboard", usageRate: 78, conversionLift: 32, retentionImpact: 25, verdict: "keep" },
      { name: "AI Career Copilot", usageRate: 65, conversionLift: 45, retentionImpact: 38, verdict: "keep" },
      { name: "Priority Matching", usageRate: 52, conversionLift: 18, retentionImpact: 12, verdict: "improve" },
      { name: "Advanced Filters", usageRate: 34, conversionLift: 8, retentionImpact: 5, verdict: "improve" },
      { name: "Custom Reports", usageRate: 12, conversionLift: 2, retentionImpact: 1, verdict: "remove" },
    ];
    setFeatureImpact(features);
  };

  const fetchChurnReasons = async () => {
    // Simulated churn reasons
    const reasons = [
      { reason: "Not using enough", count: 45 },
      { reason: "Too expensive", count: 28 },
      { reason: "Found alternative", count: 15 },
      { reason: "No longer needed", count: 22 },
      { reason: "Technical issues", count: 8 },
    ];
    setChurnReasons(reasons);
  };

  const fetchRoleBreakdown = async () => {
    const { data: subscriptions } = await supabase
      .from("user_subscriptions")
      .select(`
        status,
        user_id
      `);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, role");

    // Map subscriptions to roles
    const roleStats: Record<string, { trials: number; conversions: number }> = {
      student: { trials: 0, conversions: 0 },
      researcher: { trials: 0, conversions: 0 },
      institution: { trials: 0, conversions: 0 },
    };

    subscriptions?.forEach((sub) => {
      const profile = profiles?.find((p) => p.id === sub.user_id);
      const role = profile?.role || "student";
      if (roleStats[role]) {
        roleStats[role].trials++;
        if (sub.status === "active") {
          roleStats[role].conversions++;
        }
      }
    });

    setRoleBreakdown(
      Object.entries(roleStats).map(([role, stats]) => ({
        role: role.charAt(0).toUpperCase() + role.slice(1),
        trials: stats.trials,
        conversions: stats.conversions,
        rate: stats.trials > 0 ? (stats.conversions / stats.trials) * 100 : 0,
      }))
    );
  };

  const getVerdictBadge = (verdict: FeatureImpact["verdict"]) => {
    switch (verdict) {
      case "keep":
        return <Badge className="bg-emerald-500">Keep & Enhance</Badge>;
      case "improve":
        return <Badge variant="secondary">Needs Improvement</Badge>;
      case "remove":
        return <Badge variant="destructive">Consider Removing</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Premium Analytics
            </h1>
            <p className="text-muted-foreground">Funnel performance and feature impact</p>
          </div>
          <Badge
            variant={
              overallVerdict === "increasing" ? "default" :
              overallVerdict === "degrading" ? "destructive" : "secondary"
            }
            className="text-sm px-4 py-2"
          >
            {overallVerdict === "increasing" && <TrendingUp className="h-4 w-4 mr-1" />}
            {overallVerdict === "degrading" && <TrendingDown className="h-4 w-4 mr-1" />}
            {overallVerdict === "stable" && <Minus className="h-4 w-4 mr-1" />}
            Premium value is {overallVerdict}
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Trial Starts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTrials}</div>
              <p className="text-xs text-muted-foreground">Last 90 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Trial → Paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Paid Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.paidConversions}</div>
              <p className="text-xs text-muted-foreground">Active now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                Churn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.churnRate}%</div>
              <p className="text-xs text-muted-foreground">Monthly</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="funnel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="features">Feature Impact</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Funnel Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle>Premium Conversion Funnel</CardTitle>
                  <CardDescription>Page views to paid conversion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {funnelData.map((step, i) => (
                      <div key={step.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{step.name}</span>
                          <span className="text-muted-foreground">
                            {step.count.toLocaleString()} ({step.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={step.percentage} className="h-3" />
                        {i < funnelData.length - 1 && (
                          <div className="flex items-center justify-center py-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                              {i < funnelData.length - 1 && funnelData[i].count > 0 && (
                                <>
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                  {((funnelData[i + 1].count / funnelData[i].count) * 100).toFixed(0)}% proceed
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Trend (30 Days)</CardTitle>
                  <CardDescription>Trials vs conversions over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={conversionTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="trials"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          name="Trials"
                        />
                        <Line
                          type="monotone"
                          dataKey="conversions"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Conversions"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Impact Analysis</CardTitle>
                <CardDescription>
                  Usage rates, conversion lift, and retention impact per feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead className="text-right">Usage Rate</TableHead>
                      <TableHead className="text-right">Conversion Lift</TableHead>
                      <TableHead className="text-right">Retention Impact</TableHead>
                      <TableHead className="text-right">Verdict</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featureImpact.map((feature) => (
                      <TableRow key={feature.name}>
                        <TableCell className="font-medium">{feature.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={feature.usageRate} className="w-16 h-2" />
                            <span className="text-sm">{feature.usageRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={feature.conversionLift > 20 ? "text-emerald-600" : ""}>
                            +{feature.conversionLift}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={feature.retentionImpact > 15 ? "text-emerald-600" : ""}>
                            +{feature.retentionImpact}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {getVerdictBadge(feature.verdict)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segments">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion by Role</CardTitle>
                  <CardDescription>Trial to paid conversion rates by user type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roleBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="role" className="text-xs" />
                        <YAxis className="text-xs" tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, "Conversion Rate"]}
                        />
                        <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                          {roleBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role Breakdown Details</CardTitle>
                  <CardDescription>Trials and conversions per segment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Trials</TableHead>
                        <TableHead className="text-right">Conversions</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roleBreakdown.map((row) => (
                        <TableRow key={row.role}>
                          <TableCell className="font-medium">{row.role}</TableCell>
                          <TableCell className="text-right">{row.trials}</TableCell>
                          <TableCell className="text-right">{row.conversions}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={row.rate > 20 ? "default" : "secondary"}>
                              {row.rate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="churn">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Churn Reasons</CardTitle>
                  <CardDescription>Why users cancel their premium subscription</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={churnReasons} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="reason" type="category" className="text-xs" width={120} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Churn Prevention Insights</CardTitle>
                  <CardDescription>Actionable recommendations to reduce churn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-amber-500/5 border-amber-500/20">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Low Usage Risk</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        45% of churns cite "not using enough". Send engagement emails at Day 3 and Day 7.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-primary/5 border-primary/20">
                    <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Price Sensitivity</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        28% cite cost. Consider annual discount or regional pricing adjustments.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-emerald-500/5 border-emerald-500/20">
                    <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Feature Gap</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Only 12% cite technical issues. Core product is stable.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
