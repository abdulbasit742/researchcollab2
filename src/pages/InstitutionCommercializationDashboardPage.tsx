import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Building2, DollarSign, TrendingUp, Users, FileText, BarChart3, Target, Percent } from "lucide-react";
import { useCommercializationProfile, useInstitutionEarnings, useResearchRevenueStreams } from "@/hooks/useResearchCommercialization";
import { useExecutionTracks } from "@/hooks/useResearchExecution";

const InstitutionCommercializationDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profiles = [] } = useCommercializationProfile(id);
  const { data: earnings = [] } = useInstitutionEarnings(id);
  const { data: streams = [] } = useResearchRevenueStreams(id);
  const { data: tracks = [] } = useExecutionTracks();

  const profile = profiles[0];
  const totalEarnings = earnings.reduce((s, e) => s + Number(e.net_amount || 0), 0);
  const studentEarnings = earnings.reduce((s, e) => s + Number(e.student_payout || 0), 0);

  const stats = [
    { icon: FileText, label: "Research Uploaded", value: profile?.total_research_uploaded || 0, color: "text-primary" },
    { icon: Target, label: "Implementation Ready %", value: `${profile?.implementation_ready_count || 0}`, color: "text-green-600" },
    { icon: DollarSign, label: "Revenue Generated", value: `PKR ${(totalEarnings / 1000).toFixed(0)}K`, color: "text-amber-600" },
    { icon: Users, label: "Student Earnings", value: `PKR ${(studentEarnings / 1000).toFixed(0)}K`, color: "text-blue-600" },
    { icon: Percent, label: "Execution Completion", value: `${Number(profile?.execution_completion_rate || 0).toFixed(0)}%`, color: "text-purple-600" },
    { icon: TrendingUp, label: "Funding Conversion", value: `${Number(profile?.funding_conversion_rate || 0).toFixed(0)}%`, color: "text-emerald-600" },
  ];

  return (
    <>
      <Helmet><title>Commercialization Dashboard | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Commercialization Dashboard</h1>
              <p className="text-muted-foreground">Research-to-revenue pipeline performance</p>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {stats.map((s, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <s.icon className={`h-4 w-4 ${s.color} mb-1`} />
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="mb-8" />

          {/* Revenue Funnel */}
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Research → Funding → Revenue Funnel
          </h2>
          <Card className="mb-8">
            <CardContent className="py-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Research Uploaded</span>
                    <span className="font-medium">{profile?.total_research_uploaded || 0}</span>
                  </div>
                  <Progress value={100} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Implementation Ready</span>
                    <span className="font-medium">{profile?.implementation_ready_count || 0}</span>
                  </div>
                  <Progress value={profile?.total_research_uploaded ? (Number(profile.implementation_ready_count) / Number(profile.total_research_uploaded)) * 100 : 0} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Funded Research</span>
                    <span className="font-medium">{profile?.funded_research_count || 0}</span>
                  </div>
                  <Progress value={profile?.implementation_ready_count ? (Number(profile.funded_research_count) / Number(profile.implementation_ready_count)) * 100 : 0} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Earnings */}
          <h2 className="text-xl font-semibold mb-4">Recent Earnings</h2>
          {earnings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No earnings recorded yet. Execute research to generate revenue.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {earnings.slice(0, 15).map((e) => (
                <Card key={e.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline">{e.earning_type}</Badge>
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">Institution: PKR {Number(e.institution_payout).toLocaleString()}</span>
                        <span className="text-muted-foreground">Researcher: PKR {Number(e.researcher_payout).toLocaleString()}</span>
                        <span className="text-muted-foreground">Students: PKR {Number(e.student_payout).toLocaleString()}</span>
                        <span className="font-medium">Net: PKR {Number(e.net_amount).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InstitutionCommercializationDashboardPage;
