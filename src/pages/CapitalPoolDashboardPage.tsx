import { AdminLayout } from "@/components/admin/AdminLayout";
import { KPICard } from "@/components/fyp/KPICard";
import { HealthBadge } from "@/components/fyp/HealthBadge";
import { EscrowTimeline } from "@/components/fyp/EscrowTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, Users, Shield, Building2, ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";

const poolData = {
  name: "National Innovation Fund — Q1 2026",
  type: "hybrid",
  status: "active",
  totalCommitted: 5000000,
  totalAllocated: 3200000,
  available: 1800000,
  projects: 12,
  universities: 5,
  contributors: 4,
  completionRate: 85,
};

const allocations = [
  { fyp: "AI Health Monitor", university: "LUMS", amount: 250000, status: "funded", risk: 15, completion: 75 },
  { fyp: "Smart Campus IoT", university: "NUST", amount: 200000, status: "funded", risk: 22, completion: 60 },
  { fyp: "GreenEnergy Grid", university: "FAST-NU", amount: 180000, status: "completed", risk: 8, completion: 100 },
  { fyp: "FinTrack App", university: "IBA", amount: 150000, status: "pending", risk: 45, completion: 0 },
];

const contributors = [
  { name: "TechCorp Inc", type: "corporate", committed: 2000000, disbursed: 1400000, rights: "voting" },
  { name: "Innovation Fund PK", type: "government", committed: 1500000, disbursed: 900000, rights: "advisory" },
  { name: "EcoPower Ltd", type: "corporate", committed: 1000000, disbursed: 600000, rights: "passive" },
  { name: "Academic Trust", type: "institution", committed: 500000, disbursed: 300000, rights: "advisory" },
];

const sectorDist = [
  { name: "Technology", value: 40 },
  { name: "Healthcare", value: 25 },
  { name: "Energy", value: 20 },
  { name: "FinTech", value: 15 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--critical))"];

export default function CapitalPoolDashboardPage() {
  const { id } = useParams();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="capitalize">{poolData.type}</Badge>
              <Badge variant="default">{poolData.status}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{poolData.name}</h1>
          </div>
        </div>

        {/* Capital Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPICard title="Total Committed" value={`PKR ${(poolData.totalCommitted / 1000000).toFixed(1)}M`} icon={DollarSign} />
          <KPICard title="Allocated" value={`PKR ${(poolData.totalAllocated / 1000000).toFixed(1)}M`} icon={TrendingUp} />
          <KPICard title="Available" value={`PKR ${(poolData.available / 1000000).toFixed(1)}M`} icon={DollarSign} />
          <KPICard title="Projects Funded" value={String(poolData.projects)} icon={Building2} />
          <KPICard title="Completion Rate" value={`${poolData.completionRate}%`} icon={Shield} />
        </div>

        {/* Capital Utilization Bar */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Capital Utilization</span>
              <span className="font-mono font-medium">{((poolData.totalAllocated / poolData.totalCommitted) * 100).toFixed(0)}%</span>
            </div>
            <Progress value={(poolData.totalAllocated / poolData.totalCommitted) * 100} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>PKR {(poolData.totalAllocated / 1000000).toFixed(1)}M allocated</span>
              <span>PKR {(poolData.available / 1000000).toFixed(1)}M remaining</span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="allocations" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="allocations">
            <Card>
              <CardHeader><CardTitle className="text-base">FYP Allocations</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>FYP</TableHead>
                      <TableHead>University</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.map((a, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{a.fyp}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.university}</TableCell>
                        <TableCell className="text-right font-mono text-sm">PKR {(a.amount / 1000).toFixed(0)}K</TableCell>
                        <TableCell><Badge variant={a.status === "funded" ? "default" : a.status === "completed" ? "secondary" : "outline"} className="capitalize">{a.status}</Badge></TableCell>
                        <TableCell><HealthBadge level={a.risk <= 20 ? "healthy" : a.risk <= 50 ? "at-risk" : "critical"} score={a.risk} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={a.completion} className="h-1.5 w-16" />
                            <span className="text-xs text-muted-foreground">{a.completion}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contributors">
            <Card>
              <CardHeader><CardTitle className="text-base">Pool Contributors</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contributor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Committed</TableHead>
                      <TableHead className="text-right">Disbursed</TableHead>
                      <TableHead>Rights</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributors.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{c.type}</Badge></TableCell>
                        <TableCell className="text-right font-mono text-sm">PKR {(c.committed / 1000000).toFixed(1)}M</TableCell>
                        <TableCell className="text-right font-mono text-sm">PKR {(c.disbursed / 1000000).toFixed(1)}M</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{c.rights}</Badge></TableCell>
                        <TableCell>
                          <Progress value={(c.disbursed / c.committed) * 100} className="h-1.5 w-16" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid md:grid-cols-3 gap-4">
              <KPICard title="Milestone Success" value="88%" trend="up" trendValue="+3%" />
              <KPICard title="On-Time Delivery" value="82%" trend="up" trendValue="+5%" />
              <KPICard title="Students Paid" value="48" trend="up" trendValue="+12" />
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <Card>
              <CardHeader><CardTitle className="text-base">Sector Distribution</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={sectorDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                      {sectorDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
