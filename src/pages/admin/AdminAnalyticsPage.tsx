import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Package, DollarSign, CheckCircle } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, subMonths } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [userGrowth, setUserGrowth] = useState<{ date: string; users: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [toolPopularity, setToolPopularity] = useState<{ name: string; subscriptions: number }[]>([]);
  const [verificationStats, setVerificationStats] = useState<{ name: string; value: number }[]>([]);
  const [projectStats, setProjectStats] = useState<{ status: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserGrowth(),
        fetchRevenueData(),
        fetchToolPopularity(),
        fetchVerificationStats(),
        fetchProjectStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGrowth = async () => {
    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
    const startDate = subDays(new Date(), days);

    const { data } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", startDate.toISOString());

    // Group by day
    const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });
    const growthData = dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const count = data?.filter((p) => format(new Date(p.created_at), "yyyy-MM-dd") === dateStr).length || 0;
      return { date: format(date, "MMM dd"), users: count };
    });

    // Make it cumulative
    let cumulative = 0;
    const cumulativeData = growthData.map((item) => {
      cumulative += item.users;
      return { ...item, users: cumulative };
    });

    setUserGrowth(cumulativeData);
  };

  const fetchRevenueData = async () => {
    const startDate = subMonths(new Date(), 6);
    
    const { data } = await supabase
      .from("tool_orders")
      .select("amount, created_at")
      .gte("created_at", startDate.toISOString())
      .eq("status", "delivered");

    const monthRange = eachMonthOfInterval({ start: startDate, end: new Date() });
    const revenueByMonth = monthRange.map((month) => {
      const monthStr = format(month, "yyyy-MM");
      const total = data
        ?.filter((o) => format(new Date(o.created_at), "yyyy-MM") === monthStr)
        .reduce((sum, o) => sum + Number(o.amount || 0), 0) || 0;
      return { month: format(month, "MMM yyyy"), revenue: total };
    });

    setRevenueData(revenueByMonth);
  };

  const fetchToolPopularity = async () => {
    const { data: subscriptions } = await supabase
      .from("tool_subscriptions")
      .select("tool_id");

    const { data: tools } = await supabase
      .from("tools")
      .select("id, name");

    // Count subscriptions per tool
    const toolCounts: Record<string, number> = {};
    subscriptions?.forEach((sub) => {
      toolCounts[sub.tool_id] = (toolCounts[sub.tool_id] || 0) + 1;
    });

    const popularity = tools
      ?.map((tool) => ({
        name: tool.name,
        subscriptions: toolCounts[tool.id] || 0,
      }))
      .sort((a, b) => b.subscriptions - a.subscriptions)
      .slice(0, 6) || [];

    setToolPopularity(popularity);
  };

  const fetchVerificationStats = async () => {
    const { data } = await supabase
      .from("verification_submissions")
      .select("status");

    const stats: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
    data?.forEach((v) => {
      stats[v.status] = (stats[v.status] || 0) + 1;
    });

    setVerificationStats([
      { name: "Approved", value: stats.approved || 0 },
      { name: "Pending", value: stats.pending || 0 },
      { name: "Rejected", value: stats.rejected || 0 },
    ]);
  };

  const fetchProjectStats = async () => {
    const { data } = await supabase
      .from("earning_projects")
      .select("status");

    const stats: Record<string, number> = {};
    data?.forEach((p) => {
      const status = p.status || "unknown";
      stats[status] = (stats[status] || 0) + 1;
    });

    setProjectStats(
      Object.entries(stats).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }))
    );
  };

  // Calculate summary stats
  const totalUsers = userGrowth.length > 0 ? userGrowth[userGrowth.length - 1].users : 0;
  const totalRevenue = revenueData.reduce((sum, m) => sum + m.revenue, 0);
  const totalTools = toolPopularity.reduce((sum, t) => sum + t.subscriptions, 0);
  const approvalRate = verificationStats.find((v) => v.name === "Approved")?.value || 0;
  const totalVerifications = verificationStats.reduce((sum, v) => sum + v.value, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Platform performance and insights</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tool Subscriptions</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTools}</div>
              <p className="text-xs text-muted-foreground">Active subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalVerifications > 0 ? Math.round((approvalRate / totalVerifications) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Verification approvals</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="growth" className="space-y-4">
          <TabsList>
            <TabsTrigger value="growth">User Growth</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="tools">Tool Popularity</TabsTrigger>
            <TabsTrigger value="verifications">Verifications</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="growth">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  User Growth Trend
                </CardTitle>
                <CardDescription>Cumulative user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))" 
                        }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                        name="Total Users"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Monthly Revenue
                </CardTitle>
                <CardDescription>Revenue from tool orders over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))" 
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Top Tools by Subscriptions
                </CardTitle>
                <CardDescription>Most popular tools on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={toolPopularity} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={120} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))" 
                        }}
                      />
                      <Bar dataKey="subscriptions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Verification Status Distribution
                </CardTitle>
                <CardDescription>Breakdown of verification submission statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verificationStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={150}
                        dataKey="value"
                      >
                        {verificationStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))" 
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Projects by Status
                </CardTitle>
                <CardDescription>Distribution of earning projects by their current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="status" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))" 
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                        {projectStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
