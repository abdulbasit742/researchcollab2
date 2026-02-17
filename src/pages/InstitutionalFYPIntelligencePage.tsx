import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Building2, GraduationCap, DollarSign, CheckCircle2, TrendingUp, Users, BarChart3, Target } from "lucide-react";
import { useFYPInstitutionStats } from "@/hooks/useFYP";
import { formatPKR } from "@/lib/currency";

const InstitutionalFYPIntelligencePage = () => {
  const { data: stats, isLoading } = useFYPInstitutionStats();

  const s = stats || {
    totalTopics: 0, sponsorReadyTopics: 0, sponsorFundedPct: 0,
    totalPledged: 0, totalFunded: 0, completedMilestones: 0,
    totalMilestones: 0, completionRate: 0, totalRevenue: 0,
  };

  return (
    <>
      <Helmet><title>FYP Intelligence | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Institutional FYP Intelligence</h1>
              <p className="text-muted-foreground">Productivity metrics, funding performance, and execution analytics</p>
            </div>
          </div>

          {isLoading ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Loading institutional data...</CardContent></Card>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-primary/20">
                  <CardContent className="pt-4">
                    <GraduationCap className="h-4 w-4 text-primary mb-1" />
                    <div className="text-3xl font-bold">{s.totalTopics}</div>
                    <div className="text-sm text-muted-foreground">Total FYP Projects</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <DollarSign className="h-4 w-4 text-amber-600 mb-1" />
                    <div className="text-3xl font-bold text-amber-600">{s.sponsorReadyTopics}</div>
                    <div className="text-sm text-muted-foreground">Sponsor-Ready</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <TrendingUp className="h-4 w-4 text-green-600 mb-1" />
                    <div className="text-3xl font-bold text-green-600">{formatPKR(s.totalPledged)}</div>
                    <div className="text-sm text-muted-foreground">Total Funding Pledged</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mb-1" />
                    <div className="text-3xl font-bold text-blue-600">{s.completionRate.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Milestone Completion</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Funding Pipeline</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Sponsor-Funded Rate</span>
                        <span className="font-medium">{s.sponsorFundedPct.toFixed(1)}%</span>
                      </div>
                      <Progress value={s.sponsorFundedPct} className="h-2" />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Pledged</span>
                        <div className="font-bold text-lg">{formatPKR(s.totalPledged)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Funded</span>
                        <div className="font-bold text-lg">{formatPKR(s.totalFunded)}</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Funding Conversion</span>
                        <span className="font-medium">{s.totalPledged > 0 ? ((s.totalFunded / s.totalPledged) * 100).toFixed(0) : 0}%</span>
                      </div>
                      <Progress value={s.totalPledged > 0 ? (s.totalFunded / s.totalPledged) * 100 : 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Execution Performance</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Milestones Completed</span>
                        <div className="font-bold text-lg text-green-600">{s.completedMilestones}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Milestones</span>
                        <div className="font-bold text-lg">{s.totalMilestones}</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Completion Rate</span>
                        <span className="font-medium">{s.completionRate.toFixed(0)}%</span>
                      </div>
                      <Progress value={s.completionRate} className="h-2" />
                    </div>
                    <Separator />
                    <div>
                      <span className="text-sm text-muted-foreground">Revenue Generated</span>
                      <div className="font-bold text-2xl text-primary">{formatPKR(s.totalRevenue)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Funnel */}
              <Card>
                <CardHeader><CardTitle>Research → Funding → Execution Funnel</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Total FYP Projects", value: s.totalTopics, pct: 100 },
                      { label: "Sponsor-Ready", value: s.sponsorReadyTopics, pct: s.totalTopics > 0 ? (s.sponsorReadyTopics / s.totalTopics) * 100 : 0 },
                      { label: "Funded", value: Math.round(s.sponsorFundedPct * s.totalTopics / 100), pct: s.sponsorFundedPct },
                      { label: "Milestones Completed", value: s.completedMilestones, pct: s.completionRate },
                    ].map((step, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{step.label}</span>
                          <span>{step.value} ({step.pct.toFixed(0)}%)</span>
                        </div>
                        <Progress value={step.pct} className="h-3" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default InstitutionalFYPIntelligencePage;
