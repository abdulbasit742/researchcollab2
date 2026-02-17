import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, BarChart3, TrendingUp, Users, DollarSign, Award } from "lucide-react";
import { useInstitutionResearchProductivity } from "@/hooks/useResearchExecution";

const gradeColors: Record<string, string> = {
  AAA: "bg-green-500/10 text-green-700 border-green-500/30",
  AA: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  A: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  BBB: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  BB: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  B: "bg-red-500/10 text-red-700 border-red-500/30",
};

const InstitutionResearchIntelligencePage = () => {
  const { data: entries = [], isLoading } = useInstitutionResearchProductivity();

  return (
    <>
      <Helmet><title>Institutional Research Intelligence | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Institutional Research Intelligence</h1>
              <p className="text-muted-foreground">Research productivity index — stronger than h-index</p>
            </div>
          </div>

          {isLoading ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Loading institutional data...</CardContent></Card>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No institutional research productivity data yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map((e) => (
                <Card key={e.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Institution {e.institution_id.slice(0, 8)}…
                      </CardTitle>
                      <Badge variant="outline" className={`text-lg font-bold ${gradeColors[e.grade || "B"] || ""}`}>
                        {e.grade}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Period: {e.period}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Research Executed</div>
                        <div className="text-xl font-bold">{Number(e.research_executed_pct || 0).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Revenue/Project</div>
                        <div className="text-xl font-bold">PKR {Number(e.revenue_per_project || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Award className="h-3 w-3" /> Funding Conversion</div>
                        <div className="text-xl font-bold">{Number(e.funding_conversion_rate || 0).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Student Participation</div>
                        <div className="text-xl font-bold">{Number(e.student_participation_rate || 0).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Deal Reliability</div>
                        <div className="text-xl font-bold">{Number(e.deal_completion_reliability || 0).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Capital Efficiency</div>
                        <div className="text-xl font-bold">{Number(e.capital_efficiency || 0).toFixed(1)}%</div>
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

export default InstitutionResearchIntelligencePage;
