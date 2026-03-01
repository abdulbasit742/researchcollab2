import { useAllInstitutionEngagement } from "@/hooks/useInstitutionEngagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Briefcase, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default function InstitutionEngagementPage() {
  const { data: metrics = [], isLoading } = useAllInstitutionEngagement();

  return (
    <div className="min-h-screen bg-background p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Institutional Engagement
        </h1>
        <p className="text-sm text-muted-foreground">Monitor institutional health and adoption metrics</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading engagement data...</div>
      ) : metrics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No institutional engagement data available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {metrics.map((m) => {
            const health = m.completion_rate >= 70 ? "healthy" : m.completion_rate >= 40 ? "moderate" : "needs_attention";
            return (
              <Card key={m.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-sm text-foreground">{m.institution_id.slice(0, 8)}...</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        health === "healthy"
                          ? "border-emerald-500/30 text-emerald-600"
                          : health === "moderate"
                          ? "border-amber-500/30 text-amber-600"
                          : "border-destructive/30 text-destructive"
                      }
                    >
                      {health === "healthy" ? "Healthy" : health === "moderate" ? "Moderate" : "Needs Attention"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                      <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">{m.active_users_7d}</p>
                      <p className="text-[10px] text-muted-foreground">Active Users (7d)</p>
                    </div>
                    <div>
                      <Briefcase className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">{m.active_projects_7d}</p>
                      <p className="text-[10px] text-muted-foreground">Active Projects (7d)</p>
                    </div>
                    <div>
                      <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">{m.completion_rate}%</p>
                      <p className="text-[10px] text-muted-foreground">Completion Rate</p>
                    </div>
                    <div>
                      <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">{m.review_turnaround_avg}h</p>
                      <p className="text-[10px] text-muted-foreground">Avg Review Time</p>
                    </div>
                    <div>
                      <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">{(m.dispute_ratio * 100).toFixed(1)}%</p>
                      <p className="text-[10px] text-muted-foreground">Dispute Ratio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
