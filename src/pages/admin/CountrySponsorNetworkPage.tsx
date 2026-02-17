import { AdminLayout } from "@/components/admin/AdminLayout";
import { KPICard } from "@/components/fyp/KPICard";
import { HealthBadge } from "@/components/fyp/HealthBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Building2, DollarSign, Users, TrendingUp, MapPin, Globe } from "lucide-react";

const sponsors = [
  { name: "TechCorp Inc", universities: 4, totalFunding: 1200000, sector: "Technology", repeat: true, status: "active" },
  { name: "EcoPower Ltd", universities: 2, totalFunding: 450000, sector: "Energy", repeat: true, status: "active" },
  { name: "PaySoft", universities: 1, totalFunding: 180000, sector: "FinTech", repeat: false, status: "active" },
  { name: "HealthAI Co", universities: 3, totalFunding: 780000, sector: "Healthcare", repeat: true, status: "active" },
  { name: "EduTech Solutions", universities: 2, totalFunding: 320000, sector: "EdTech", repeat: false, status: "pending" },
];

const regionData = [
  { region: "Punjab", funding: 2800000, sponsors: 12, universities: 5 },
  { region: "Sindh", funding: 1400000, sponsors: 6, universities: 3 },
  { region: "KPK", funding: 600000, sponsors: 3, universities: 2 },
  { region: "Islamabad", funding: 900000, sponsors: 8, universities: 2 },
];

const sectorData = [
  { name: "Technology", value: 35 },
  { name: "Healthcare", value: 20 },
  { name: "FinTech", value: 18 },
  { name: "Energy", value: 15 },
  { name: "EdTech", value: 12 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--critical))", "hsl(var(--muted-foreground))"];

const fundingTrend = [
  { month: "Sep", funding: 800000 }, { month: "Oct", funding: 1200000 }, { month: "Nov", funding: 1500000 },
  { month: "Dec", funding: 1100000 }, { month: "Jan", funding: 1800000 }, { month: "Feb", funding: 2200000 },
];

export default function CountrySponsorNetworkPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">National Sponsor Network</h1>
          <p className="text-sm text-muted-foreground mt-1">Sponsor ecosystem density, distribution, and cross-university activity</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Active Sponsors" value="29" icon={Users} trend="up" trendValue="+5" />
          <KPICard title="Total Funding" value="PKR 5.7M" icon={DollarSign} trend="up" trendValue="+22%" />
          <KPICard title="Universities" value="12" icon={Building2} trend="up" trendValue="+2" />
          <KPICard title="Repeat Rate" value="62%" icon={TrendingUp} trend="up" trendValue="+8%" />
        </div>

        <Tabs defaultValue="sponsors" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="sponsors">Sponsor Directory</TabsTrigger>
            <TabsTrigger value="regions">Regional Clusters</TabsTrigger>
            <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
            <TabsTrigger value="trends">Funding Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="sponsors">
            <Card>
              <CardHeader><CardTitle className="text-base">Cross-University Sponsors</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sponsor</TableHead>
                      <TableHead>Universities</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead className="text-right">Total Funding</TableHead>
                      <TableHead>Repeat</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sponsors.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell><Badge variant="outline">{s.universities}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.sector}</TableCell>
                        <TableCell className="text-right font-mono text-sm">PKR {(s.totalFunding / 1000).toFixed(0)}K</TableCell>
                        <TableCell>{s.repeat ? <Badge variant="default" className="text-xs">Repeat</Badge> : <Badge variant="secondary" className="text-xs">New</Badge>}</TableCell>
                        <TableCell><HealthBadge level={s.status === "active" ? "healthy" : "at-risk"} showLabel /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Funding by Region</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={regionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="region" className="text-xs" />
                      <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
                      <Tooltip formatter={(v: number) => `PKR ${(v / 1000000).toFixed(2)}M`} />
                      <Bar dataKey="funding" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Regional Density</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Region</TableHead>
                        <TableHead>Sponsors</TableHead>
                        <TableHead>Universities</TableHead>
                        <TableHead className="text-right">Funding</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {regionData.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium flex items-center gap-1.5"><MapPin className="h-3 w-3 text-muted-foreground" />{r.region}</TableCell>
                          <TableCell>{r.sponsors}</TableCell>
                          <TableCell>{r.universities}</TableCell>
                          <TableCell className="text-right font-mono text-sm">PKR {(r.funding / 1000000).toFixed(1)}M</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sectors">
            <Card>
              <CardHeader><CardTitle className="text-base">Sector Distribution</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={sectorData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                      {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader><CardTitle className="text-base">National Funding Growth</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fundingTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
                    <Tooltip formatter={(v: number) => `PKR ${(v / 1000000).toFixed(2)}M`} />
                    <Line type="monotone" dataKey="funding" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
