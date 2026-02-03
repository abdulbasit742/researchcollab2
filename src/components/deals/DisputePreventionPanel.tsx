import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDisputePrevention, DisputeRiskAssessment } from "@/hooks/useDisputePrevention";
import { AlertTriangle, Shield, MessageSquare, Clock, TrendingDown, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface DisputePreventionPanelProps {
  dealId?: string;
}

export function DisputePreventionPanel({ dealId }: DisputePreventionPanelProps) {
  const { 
    assessments, 
    currentAssessment, 
    highRiskDeals,
    totalActiveIndicators,
    loading,
    getRiskColor,
    implementRecommendation 
  } = useDisputePrevention(dealId);

  const displayAssessments = dealId ? (currentAssessment ? [currentAssessment] : []) : assessments;

  const getRiskBgColor = (level: DisputeRiskAssessment["riskLevel"]) => {
    switch (level) {
      case "low": return "bg-green-500/10 border-green-500/30";
      case "moderate": return "bg-yellow-500/10 border-yellow-500/30";
      case "elevated": return "bg-orange-500/10 border-orange-500/30";
      case "high": return "bg-red-500/10 border-red-500/30";
      case "critical": return "bg-red-600/20 border-red-600/50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Dispute Prevention AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{assessments.length}</p>
              <p className="text-xs text-muted-foreground">Active Deals</p>
            </div>
            <div className={`p-3 rounded-lg ${highRiskDeals.length > 0 ? "bg-orange-500/10" : "bg-green-500/10"}`}>
              <p className={`text-2xl font-bold ${highRiskDeals.length > 0 ? "text-orange-600" : "text-green-600"}`}>
                {highRiskDeals.length}
              </p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{totalActiveIndicators}</p>
              <p className="text-xs text-muted-foreground">Active Warnings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Assessments */}
      {displayAssessments.map((assessment) => (
        <motion.div
          key={assessment.dealId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`border ${getRiskBgColor(assessment.riskLevel)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{assessment.dealTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Last assessed: {assessment.lastAssessedAt.toLocaleTimeString()}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getRiskColor(assessment.riskLevel)} border-current`}
                >
                  {assessment.riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Risk Score */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Dispute Risk Score</span>
                  <span className={getRiskColor(assessment.riskLevel)}>
                    {assessment.overallRiskScore}/100
                  </span>
                </div>
                <Progress 
                  value={assessment.overallRiskScore} 
                  className="h-3"
                />
              </div>

              {/* Communication Analysis */}
              <div className="p-3 rounded-lg bg-background/50 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Communication Analysis
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className={assessment.communicationAnalysis.averageResponseTime > 24 ? "text-orange-500" : ""}>
                      {assessment.communicationAnalysis.averageResponseTime}h avg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clarity Score</span>
                    <span>{assessment.communicationAnalysis.clarityScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sentiment</span>
                    <span className={assessment.communicationAnalysis.sentimentScore < 0.5 ? "text-orange-500" : "text-green-500"}>
                      {assessment.communicationAnalysis.sentimentScore > 0.7 ? "Positive" : 
                       assessment.communicationAnalysis.sentimentScore > 0.4 ? "Neutral" : "Concerning"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trend</span>
                    <span className={assessment.communicationAnalysis.responseTimetrend === "declining" ? "text-red-500" : ""}>
                      {assessment.communicationAnalysis.responseTimetrend}
                    </span>
                  </div>
                </div>
                {assessment.communicationAnalysis.redFlags.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Red Flags Detected:</p>
                    <div className="flex flex-wrap gap-1">
                      {assessment.communicationAnalysis.redFlags.map((flag, idx) => (
                        <Badge key={idx} variant="destructive" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Indicators */}
              {assessment.indicators.filter(i => !i.isResolved).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Active Warning Indicators
                  </p>
                  <div className="space-y-2">
                    {assessment.indicators.filter(i => !i.isResolved).map((indicator) => (
                      <div 
                        key={indicator.id} 
                        className={`p-3 rounded-lg border ${
                          indicator.severity === "critical" ? "bg-red-500/10 border-red-500/30" :
                          indicator.severity === "high" ? "bg-orange-500/10 border-orange-500/30" :
                          indicator.severity === "medium" ? "bg-yellow-500/10 border-yellow-500/30" :
                          "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <AlertCircle className={`h-4 w-4 ${
                                indicator.severity === "critical" || indicator.severity === "high" 
                                  ? "text-red-500" 
                                  : "text-orange-500"
                              }`} />
                              <span className="text-sm font-medium capitalize">
                                {indicator.type.replace(/_/g, " ")}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {indicator.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {indicator.description}
                            </p>
                            <p className="text-xs text-primary mt-2">
                              💡 {indicator.suggestedAction}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {assessment.recommendations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Proactive Recommendations</p>
                  <div className="space-y-2">
                    {assessment.recommendations.map((rec) => (
                      <div key={rec.id} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={rec.priority === "immediate" ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {rec.priority}
                              </Badge>
                              <span className="text-sm font-medium">{rec.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {rec.description}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <Badge variant="outline" className="text-xs text-green-600">
                              -{rec.estimatedImpact}% risk
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="mt-3 h-8"
                          onClick={() => implementRecommendation(rec.id)}
                        >
                          {rec.actionLabel}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Clear */}
              {assessment.indicators.filter(i => !i.isResolved).length === 0 && 
               assessment.riskLevel === "low" && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-700">All Clear</p>
                    <p className="text-xs text-green-600">
                      No dispute risks detected. Communication is healthy.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {displayAssessments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No Active Deals</p>
            <p className="text-sm text-muted-foreground">
              Start a deal to enable dispute prevention monitoring
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
