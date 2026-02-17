import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGovernanceProposals, usePowerConcentration, useCrisisEvents, useAmendmentHistory } from "@/hooks/useGovernanceEconomy";
import { Shield, Eye, AlertTriangle, Scale, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const GovernanceTransparencyPage = () => {
  const { proposals } = useGovernanceProposals();
  const { data: power } = usePowerConcentration();
  const { data: crises } = useCrisisEvents();
  const { data: amendments } = useAmendmentHistory();

  const powerByType = (power || []).reduce((acc, p) => {
    acc[p.metric_type] = (acc[p.metric_type] || 0) + Number(p.concentration_score || 0);
    return acc;
  }, {} as Record<string, number>);
  const powerChart = Object.entries(powerByType).map(([type, score]) => ({ type: type.replace("_", " "), score: score / Math.max((power || []).filter(p => p.metric_type === type).length, 1) }));

  return (
    <MainLayout>
      <Helmet><title>Governance Transparency | RCollab</title></Helmet>
      <div className="container max-w-6xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Eye className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Governance Transparency</h1>
            <p className="text-muted-foreground">Public oversight of power, proposals, and constitutional compliance.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Proposals</p><p className="text-3xl font-bold">{proposals.length}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Breached Thresholds</p><p className="text-3xl font-bold text-destructive">{(power || []).filter(p => p.breached).length}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Crisis Events</p><p className="text-3xl font-bold">{(crises || []).length}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Amendments</p><p className="text-3xl font-bold">{(amendments || []).length}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Power Distribution</CardTitle></CardHeader>
          <CardContent>
            {powerChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={powerChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">No power concentration data yet</div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Recent Crises</CardTitle></CardHeader>
            <CardContent>
              {(crises || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No crisis events recorded.</p>
              ) : (
                <div className="space-y-2">
                  {(crises || []).slice(0, 8).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm capitalize">{c.crisis_type.replace(/_/g, " ")}</span>
                      </div>
                      <Badge variant={c.status === "active" ? "destructive" : "secondary"}>{c.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Amendment Timeline</CardTitle></CardHeader>
            <CardContent>
              {(amendments || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No amendments yet.</p>
              ) : (
                <div className="space-y-2">
                  {(amendments || []).slice(0, 8).map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{a.section_amended}</span>
                      <div className="flex gap-2">
                        {a.supermajority_achieved && <Badge variant="default">Supermajority</Badge>}
                        {a.ai_guardian_cleared && <Badge variant="secondary">AI Cleared</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default GovernanceTransparencyPage;
