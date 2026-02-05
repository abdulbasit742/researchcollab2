import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFairnessBiasEngine } from "@/hooks/useFairnessBiasEngine";
import { Scale, AlertTriangle, CheckCircle2, TrendingUp, Eye } from "lucide-react";

interface FairnessAuditCardProps {
  showDetails?: boolean;
}

export function FairnessAuditCard({ showDetails = true }: FairnessAuditCardProps) {
  const { 
    audits, 
    summary, 
    getBiasIndicators, 
    getFairnessFindings, 
    getRecommendations,
    getTransparencyReport 
  } = useFairnessBiasEngine();

  const report = getTransparencyReport("month");
  const findings = getFairnessFindings("warning");
  const recommendations = getRecommendations("high");
  const biasIndicators = getBiasIndicators();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-700";
      case "concern": return "bg-orange-500/20 text-orange-700";
      case "warning": return "bg-yellow-500/20 text-yellow-700";
      case "info": return "bg-blue-500/20 text-blue-700";
      default: return "bg-muted";
    }
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="h-4 w-4 text-primary" />
          Fairness & Bias Audit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall fairness score */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Fairness</span>
            <Badge variant={report.trendDirection === "improving" ? "default" : "secondary"}>
              {report.trendDirection}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">{report.overallFairnessScore}</span>
            <Progress value={report.overallFairnessScore} className="h-3 flex-1" />
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-muted/50">
            <p className="font-semibold">{report.auditsCompleted}</p>
            <p className="text-muted-foreground">Audits</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="font-semibold">{report.findingsAddressed}</p>
            <p className="text-muted-foreground">Addressed</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="font-semibold">{report.biasCorrections}</p>
            <p className="text-muted-foreground">Corrections</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <p className="font-semibold">{summary.criticalFindings}</p>
            <p className="text-muted-foreground">Critical</p>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Bias indicators */}
            {biasIndicators.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Monitored Disparities
                </p>
                <div className="space-y-2">
                  {biasIndicators.slice(0, 3).map((indicator, i) => (
                    <div key={i} className="p-2 rounded bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">
                          {indicator.dimension.replace(/_/g, " ")}
                        </span>
                        <span className={`text-xs ${getSignificanceColor(indicator.significance)}`}>
                          {indicator.significance} significance
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={indicator.observedDisparity * 100} 
                          className="h-1 flex-1" 
                        />
                        <span className="text-xs text-muted-foreground">
                          {(indicator.observedDisparity * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Findings */}
            {findings.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Active Findings
                </p>
                {findings.slice(0, 2).map((finding, i) => (
                  <div key={i} className={`p-2 rounded mb-2 ${getSeverityColor(finding.severity)}`}>
                    <p className="text-sm">{finding.finding}</p>
                    <p className="text-xs mt-1 opacity-80">{finding.suggestedAction}</p>
                  </div>
                ))}
              </div>
            )}

            {/* High-priority recommendations */}
            {recommendations.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Priority Actions
                </p>
                {recommendations.slice(0, 2).map((rec, i) => (
                  <div key={i} className="p-2 rounded border mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{rec.recommendation}</span>
                      <Badge variant="outline" className="text-xs">
                        {rec.implementationType.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.expectedImpact}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Highlights */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            Recent Improvements
          </p>
          <ul className="space-y-1">
            {report.highlights.slice(0, 2).map((h, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {h}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
