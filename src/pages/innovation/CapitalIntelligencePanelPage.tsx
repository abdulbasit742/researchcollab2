import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, TrendingUp, Shield, Rocket } from "lucide-react";
import { getCapitalIntelligenceScores } from "@/lib/innovation/capitalIntelligenceEngine";

export default function CapitalIntelligencePanelPage() {
  const { data: scores = [], isLoading } = useQuery({
    queryKey: ["capital-intelligence"],
    queryFn: () => getCapitalIntelligenceScores(),
  });

  const tierBadge = (tier: string) => {
    const colors: Record<string, string> = { platinum: "bg-purple-100 text-purple-800", gold: "bg-yellow-100 text-yellow-800", standard: "bg-muted text-muted-foreground" };
    return colors[tier] || colors.standard;
  };

  const recIcon = (type: string) => {
    if (type === "strong_fund") return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (type === "caution") return <Shield className="h-4 w-4 text-yellow-600" />;
    return <Rocket className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BrainCircuit className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Capital Intelligence Panel</h1>
          <p className="text-sm text-muted-foreground">Advisory AI — Predictive funding analytics (read-only)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Analyzed Projects</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{scores.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Success Probability</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{scores.length ? Math.round(scores.reduce((s: number, c: any) => s + Number(c.success_probability || 0), 0) / scores.length) : 0}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Strong Fund Recommendations</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{scores.filter((s: any) => s.recommendation_type === "strong_fund").length}</p></CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Computing intelligence…</div>
      ) : (
        <div className="space-y-3">
          {scores.map((s: any) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {recIcon(s.recommendation_type)}
                    <span className="font-medium text-sm">Project {s.project_id?.slice(0, 8)}…</span>
                  </div>
                  <Badge className={tierBadge(s.team_trust_tier)}>{s.team_trust_tier}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Success Probability</p>
                    <Progress value={Number(s.success_probability)} className="h-1.5" />
                    <p className="text-xs font-medium mt-1">{Number(s.success_probability)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Execution Reliability</p>
                    <Progress value={Number(s.execution_reliability)} className="h-1.5" />
                    <p className="text-xs font-medium mt-1">{Number(s.execution_reliability)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Commercialization</p>
                    <Progress value={Number(s.commercialization_likelihood)} className="h-1.5" />
                    <p className="text-xs font-medium mt-1">{Number(s.commercialization_likelihood)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {scores.length === 0 && <div className="text-center py-12 text-muted-foreground">No intelligence scores computed yet.</div>}
        </div>
      )}
    </div>
  );
}
