import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Star,
} from "lucide-react";
import type { AISynthesis, AISynthesisType, PatternAlert } from "@/types/knowledge-civilization";

interface AISynthesisCardProps {
  synthesis: AISynthesis;
  onRate?: (rating: number, wasUseful: boolean) => void;
  onViewSources?: () => void;
}

const synthesisTypeConfig: Record<AISynthesisType, { icon: typeof Brain; label: string; color: string }> = {
  summary: { icon: Brain, label: "Summary", color: "text-blue-600 dark:text-blue-400" },
  pattern_detection: { icon: TrendingUp, label: "Pattern Detection", color: "text-green-600 dark:text-green-400" },
  forgotten_insight: { icon: Lightbulb, label: "Forgotten Insight", color: "text-yellow-600 dark:text-yellow-400" },
  mistake_warning: { icon: AlertTriangle, label: "Mistake Warning", color: "text-red-600 dark:text-red-400" },
  cross_domain_connection: { icon: Share2, label: "Cross-Domain", color: "text-purple-600 dark:text-purple-400" },
  trend_analysis: { icon: TrendingUp, label: "Trend Analysis", color: "text-cyan-600 dark:text-cyan-400" },
};

export function AISynthesisCard({
  synthesis,
  onRate,
  onViewSources,
}: AISynthesisCardProps) {
  const typeConfig = synthesisTypeConfig[synthesis.type];
  const Icon = typeConfig.icon;

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-lg">
              <Icon className={`h-4 w-4 ${typeConfig.color}`} />
            </div>
            <div>
              <CardTitle className="text-base">{synthesis.title}</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
                <span className="text-xs text-muted-foreground">{typeConfig.label}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{synthesis.content}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-medium">{(synthesis.confidenceScore * 100).toFixed(0)}%</span>
          </div>
          <Progress value={synthesis.confidenceScore * 100} className="h-1.5" />
        </div>

        {synthesis.uncertaintyFactors.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Uncertainty Factors:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {synthesis.uncertaintyFactors.slice(0, 2).map((factor, i) => (
                <li key={i} className="flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0 text-yellow-500" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <span>Based on {synthesis.sourceObjectIds.length} source(s)</span>
          {onViewSources && (
            <Button size="sm" variant="ghost" className="text-xs" onClick={onViewSources}>
              View Sources
            </Button>
          )}
        </div>

        {onRate && synthesis.userRating === undefined && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Was this helpful?</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRate(1, false)}
                className="text-muted-foreground hover:text-red-500"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRate(5, true)}
                className="text-muted-foreground hover:text-green-500"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {synthesis.userRating !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>You rated this {synthesis.wasUseful ? "helpful" : "not helpful"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Pattern alert component
interface PatternAlertCardProps {
  alert: PatternAlert;
  onAcknowledge?: () => void;
  onView?: () => void;
}

export function PatternAlertCard({ alert, onAcknowledge, onView }: PatternAlertCardProps) {
  const alertTypeConfig: Record<PatternAlert["type"], { icon: typeof AlertTriangle; color: string }> = {
    emerging_pattern: { icon: TrendingUp, color: "text-blue-600 dark:text-blue-400" },
    repeated_mistake: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400" },
    forgotten_insight: { icon: Lightbulb, color: "text-yellow-600 dark:text-yellow-400" },
    opportunity: { icon: Sparkles, color: "text-green-600 dark:text-green-400" },
  };

  const config = alertTypeConfig[alert.type];
  const Icon = config.icon;

  return (
    <Card className={alert.acknowledgedAt ? "opacity-60" : ""}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-muted`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{alert.title}</p>
              <Badge variant="outline" className="text-xs">
                {(alert.confidence * 100).toFixed(0)}% confidence
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
            {alert.recommendedAction && (
              <p className="text-xs text-primary mt-2">
                → {alert.recommendedAction}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            {onView && (
              <Button size="sm" variant="ghost" onClick={onView}>
                View
              </Button>
            )}
            {onAcknowledge && !alert.acknowledgedAt && (
              <Button size="sm" variant="outline" onClick={onAcknowledge}>
                Acknowledge
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
