import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Wallet, Clock, CheckCircle2, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";

const MONTHLY = [
  { m: "Jan", v: 12500 }, { m: "Feb", v: 18200 }, { m: "Mar", v: 23400 },
  { m: "Apr", v: 31000 }, { m: "May", v: 42500 }, { m: "Jun", v: 48700 },
];

const SERVICES = [
  { name: "Thesis statistical analysis (SPSS/R)", orders: 14, revenue: 56000 },
  { name: "Literature review writing assistance", orders: 11, revenue: 38500 },
  { name: "Viva preparation mock session", orders: 9, revenue: 22500 },
  { name: "Research methodology review", orders: 6, revenue: 18000 },
];

const PAYOUTS = [
  { id: "PAY-0421", date: "2026-06-15", amount: 41200, method: "JazzCash", status: "Released" },
  { id: "PAY-0388", date: "2026-05-15", amount: 35800, method: "Bank transfer", status: "Released" },
  { id: "PAY-0352", date: "2026-04-15", amount: 28100, method: "Bank transfer", status: "Released" },
];

export default function ResearcherEarningsPage() {
  return (
    <>
      <Helmet><title>Earnings — ResearchCollab</title></Helmet>
      <div className="container max-w-6xl mx-auto py-8 px-4 space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Earnings</h1>
            <p className="text-sm text-muted-foreground">Track your marketplace revenue and payouts</p>
          </div>
          <Badge variant="secondary">Demo mode</Badge>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI icon={Wallet} label="Total earnings" value="PKR 176,300" trend="+18%" tone="emerald" />
          <KPI icon={Clock} label="Pending escrow" value="PKR 23,400" trend="3 orders" />
          <KPI icon={CheckCircle2} label="Available payout" value="PKR 12,800" trend="ready" tone="emerald" />
          <KPI icon={Award} label="Platform fees" value="PKR 19,560" trend="10% rate" tone="muted" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Monthly earnings</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={MONTHLY}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Best-selling services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SERVICES.map((s, i) => (
                <div key={i} className="border-b last:border-0 pb-2 last:pb-0">
                  <div className="text-sm font-medium line-clamp-1">{s.name}</div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>{s.orders} orders</span>
                    <span className="font-mono">PKR {s.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Payout history</CardTitle>
            <Button size="sm" onClick={() => toast.success("Payout requested (demo)")}>Request payout</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {PAYOUTS.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium text-sm">{p.id}</div>
                    <div className="text-xs text-muted-foreground">{p.date} · {p.method}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">PKR {p.amount.toLocaleString()}</span>
                    <Badge variant="outline" className="text-emerald-600">{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="py-4 flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm">Want lower fees? Upgrade to <span className="font-semibold">Researcher Pro</span> for 10% commission.</div>
            <Button size="sm" asChild><Link to="/pricing">View plans</Link></Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function KPI({ icon: Icon, label, value, trend, tone }: any) {
  const toneCls = tone === "emerald" ? "text-emerald-600" : tone === "muted" ? "text-muted-foreground" : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className={`text-[11px] ${toneCls}`}>{trend}</span>
        </div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
