import { KPICard } from "@/components/fyp/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, Users, Building2, GraduationCap, Shield, TrendingUp } from "lucide-react";
import { Helmet } from "react-helmet-async";

const stats = {
  totalFunding: "PKR 5.7M",
  studentsPaid: "847",
  activeSponsors: "29",
  completedProjects: "124",
};

const sectorFunding = [
  { sector: "Technology", amount: 2000000 },
  { sector: "Healthcare", amount: 1100000 },
  { sector: "FinTech", amount: 1000000 },
  { sector: "Energy", amount: 850000 },
  { sector: "EdTech", amount: 750000 },
];

const topProjects = [
  { title: "AI Health Monitor", university: "LUMS", funding: 250000, students: 4, status: "completed" },
  { title: "Smart Campus IoT", university: "NUST", funding: 200000, students: 3, status: "active" },
  { title: "GreenEnergy Grid", university: "FAST-NU", funding: 180000, students: 4, status: "completed" },
];

const caseStudies = [
  {
    title: "How TechCorp Funded 8 FYPs Across 3 Universities",
    summary: "TechCorp's structured innovation pipeline generated 3 deployable products and hired 5 students full-time.",
    impact: "PKR 1.2M deployed, 92% completion rate",
  },
  {
    title: "NUST's AI Research Pipeline — From FYP to Patent",
    summary: "A faculty-sponsored FYP in computer vision led to a joint patent filing and industry licensing deal.",
    impact: "PKR 500K funding, 1 patent filed",
  },
];

export default function CountryImpactPage() {
  return (
    <>
      <Helmet>
        <title>National FYP Impact | Pakistan</title>
        <meta name="description" content="Transparent view of national FYP funding, student earnings, and innovation output." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
            <Badge variant="outline" className="mb-4"><Shield className="h-3 w-3 mr-1" />Verified Impact Data</Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">National Innovation Impact</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Transparent, auditable data on how structured FYP funding is transforming student execution and industry collaboration across Pakistan.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Total Funding" value={stats.totalFunding} icon={DollarSign} />
            <KPICard title="Students Paid" value={stats.studentsPaid} icon={GraduationCap} />
            <KPICard title="Active Sponsors" value={stats.activeSponsors} icon={Building2} />
            <KPICard title="Completed FYPs" value={stats.completedProjects} icon={TrendingUp} />
          </div>

          {/* Funding by Sector */}
          <Card>
            <CardHeader><CardTitle className="text-base">Funding by Sector</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sectorFunding} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
                  <YAxis dataKey="sector" type="category" className="text-xs" width={80} />
                  <Tooltip formatter={(v: number) => `PKR ${v.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Projects */}
          <Card>
            <CardHeader><CardTitle className="text-base">Top Funded Projects</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead className="text-right">Funding</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProjects.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.university}</TableCell>
                      <TableCell className="text-right font-mono text-sm">PKR {(p.funding / 1000).toFixed(0)}K</TableCell>
                      <TableCell><Badge variant="outline">{p.students} members</Badge></TableCell>
                      <TableCell><Badge variant={p.status === "completed" ? "default" : "secondary"} className="capitalize">{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Case Studies */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Case Studies</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {caseStudies.map((cs, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 space-y-2">
                    <h3 className="font-medium text-sm">{cs.title}</h3>
                    <p className="text-xs text-muted-foreground">{cs.summary}</p>
                    <Badge variant="outline" className="text-xs">{cs.impact}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
