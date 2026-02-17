import { Helmet } from "react-helmet-async";
import { KPICard } from "@/components/fyp/KPICard";
import { HealthBadge } from "@/components/fyp/HealthBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, TrendingUp, Building2, Clock, Users,
  BarChart3, Repeat
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

const revenueData = [
  { month: "Sep", revenue: 45000 },
  { month: "Oct", revenue: 82000 },
  { month: "Nov", revenue: 120000 },
  { month: "Dec", revenue: 95000 },
  { month: "Jan", revenue: 165000 },
  { month: "Feb", revenue: 205000 },
];

const departmentData = [
  { dept: "Computer Science", funded: 12, onTime: 83, revenue: "PKR 1.2M" },
  { dept: "Software Engineering", funded: 8, onTime: 75, revenue: "PKR 680K" },
  { dept: "Electrical Engineering", funded: 5, onTime: 90, revenue: "PKR 420K" },
  { dept: "Data Science", funded: 3, onTime: 67, revenue: "PKR 250K" },
];

const riskDistribution = [
  { name: "Healthy", value: 18, color: "hsl(152, 60%, 40%)" },
  { name: "At Risk", value: 6, color: "hsl(38, 92%, 50%)" },
  { name: "Critical", value: 2, color: "hsl(0, 72%, 51%)" },
];

const topTeams = [
  { name: "Team Innovators", dept: "CS", score: 94, earnings: "PKR 120K" },
  { name: "Team DataFlow", dept: "DS", score: 91, earnings: "PKR 85K" },
  { name: "Team Circuit", dept: "EE", score: 88, earnings: "PKR 95K" },
];

export default function InstitutionalFYPDashboardPage() {
  return (
    <>
      <Helmet>
        <title>FYP Intelligence | Institutional Dashboard</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">FYP Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">Institutional performance, funding analytics, and execution metrics.</p>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard title="Total Revenue" value="PKR 2.55M" icon={DollarSign} trend="up" trendValue="+24%" />
            <KPICard title="On-Time Delivery" value="78%" icon={Clock} trend="up" trendValue="+3%" />
            <KPICard title="Sponsor Repeat Rate" value="35%" icon={Repeat} trend="up" trendValue="+12%" />
            <KPICard title="Active FYPs" value="26" icon={Users} subtitle="across 4 departments" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Funding Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `${v / 1000}K`} />
                    <Tooltip 
                      contentStyle={{ 
                        background: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: "12px"
                      }} 
                      formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                      {riskDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: "12px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {riskDistribution.map((r) => (
                    <div key={r.name} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                      <span className="text-muted-foreground">{r.name}</span>
                      <span className="font-medium">{r.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Department Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Department Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2.5 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</th>
                        <th className="text-center py-2.5 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Funded</th>
                        <th className="text-center py-2.5 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">On-Time</th>
                        <th className="text-right py-2.5 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((d, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2.5 px-2 font-medium">{d.dept}</td>
                          <td className="py-2.5 px-2 text-center">{d.funded}</td>
                          <td className="py-2.5 px-2 text-center">
                            <span className={`font-medium ${d.onTime >= 80 ? "text-success" : d.onTime >= 70 ? "text-warning" : "text-critical"}`}>
                              {d.onTime}%
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-medium">{d.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Top Teams */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performing Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topTeams.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.dept}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-success">{t.earnings}</p>
                      <p className="text-xs text-muted-foreground">Score: {t.score}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
