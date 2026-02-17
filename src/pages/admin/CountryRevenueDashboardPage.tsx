import { AdminLayout } from "@/components/admin/AdminLayout";
import { KPICard } from "@/components/fyp/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { DollarSign, TrendingUp, Building2, Users, Download } from "lucide-react";

const revenueData = [
  { month: "Sep", gmv: 1200000, commission: 120000, escrow: 24000 },
  { month: "Oct", gmv: 1500000, commission: 150000, escrow: 30000 },
  { month: "Nov", gmv: 1800000, commission: 180000, escrow: 36000 },
  { month: "Dec", gmv: 1400000, commission: 140000, escrow: 28000 },
  { month: "Jan", gmv: 2100000, commission: 210000, escrow: 42000 },
  { month: "Feb", gmv: 2500000, commission: 250000, escrow: 50000 },
];

const universityRevenue = [
  { name: "LUMS", gmv: 1800000, commission: 180000, projects: 12, sponsors: 5 },
  { name: "NUST", gmv: 1500000, commission: 150000, projects: 10, sponsors: 4 },
  { name: "FAST-NU", gmv: 900000, commission: 90000, projects: 8, sponsors: 3 },
  { name: "IBA Karachi", gmv: 750000, commission: 75000, projects: 6, sponsors: 3 },
  { name: "COMSATS", gmv: 600000, commission: 60000, projects: 5, sponsors: 2 },
];

export default function CountryRevenueDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">National Revenue Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Country-level financial performance and growth metrics</p>
          </div>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1.5" />Export Report</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPICard title="Monthly GMV" value="PKR 2.5M" icon={DollarSign} trend="up" trendValue="+19%" />
          <KPICard title="Commission" value="PKR 250K" icon={TrendingUp} trend="up" trendValue="+19%" />
          <KPICard title="Escrow Fees" value="PKR 50K" icon={DollarSign} trend="up" trendValue="+19%" />
          <KPICard title="Universities" value="12" icon={Building2} trend="up" trendValue="+2" />
          <KPICard title="Active Sponsors" value="29" icon={Users} trend="up" trendValue="+5" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue Growth Curve</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
                  <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="gmv" stroke="hsl(var(--primary))" strokeWidth={2} name="GMV" />
                  <Line type="monotone" dataKey="commission" stroke="hsl(var(--success))" strokeWidth={2} name="Commission" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">GMV by Month</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
                  <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                  <Bar dataKey="gmv" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="GMV" />
                  <Bar dataKey="escrow" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Escrow Fees" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by University</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>University</TableHead>
                  <TableHead className="text-right">GMV</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Sponsors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {universityRevenue.map((u, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-right font-mono text-sm">PKR {(u.gmv / 1000000).toFixed(2)}M</TableCell>
                    <TableCell className="text-right font-mono text-sm">PKR {(u.commission / 1000).toFixed(0)}K</TableCell>
                    <TableCell><Badge variant="outline">{u.projects}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{u.sponsors}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
