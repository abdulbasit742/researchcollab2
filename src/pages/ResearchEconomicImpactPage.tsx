import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Globe, Building2, DollarSign, Award, FlaskConical } from "lucide-react";
import { useImplementationMetrics, useResearchAdoption } from "@/hooks/useResearchExecution";

const gradeColors: Record<string, string> = {
  AAA: "bg-green-500/10 text-green-700",
  AA: "bg-emerald-500/10 text-emerald-700",
  A: "bg-blue-500/10 text-blue-700",
  BBB: "bg-amber-500/10 text-amber-700",
  BB: "bg-orange-500/10 text-orange-700",
  B: "bg-red-500/10 text-red-700",
};

const ResearchEconomicImpactPage = () => {
  const { data: metrics = [], isLoading: metricsLoading } = useImplementationMetrics();
  const { data: adoptions = [] } = useResearchAdoption();

  const totalRevenue = metrics.reduce((s, m) => s + Number(m.revenue_generated || 0), 0);
  const totalAdoptions = metrics.reduce((s, m) => s + (m.institutional_adoptions || 0), 0);
  const avgIIS = metrics.length > 0 ? metrics.reduce((s, m) => s + Number(m.implementation_impact_score || 0), 0) / metrics.length : 0;

  return (
    <>
      <Helmet><title>Research Economic Impact | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Research Economic Impact</h1>
              <p className="text-muted-foreground">Who built with you? What did it produce?</p>
            </div>
          </div>

          {/* Headline stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4">
                <DollarSign className="h-4 w-4 text-green-600 mb-1" />
                <div className="text-3xl font-bold">PKR {(totalRevenue / 1e6).toFixed(1)}M</div>
                <div className="text-sm text-muted-foreground">Revenue Generated</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <Building2 className="h-4 w-4 text-blue-600 mb-1" />
                <div className="text-3xl font-bold">{totalAdoptions}</div>
                <div className="text-sm text-muted-foreground">Institutional Adoptions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <Award className="h-4 w-4 text-amber-600 mb-1" />
                <div className="text-3xl font-bold">{avgIIS.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg Impact Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <Globe className="h-4 w-4 text-purple-600 mb-1" />
                <div className="text-3xl font-bold">{adoptions.length}</div>
                <div className="text-sm text-muted-foreground">Adoption Events</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Impact Scores */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Implementation Impact Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <p className="text-muted-foreground text-center py-6">Loading metrics...</p>
              ) : metrics.length === 0 ? (
                <div className="text-center py-8">
                  <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No implementation metrics computed yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.slice(0, 10).map((m, i) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-muted-foreground w-6">#{i + 1}</span>
                        <div>
                          <div className="text-sm font-medium">Research {m.research_id.slice(0, 8)}…</div>
                          <div className="text-xs text-muted-foreground">
                            {m.funded_projects_count} funded • {m.milestones_completed} milestones • PKR {Number(m.revenue_generated || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Badge className="font-mono text-lg" variant="outline">
                        {Number(m.implementation_impact_score).toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adoption Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" /> Adoption Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              {adoptions.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No adoption events recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {adoptions.slice(0, 20).map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <span className="font-medium text-sm">{a.adopter_name || a.adopter_type}</span>
                        <span className="text-xs text-muted-foreground ml-2">{a.sector} • {a.region_code}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">PKR {Number(a.revenue_impact || 0).toLocaleString()}</div>
                        {a.time_to_market_days && (
                          <div className="text-xs text-muted-foreground">{a.time_to_market_days}d to market</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ResearchEconomicImpactPage;
