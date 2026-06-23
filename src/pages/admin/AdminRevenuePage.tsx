import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, CreditCard, Users, Briefcase, Zap, Target, Clock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { Link } from "react-router-dom";

const REV_BY_PLAN = [
  { name: "Student Pro", value: 1245000, color: "hsl(var(--primary))" },
  { name: "Researcher Pro", value: 892000, color: "hsl(220 70% 50%)" },
  { name: "Supervisor", value: 540000, color: "hsl(160 60% 45%)" },
  { name: "Department", value: 1800000, color: "hsl(280 65% 60%)" },
  { name: "Enterprise", value: 750000, color: "hsl(30 80% 55%)" },
];

const REV_BY_STREAM = [
  { name: "Subscriptions", v: 2680000 },
  { name: "AI Credits", v: 412000 },
  { name: "Marketplace fees", v: 287000 },
  { name: "Department plans", v: 1800000 },
  { name: "Enterprise", v: 750000 },
  { name: "Escrow volume", v: 4250000 },
];

export default function AdminRevenuePage() {
  return (
    <>
      <Helmet><title>Revenue Dashboard — Admin</title></Helmet>
      <div className="container max-w-7xl mx-auto py-8 px-4 space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
            <p className="text-sm text-muted-foreground">Platform revenue, conversions, and pipeline — sample data</p>
          </div>
          <Badge variant="secondary">Demo data</Badge>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI icon={DollarSign} label="MRR" value="PKR 5.23M" sub="+12% MoM" tone="emerald" />
          <KPI icon={Zap} label="AI credit revenue" value="PKR 412K" sub="this month" />
          <KPI icon={Briefcase} label="Marketplace GMV" value="PKR 4.25M" sub="287K platform fees" />
          <KPI icon={Target} label="Department pipeline" value="PKR 18.4M" sub="14 active leads" tone="emerald" />
          <KPI icon={Users} label="Active paid users" value="2,847" sub="+184 this month" />
          <KPI icon={Clock} label="Trial users" value="412" sub="38% converting" />
          <KPI icon={CreditCard} label="Free → Paid" value="9.2%" sub="conversion rate" />
          <KPI icon={TrendingUp} label="Upgrade clicks" value="1,284" sub="last 30 days" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue by stream</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={REV_BY_STREAM}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} formatter={(v: number) => `PKR ${(v / 1000).toFixed(0)}K`} />
                  <Bar dataKey="v" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue by plan</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={REV_BY_PLAN} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e: any) => e.name}>
                    {REV_BY_PLAN.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `PKR ${(v / 1000).toFixed(0)}K`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><Link to="/admin/department-sales">Department Sales CRM</Link></Button>
            <Button variant="outline" asChild><Link to="/pricing">Pricing page</Link></Button>
            <Button variant="outline" asChild><Link to="/billing">My billing</Link></Button>
            <Button variant="outline" asChild><Link to="/earnings">Researcher earnings</Link></Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function KPI({ icon: Icon, label, value, sub, tone }: any) {
  const toneCls = tone === "emerald" ? "text-emerald-600" : "text-muted-foreground";
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className={`text-[11px] ${toneCls}`}>{sub}</span>
        </div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
