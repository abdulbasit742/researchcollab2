import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTrustSystem, getTrustTierColor, TrustBreakdown } from "@/hooks/useTrustSystem";
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Building2,
  Users,
  Handshake,
  DollarSign,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = {
  delivery: Handshake,
  financial: DollarSign,
  collaboration: Users,
  institutional: Building2,
  consistency: Clock,
};

const CATEGORY_LABELS = {
  delivery: "Delivery Reliability",
  financial: "Financial Integrity",
  collaboration: "Collaboration Quality",
  institutional: "Institutional Confidence",
  consistency: "Consistency",
};

const CATEGORY_DESCRIPTIONS = {
  delivery: "Based on project completion rate, deadline adherence, and quality ratings",
  financial: "Based on escrow handling, payment timeliness, and dispute history",
  collaboration: "Based on communication quality, responsiveness, and peer feedback",
  institutional: "Based on verified affiliations and institutional endorsements",
  consistency: "Based on regular platform activity and behavior stability",
};

interface TrustBreakdownPanelProps {
  userId?: string;
  compact?: boolean;
}

export function TrustBreakdownPanel({ userId, compact = false }: TrustBreakdownPanelProps) {
  const { breakdown, events, loading, improvementSuggestions, weights } = useTrustSystem(userId);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Trust data not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Trust Score Analysis
          </CardTitle>
          <Badge className={cn("capitalize", getTrustTierColor(breakdown.tier))}>
            {breakdown.tier}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center py-4 bg-muted/50 rounded-lg">
          <div className="text-4xl font-bold text-primary">{Math.round(breakdown.overall)}</div>
          <div className="text-sm text-muted-foreground mt-1">Overall Trust Score</div>
          
          {/* Volatility Indicator */}
          <div className="flex items-center justify-center gap-1 mt-2">
            {breakdown.volatility === "rising" && (
              <>
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-600">Rising</span>
              </>
            )}
            {breakdown.volatility === "falling" && (
              <>
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-600">Declining</span>
              </>
            )}
            {breakdown.volatility === "stable" && (
              <>
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-blue-600">Stable</span>
              </>
            )}
            {breakdown.volatility === "volatile" && (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-amber-600">Volatile</span>
              </>
            )}
          </div>
        </div>

        {/* Decay Warning */}
        {breakdown.decayWarning && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-700 dark:text-amber-300">
              Activity required soon to prevent trust decay
            </span>
          </div>
        )}

        {/* Component Breakdown */}
        {!compact && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Score Components</h4>
            
            <TooltipProvider>
              {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map((category) => {
                const Icon = CATEGORY_ICONS[category];
                const score = breakdown[category] || 0;
                const weight = weights[category] * 100;
                
                return (
                  <Tooltip key={category}>
                    <TooltipTrigger asChild>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span>{CATEGORY_LABELS[category]}</span>
                            <Badge variant="outline" className="text-xs">
                              {weight}%
                            </Badge>
                          </div>
                          <span className="font-medium">{Math.round(score)}</span>
                        </div>
                        <Progress 
                          value={score} 
                          className={cn(
                            "h-2",
                            score >= 75 ? "[&>div]:bg-green-500" :
                            score >= 50 ? "[&>div]:bg-amber-500" :
                            "[&>div]:bg-red-500"
                          )}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">{CATEGORY_DESCRIPTIONS[category]}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        )}

        {/* Improvement Suggestions */}
        {improvementSuggestions.length > 0 && !compact && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Info className="h-4 w-4" />
              Improvement Suggestions
            </h4>
            <div className="space-y-2">
              {improvementSuggestions.slice(0, 3).map((suggestion, i) => (
                <div 
                  key={i} 
                  className="text-sm p-2 bg-muted/50 rounded flex items-start gap-2"
                >
                  <Badge variant="outline" className="shrink-0">{suggestion.category}</Badge>
                  <span className="text-muted-foreground">{suggestion.suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recovery Path */}
        {breakdown.recoveryPath.length > 0 && !compact && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recovery Path</h4>
            <div className="space-y-2">
              {breakdown.recoveryPath.slice(0, 3).map((step) => (
                <div 
                  key={step.id} 
                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      step.completed ? "bg-green-500" : "bg-muted-foreground"
                    )} />
                    <span>{step.action}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      +{step.impact} pts
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs",
                        step.difficulty === "easy" ? "bg-green-100 text-green-700" :
                        step.difficulty === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}
                    >
                      {step.difficulty}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        {events.length > 0 && !compact && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Trust Events</h4>
            <div className="space-y-1">
              {events.slice(0, 3).map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-2 rounded text-sm border"
                >
                  <div className="flex items-center gap-2">
                    {event.type === "positive" && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    {event.type === "negative" && (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {event.type === "neutral" && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    )}
                    <span>{event.description}</span>
                  </div>
                  <span className={cn(
                    "font-medium",
                    event.delta > 0 ? "text-green-600" :
                    event.delta < 0 ? "text-red-600" :
                    "text-muted-foreground"
                  )}>
                    {event.delta > 0 ? "+" : ""}{event.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact trust badge for inline use
interface TrustBadgeInlineProps {
  score: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TrustBadgeInline({ score, showScore = true, size = "md" }: TrustBadgeInlineProps) {
  const tier = score >= 90 ? "platinum" : score >= 75 ? "gold" : score >= 50 ? "silver" : score >= 25 ? "bronze" : "unverified";
  
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge className={cn(getTrustTierColor(tier), sizeClasses[size])}>
            <Shield className={cn(
              "mr-1",
              size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5"
            )} />
            {showScore ? Math.round(score) : tier}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Trust Score: {Math.round(score)} ({tier})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
