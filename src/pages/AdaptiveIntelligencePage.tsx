import {
  useExecutionPatterns, useAdaptiveRiskModel, useOptimizationSuggestions,
  usePerformanceDrift, useModelAccuracy, useLearningTrend, useEngagementAdaptiveModel,
} from "@/hooks/useAdaptiveIntelligence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Activity, Target,
  Lightbulb, BarChart3, Info, CheckCircle2, Minus, Shield,
} from "lucide-react";

const INST_ID = "00000000-0000-0000-0000-000000000001";

function confidenceBadge(score: number) {
  if (score >= 80) return <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600">{score.toFixed(0)}% confidence</Badge>;
  if (score >= 50) return <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600">{score.toFixed(0)}% confidence</Badge>;
  return <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive">{score.toFixed(0)}% confidence</Badge>;
}

function driftIcon(direction: string) {
  if (direction === "improving") return <TrendingUp className="h-4 w-4 text-emerald-600" />;
  if (direction === "declining") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function trendColor(value: number) {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-destructive";
  return "text-muted-foreground";
}

function AdvisoryDisclaimer() {
  return (
    <div className="rounded-lg bg-muted/30 p-3 flex items-start gap-2">
      <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <p className="text-[11px] text-muted-foreground">
        All insights are advisory projections derived from historical patterns. No adaptive logic modifies escrow, approvals, or state machines. All outputs are tenant-scoped and logged.
      </p>
    </div>
  );
}

function TransparencyMeta({ confidence, sampleSize, updatedAt }: { confidence: number; sampleSize?: number; updatedAt?: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {confidenceBadge(confidence)}
      {sampleSize != null && <span className="text-[9px] text-muted-foreground">n={sampleSize}</span>}
      {updatedAt && <span className="text-[9px] text-muted-foreground">{new Date(updatedAt).toLocaleDateString()}</span>}
    </div>
  );
}

export default function AdaptiveIntelligencePage() {
  const { data: patterns = [] } = useExecutionPatterns(INST_ID);
  const { data: riskModel } = useAdaptiveRiskModel(INST_ID);
  const { data: suggestions = [] } = useOptimizationSuggestions(INST_ID);
  const { data: drifts = [] } = usePerformanceDrift(INST_ID);
  const { data: accuracies = [] } = useModelAccuracy(INST_ID);
  const { data: learning } = useLearningTrend(INST_ID);
  const { data: engageModel } = useEngagementAdaptiveModel(INST_ID);

  const significantDrifts = drifts.filter((d) => Math.abs(d.drift_percentage) > 5);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Adaptive Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Self-learning pattern analysis and advisory insights</p>
      </div>

      <AdvisoryDisclaimer />

      {/* Learning Summary + Risk Model */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Institutional Learning */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Platform Learning Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {learning ? (
              <div className="space-y-3">
                {[
                  { label: "Improvement Trend", value: learning.improvement_trend },
                  { label: "Stability Trend", value: learning.stability_trend },
                  { label: "Governance Trend", value: learning.governance_trend },
                  { label: "Engagement Trend", value: learning.engagement_trend },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.label}</span>
                    <span className={`text-sm font-semibold ${trendColor(t.value)}`}>
                      {t.value > 0 ? "+" : ""}{t.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
                <Separator />
                <p className="text-[10px] text-muted-foreground">
                  Generated: {new Date(learning.generated_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No learning data available yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Adaptive Risk Model */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Adaptive Risk Model
              </CardTitle>
              {riskModel && (
                <Badge variant="secondary" className="text-[9px]">v{riskModel.risk_model_version}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {riskModel ? (
              <div className="space-y-3">
                {[
                  { label: "Delay Weight", value: riskModel.delay_weight },
                  { label: "Activity Weight", value: riskModel.activity_weight },
                  { label: "Review Weight", value: riskModel.review_weight },
                  { label: "Dispute Weight", value: riskModel.dispute_weight },
                ].map((w) => (
                  <div key={w.label}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-muted-foreground">{w.label}</span>
                      <span className="font-medium text-foreground">{(w.value * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={w.value * 100} className="h-1" />
                  </div>
                ))}
                <Separator />
                <TransparencyMeta confidence={riskModel.confidence_score} updatedAt={riskModel.generated_at} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No risk model trained yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Execution Patterns */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Execution History Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patterns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No patterns detected yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {patterns.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{p.pattern_type.replace(/_/g, " ")}</p>
                    <TransparencyMeta confidence={p.confidence_score} sampleSize={p.sample_size} updatedAt={p.generated_at} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {JSON.stringify(p.pattern_data).slice(0, 120)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Suggestions + Drift */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Suggestions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Optimization Suggestions
              <Badge variant="secondary" className="text-[9px]">Advisory</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No suggestions generated yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {suggestions.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-1">
                      <Badge variant="outline" className="text-[9px]">{s.suggestion_type.replace(/_/g, " ")}</Badge>
                      {confidenceBadge(s.confidence_score)}
                    </div>
                    <p className="text-sm text-foreground mt-1">{s.suggestion_reason}</p>
                    {s.impact_estimate && (
                      <p className="text-[10px] text-muted-foreground mt-1">Impact: {s.impact_estimate}</p>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-[9px] text-primary cursor-help mt-1 inline-block">Why am I seeing this?</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          This suggestion is derived from historical execution patterns within your institution.
                          Confidence: {s.confidence_score.toFixed(0)}%. Generated: {new Date(s.generated_at).toLocaleDateString()}.
                          Advisory only — no automated actions taken.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Drift */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Drift Detection
              {significantDrifts.length > 0 && (
                <Badge variant="destructive" className="text-[9px]">{significantDrifts.length} drifts</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drifts.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No significant drift detected.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {drifts.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
                    {driftIcon(d.drift_direction)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{d.entity_type}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {d.baseline_score.toFixed(1)} → {d.current_score.toFixed(1)}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${trendColor(d.drift_direction === "improving" ? 1 : d.drift_direction === "declining" ? -1 : 0)}`}>
                      {d.drift_percentage > 0 ? "+" : ""}{d.drift_percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Model + Model Accuracy */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Engagement Adaptive Model */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Engagement Adaptive Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            {engageModel ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-foreground">{engageModel.retention_risk_score.toFixed(0)}%</p>
                    <p className="text-[10px] text-muted-foreground">Retention Risk</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xl font-bold text-foreground">{engageModel.predicted_dropoff_rate.toFixed(1)}%</p>
                    <p className="text-[10px] text-muted-foreground">Predicted Dropoff</p>
                  </div>
                </div>
                <Separator />
                <p className="text-[10px] text-muted-foreground">
                  Weights: {JSON.stringify(engageModel.engagement_factor_weights).slice(0, 80)}...
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Generated: {new Date(engageModel.generated_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No engagement model trained yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Model Accuracy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Model Accuracy Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accuracies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No accuracy evaluations yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {accuracies.slice(0, 10).map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded border border-border text-sm">
                    <div>
                      <span className="font-medium text-foreground">{a.model_type.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.accuracy_score != null && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${a.accuracy_score >= 80 ? "border-emerald-500/30 text-emerald-600" : a.accuracy_score >= 50 ? "border-amber-500/30 text-amber-600" : "border-destructive/30 text-destructive"}`}
                        >
                          {a.accuracy_score.toFixed(0)}% accurate
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(a.evaluated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
