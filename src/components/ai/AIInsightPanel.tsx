/**
 * AIInsightPanel — Displays AI-generated project insights.
 * Read-only advisory panel. No automatic actions.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2, AlertTriangle, TrendingDown, Users, Clock, CheckCircle, RefreshCw } from "lucide-react";
import { useAIWorkflow } from "@/hooks/useAIWorkflow";

interface Insight {
  type: string;
  message: string;
  confidence: number;
  severity: string;
}

interface AIInsightPanelProps {
  projectId: string;
  projectContext?: string;
}

const INSIGHT_ICONS: Record<string, any> = {
  delay_risk: Clock,
  inactivity: TrendingDown,
  bottleneck: AlertTriangle,
  imbalance: Users,
  positive: CheckCircle,
};

const INSIGHT_COLORS: Record<string, string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export function AIInsightPanel({ projectId, projectContext }: AIInsightPanelProps) {
  const { generate, isLoading, result, reset } = useAIWorkflow<{ insights: Insight[] }>();
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    await generate("project-insights", projectContext || `Project ${projectId} analysis`, {
      project_id: projectId,
    });
    setHasGenerated(true);
  };

  const insights = result?.result?.insights || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Insights
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={isLoading}
            className="gap-1.5 text-xs"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {hasGenerated ? "Refresh" : "Generate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasGenerated && !isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Click "Generate" to get AI-powered project insights.
          </p>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-4">
            <CheckCircle className="h-6 w-6 text-success mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground">No concerns detected.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {insights.map((insight, i) => {
              const Icon = INSIGHT_ICONS[insight.type] || Lightbulb;
              return (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg border bg-muted/20">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${INSIGHT_COLORS[insight.severity] || "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">{insight.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Confidence: {Math.round(insight.confidence * 100)}%
                    </p>
                  </div>
                </div>
              );
            })}
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1">
              <AlertTriangle className="h-2.5 w-2.5" />
              AI-generated — verify before acting.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
