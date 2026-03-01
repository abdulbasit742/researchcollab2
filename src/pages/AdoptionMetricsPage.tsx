import { useAdoptionMetrics, useExpansionHealth, useGrowthForecast } from "@/hooks/useInstitutionalExpansion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, Activity, Target, BarChart3 } from "lucide-react";

const INST_ID = "00000000-0000-0000-0000-000000000001";

function healthColor(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

function trafficLight(v: number) {
  if (v >= 75) return "🟢";
  if (v >= 50) return "🟡";
  return "🔴";
}

export default function AdoptionMetricsPage() {
  const { data: metrics = [] } = useAdoptionMetrics(INST_ID);
  const { data: health } = useExpansionHealth(INST_ID);
  const { data: forecast } = useGrowthForecast(INST_ID);
  const latest = metrics[0] as any | undefined;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Adoption & Expansion
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Institutional adoption metrics, expansion health, and growth forecast</p>
      </div>

      {/* Expansion Health */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{trafficLight(health?.overall_expansion_score ?? 0)}</span>
            <div>
              <p className={`text-3xl font-bold ${healthColor(health?.overall_expansion_score ?? 0)}`}>
                {(health?.overall_expansion_score ?? 0).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Overall Expansion Score</p>
            </div>
          </div>
          {health && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Adoption", value: health.adoption_score },
                { label: "Engagement", value: health.engagement_score },
                { label: "Execution", value: health.execution_score },
                { label: "Governance", value: health.governance_score },
              ].map((m) => (
                <div key={m.label} className="text-center">
                  <p className={`text-lg font-bold ${healthColor(m.value)}`}>{m.value.toFixed(0)}</p>
                  <Progress value={m.value} className="h-1.5 mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Adoption Snapshot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Adoption Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latest ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Active Users (7d)", value: latest.active_users_7d },
                  { label: "Active Projects (7d)", value: latest.active_projects_7d },
                  { label: "Milestone Rate", value: `${(latest.milestone_creation_rate ?? 0).toFixed(0)}%` },
                  { label: "Review Completion", value: `${(latest.review_completion_rate ?? 0).toFixed(0)}%` },
                ].map((m) => (
                  <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-foreground">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No adoption data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Growth Forecast */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Growth Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {forecast ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-foreground">{forecast.predicted_active_users_30d}</p>
                    <p className="text-[10px] text-muted-foreground">Predicted Users (30d)</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-foreground">{(forecast.predicted_project_growth ?? 0).toFixed(0)}%</p>
                    <p className="text-[10px] text-muted-foreground">Project Growth</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Confidence: {(forecast.confidence_score ?? 0).toFixed(0)}%</span>
                  <Badge variant="outline" className="text-[10px]">Advisory Only</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No forecast available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Adoption History */}
      {metrics.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Adoption History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {metrics.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded text-sm hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{m.active_users_7d} users · {m.active_projects_7d} projects</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(m.generated_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
