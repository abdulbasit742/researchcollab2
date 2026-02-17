import { KPICard } from "@/components/fyp/KPICard";
import { HealthBadge } from "@/components/fyp/HealthBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Users, Building2, Shield, GraduationCap } from "lucide-react";
import { Helmet } from "react-helmet-async";

const metrics = {
  totalFunded: "124",
  studentsPaid: "847",
  fundingProcessed: "PKR 5.7M",
  completionRate: "88%",
  activeSponsors: "29",
  disputeResolution: "96%",
};

const universityPerformance = [
  { name: "LUMS", funding: 1800000, completion: 92, onTime: 88, students: 145 },
  { name: "NUST", funding: 1500000, completion: 90, onTime: 85, students: 120 },
  { name: "FAST-NU", funding: 900000, completion: 85, onTime: 82, students: 95 },
  { name: "IBA", funding: 750000, completion: 91, onTime: 89, students: 80 },
  { name: "COMSATS", funding: 600000, completion: 83, onTime: 78, students: 70 },
];

const sectorEngagement = [
  { sector: "Technology", projects: 42 },
  { sector: "Healthcare", projects: 25 },
  { sector: "FinTech", projects: 22 },
  { sector: "Energy", projects: 18 },
  { sector: "EdTech", projects: 17 },
];

export default function MinistryDashboardPage() {
  return (
    <>
      <Helmet>
        <title>National FYP Analytics | Ministry View</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <Badge variant="outline">Read-Only Analytics</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">National FYP Execution Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Aggregated metrics for education oversight and policy alignment</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard title="FYPs Funded" value={metrics.totalFunded} icon={GraduationCap} />
            <KPICard title="Students Paid" value={metrics.studentsPaid} icon={Users} />
            <KPICard title="Funding Volume" value={metrics.fundingProcessed} icon={DollarSign} />
            <KPICard title="Completion %" value={metrics.completionRate} icon={Shield} />
            <KPICard title="Sponsors" value={metrics.activeSponsors} icon={Building2} />
            <KPICard title="Dispute Resolved" value={metrics.disputeResolution} icon={Shield} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">University Performance Summary</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>University</TableHead>
                      <TableHead className="text-right">Funding</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>On-Time</TableHead>
                      <TableHead>Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {universityPerformance.map((u, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-right font-mono text-sm">PKR {(u.funding / 1000000).toFixed(1)}M</TableCell>
                        <TableCell><HealthBadge level={u.completion >= 90 ? "healthy" : u.completion >= 80 ? "at-risk" : "critical"} score={u.completion} /></TableCell>
                        <TableCell className="font-mono text-sm">{u.onTime}%</TableCell>
                        <TableCell>{u.students}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Industry-University Engagement</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sectorEngagement}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="sector" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="projects" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Projects" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
