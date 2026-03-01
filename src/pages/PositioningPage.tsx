import { usePlatformIdentity, useValueProofMetrics, useMarketDifferentiation } from "@/hooks/useStrategicPositioning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Shield, TrendingUp, Layers, Target } from "lucide-react";

function sc(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

export default function PositioningPage() {
  const { data: identity } = usePlatformIdentity();
  const { data: valueProof } = useValueProofMetrics();
  const { data: marketDiff } = useMarketDifferentiation();

  const diffPoints: string[] = Array.isArray(identity?.differentiation_points)
    ? identity.differentiation_points
    : [];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Crosshair className="h-6 w-6 text-primary" /> Strategic Positioning
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Category definition, value proof, and market differentiation</p>
      </div>

      {/* Category Definition */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Category Definition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {identity ? (
            <>
              <div>
                <Badge variant="default" className="text-xs mb-2">{identity.category_label}</Badge>
                <p className="text-sm text-foreground leading-relaxed">{identity.positioning_statement}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Value Proposition</p>
                <p className="text-sm text-foreground">{identity.value_proposition}</p>
              </div>
              {diffPoints.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Differentiation Points</p>
                  <div className="space-y-1">
                    {diffPoints.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">Last updated: {new Date(identity.updated_at).toLocaleDateString()}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No positioning config found.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Value Proof */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Value Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            {valueProof ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Completion Rate", value: valueProof.completion_rate_improvement, suffix: "%" },
                  { label: "Dispute Reduction", value: valueProof.dispute_reduction_rate, suffix: "%" },
                  { label: "Review Efficiency", value: valueProof.review_efficiency_gain, suffix: "%" },
                  { label: "Execution Velocity", value: valueProof.execution_velocity_increase, suffix: "%" },
                ].map((m) => (
                  <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                    <p className={`text-xl font-bold ${sc(m.value)}`}>+{m.value.toFixed(1)}{m.suffix}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No value proof data available.</p>
            )}
          </CardContent>
        </Card>

        {/* Market Differentiation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4" /> Market Differentiation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {marketDiff ? (
              <div className="space-y-2">
                {[
                  { label: "Execution Strength", value: marketDiff.execution_strength_score },
                  { label: "Governance Depth", value: marketDiff.governance_strength_score },
                  { label: "Predictive Intelligence", value: marketDiff.predictive_intelligence_score },
                  { label: "Accreditation Depth", value: marketDiff.accreditation_depth_score },
                  { label: "Federation Readiness", value: marketDiff.federation_readiness_score },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className={`font-bold ${sc(m.value)}`}>{m.value.toFixed(0)}/100</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No differentiation data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
