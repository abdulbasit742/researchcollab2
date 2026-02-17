import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Building2, Globe, BarChart3 } from "lucide-react";
import { useExecutionProductivityRankings } from "@/hooks/useResearchCommercialization";

const gradeColors: Record<string, string> = {
  AAA: "bg-green-500/10 text-green-700 border-green-500/30",
  AA: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  A: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  B: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  C: "bg-orange-500/10 text-orange-700 border-orange-500/30",
};

const ExecutionProductivityRankingsPage = () => {
  const { data: rankings = [], isLoading } = useExecutionProductivityRankings();

  return (
    <>
      <Helmet><title>Execution Productivity Rankings | RCollab</title></Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Execution Productivity Rankings</h1>
              <p className="text-muted-foreground">Research-to-revenue performance — the alternative to citation rankings</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-8">EPR measures what matters: implementation, revenue, and economic impact — not just who cited whom.</p>

          {isLoading ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Loading rankings...</CardContent></Card>
          ) : rankings.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Rankings Coming Soon</h3>
                <p className="text-muted-foreground">Institutions must complete research execution tracks to appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rankings.map((r, idx) => (
                <Card key={r.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">#{r.epr_rank || idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold truncate">{r.institution_name}</h3>
                          <Badge variant="outline" className={gradeColors[r.epr_grade] || ""}>{r.epr_grade}</Badge>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs text-muted-foreground">
                          <div><span className="block font-medium text-foreground">{Number(r.research_to_revenue_pct).toFixed(1)}%</span>R→Revenue</div>
                          <div><span className="block font-medium text-foreground">{Number(r.student_implementation_rate).toFixed(1)}%</span>Student Rate</div>
                          <div><span className="block font-medium text-foreground">{Number(r.deal_completion_reliability).toFixed(1)}%</span>Completion</div>
                          <div><span className="block font-medium text-foreground">{Number(r.capital_deployment_efficiency).toFixed(1)}%</span>Capital Eff.</div>
                          <div><span className="block font-medium text-foreground">{r.industry_adoption_count}</span>Industry</div>
                          <div><span className="block font-medium text-foreground">{r.cross_border_execution}</span>Cross-border</div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-primary">{Number(r.epr_score).toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">EPR Score</div>
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

export default ExecutionProductivityRankingsPage;
