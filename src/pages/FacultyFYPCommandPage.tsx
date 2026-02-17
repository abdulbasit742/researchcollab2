import { Helmet } from "react-helmet-async";
import { KPICard } from "@/components/fyp/KPICard";
import { HealthBadge } from "@/components/fyp/HealthBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users, AlertTriangle, DollarSign, Clock, Target,
  CheckCircle, ChevronRight
} from "lucide-react";

const teams = [
  { name: "Team Alpha", milestone: "M3 — API Integration", progress: 72, sponsor: true, risk: "healthy" as const, contribution: "Balanced", status: "On Track" },
  { name: "Team Beta", milestone: "M1 — UX Prototype", progress: 28, sponsor: true, risk: "at-risk" as const, contribution: "Imbalanced", status: "Overdue" },
  { name: "Team Gamma", milestone: "M2 — Backend", progress: 55, sponsor: false, risk: "healthy" as const, contribution: "Balanced", status: "On Track" },
  { name: "Team Delta", milestone: "M1 — Research", progress: 10, sponsor: true, risk: "critical" as const, contribution: "No Activity", status: "No Activity" },
];

export default function FacultyFYPCommandPage() {
  return (
    <>
      <Helmet>
        <title>Faculty Command Center | FYP OS</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Faculty Command Center</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor all supervised FYP teams, risk levels, and sponsor engagement.</p>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <KPICard title="Active Teams" value="4" icon={Users} />
            <KPICard title="At-Risk" value="2" icon={AlertTriangle} trend="up" trendValue="+1" />
            <KPICard title="Funded Projects" value="3" icon={DollarSign} subtitle="PKR 290K total" />
            <KPICard title="On-Time %" value="67%" icon={Clock} trend="down" trendValue="-8%" />
            <KPICard title="Total Funding" value="PKR 290K" icon={Target} trend="up" trendValue="+85K" />
          </div>

          {/* Teams Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Team</th>
                      <th className="text-left py-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Milestone</th>
                      <th className="text-left py-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Progress</th>
                      <th className="text-left py-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Sponsor</th>
                      <th className="text-left py-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk</th>
                      <th className="text-left py-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Contribution</th>
                      <th className="text-right py-3 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t, i) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 font-medium">{t.name}</td>
                        <td className="py-3 px-3 text-muted-foreground">{t.milestone}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${t.progress}%` }} />
                            </div>
                            <span className="text-xs font-medium">{t.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={t.sponsor ? "default" : "outline"} className="text-xs">
                            {t.sponsor ? "Yes" : "No"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <HealthBadge level={t.risk} />
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-xs font-medium ${
                            t.contribution === "Balanced" ? "text-success" :
                            t.contribution === "Imbalanced" ? "text-warning" : "text-critical"
                          }`}>
                            {t.contribution}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            View <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {teams.map((t, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t.name}</span>
                      <HealthBadge level={t.risk} />
                    </div>
                    <p className="text-sm text-muted-foreground">{t.milestone}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={t.progress} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium">{t.progress}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Sponsor: {t.sponsor ? "Yes" : "No"}</span>
                      <span>Contribution: {t.contribution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
