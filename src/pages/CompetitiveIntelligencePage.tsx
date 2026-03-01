import { useCompetitiveMatrix } from "@/hooks/useStrategicPositioning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, Shield } from "lucide-react";

function sc(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

const RCOLLAB_SCORES = {
  execution_depth_score: 95,
  governance_score: 92,
  capital_integration_score: 90,
  compliance_score: 88,
  orchestration_score: 85,
};

const DIMENSIONS = [
  { key: "execution_depth_score", label: "Execution Depth" },
  { key: "governance_score", label: "Governance" },
  { key: "capital_integration_score", label: "Capital Integration" },
  { key: "compliance_score", label: "Compliance" },
  { key: "orchestration_score", label: "Orchestration" },
] as const;

export default function CompetitiveIntelligencePage() {
  const { data: competitors = [] } = useCompetitiveMatrix();

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Swords className="h-6 w-6 text-primary" /> Competitive Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Internal strategic comparison — how RCollab exceeds market alternatives</p>
      </div>

      {/* RCollab Baseline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> RCollab — Institutional Execution Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {DIMENSIONS.map((d) => (
              <div key={d.key} className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xl font-bold text-primary">{RCOLLAB_SCORES[d.key]}</p>
                <p className="text-[10px] text-muted-foreground">{d.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitors */}
      {competitors.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground text-center">No competitor entries configured. Add competitors to the positioning matrix to see comparison.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {competitors.map((c: any) => {
            const avg = DIMENSIONS.reduce((s, d) => s + (c[d.key] ?? 0), 0) / DIMENSIONS.length;
            const rcollabAvg = DIMENSIONS.reduce((s, d) => s + RCOLLAB_SCORES[d.key], 0) / DIMENSIONS.length;
            const gap = rcollabAvg - avg;
            return (
              <Card key={c.id}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{c.competitor_name}</span>
                      <Badge variant="secondary" className="text-[10px]">{c.competitor_category}</Badge>
                    </div>
                    <span className="text-xs text-emerald-600 font-medium">RCollab leads by +{gap.toFixed(0)} pts avg</span>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {DIMENSIONS.map((d) => {
                      const val = c[d.key] ?? 0;
                      const diff = RCOLLAB_SCORES[d.key] - val;
                      return (
                        <div key={d.key} className="text-center p-2 rounded bg-muted/30">
                          <p className={`text-sm font-bold ${sc(val)}`}>{val.toFixed(0)}</p>
                          <p className="text-[10px] text-emerald-600">+{diff.toFixed(0)}</p>
                          <p className="text-[9px] text-muted-foreground">{d.label}</p>
                        </div>
                      );
                    })}
                  </div>
                  {c.differentiation_summary && (
                    <p className="text-xs text-muted-foreground mt-2">{c.differentiation_summary}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
