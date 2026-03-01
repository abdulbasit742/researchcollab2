import {
  useInstitutionStabilityPrediction, useStabilityHistory,
  useEngagementDropoutPredictions, usePredictionAccuracy,
} from "@/hooks/usePredictiveModeling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Users,
  Shield, Activity, BarChart3, Info,
} from "lucide-react";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const INST_ID = "00000000-0000-0000-0000-000000000001";

function riskColor(v: number) {
  if (v >= 75) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-destructive";
}

function riskBadge(v: number) {
  if (v >= 75) return "Low Risk";
  if (v >= 50) return "Moderate";
  return "High Risk";
}

function AdvisoryBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-[10px] gap-1 cursor-help">
            <Info className="h-2.5 w-2.5" /> Advisory Only
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">
          These are predictive insights derived from historical patterns. They do not trigger any automated actions, financial mutations, or state changes.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function PredictiveInsightsPage() {
  const { data: stability } = useInstitutionStabilityPrediction(INST_ID);
  const { data: history = [] } = useStabilityHistory(INST_ID);
  const { data: dropouts = [] } = useEngagementDropoutPredictions(INST_ID);
  const { data: accuracy = [] } = usePredictionAccuracy();

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Predictive Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Institutional forecasts, risk predictions, and trend analysis</p>
        </div>
        <AdvisoryBadge />
      </div>

      {/* Stability Forecast */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Institutional Stability Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stability ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${riskColor(stability.stability_score)}`}>
                    {stability.stability_score.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Stability Score</p>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {[
                    { label: "Completion Trend", value: stability.predicted_completion_trend, icon: TrendingUp },
                    { label: "Engagement Trend", value: stability.predicted_engagement_trend, icon: Activity },
                    { label: "Dispute Trend", value: stability.predicted_dispute_trend, icon: AlertTriangle },
                  ].map((m) => (
                    <div key={m.label} className="text-center p-3 rounded-lg bg-muted/30">
                      <m.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className={`text-lg font-bold ${riskColor(m.value >= 0 ? 75 : 25)}`}>
                        {m.value > 0 ? "+" : ""}{m.value.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Model: {stability.model_version}</span>
                <span>Confidence: {stability.confidence_score.toFixed(0)}%</span>
                <span>Updated: {new Date(stability.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No stability predictions available yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Engagement Drop-off Risks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Engagement Drop-off Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dropouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No dropout predictions.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {dropouts.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                    <div className="flex items-center gap-2">
                      {d.dropout_risk_probability >= 70 ? (
                        <TrendingDown className="h-3.5 w-3.5 text-destructive shrink-0" />
                      ) : (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span className="font-mono text-xs text-foreground">{d.user_id?.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${riskColor(100 - d.dropout_risk_probability)}`}>
                        {d.dropout_risk_probability.toFixed(0)}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">{d.inactivity_forecast_days}d forecast</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Accuracy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Model Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accuracy.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No accuracy data recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {accuracy.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30 text-sm">
                    <span className="text-foreground">{a.prediction_type}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${riskColor(a.accuracy_score ?? 0)}`}>
                        {(a.accuracy_score ?? 0).toFixed(0)}%
                      </span>
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

      {/* Stability History */}
      {history.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Stability Trend History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-2 rounded text-sm hover:bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge variant={h.stability_score >= 70 ? "default" : "secondary"} className="text-[10px]">
                      {riskBadge(h.stability_score)}
                    </Badge>
                    <span className={`font-bold ${riskColor(h.stability_score)}`}>{h.stability_score.toFixed(0)}%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
