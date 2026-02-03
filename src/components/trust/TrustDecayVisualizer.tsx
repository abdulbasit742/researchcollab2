import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrustSystem } from "@/hooks/useTrustSystem";
import { Clock, AlertTriangle, TrendingDown, CheckCircle, Activity, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const DECAY_RATE = 2;
const DECAY_PERIOD_DAYS = 30;

interface TrustDecayVisualizerProps {
  userId?: string;
}

export function TrustDecayVisualizer({ userId }: TrustDecayVisualizerProps) {
  const { breakdown, loading, refresh } = useTrustSystem(userId);

  if (loading || !breakdown) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const daysSinceActivity = breakdown.lastActivity
    ? Math.floor((Date.now() - breakdown.lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const daysUntilDecay = Math.max(0, DECAY_PERIOD_DAYS - daysSinceActivity);
  const decayProgress = (daysSinceActivity / DECAY_PERIOD_DAYS) * 100;
  const isAtRisk = daysUntilDecay <= 7;
  const isDecaying = daysUntilDecay === 0;

  const preventionActions = [
    { id: "review", label: "Complete a review", impact: "Resets decay timer" },
    { id: "profile", label: "Update profile", impact: "+5 days" },
    { id: "endorse", label: "Endorse a colleague", impact: "+3 days" },
    { id: "milestone", label: "Complete a milestone", impact: "Resets timer + trust gain" },
  ];

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            Trust Decay Monitor
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Trust Score */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Current Trust Score</p>
            <p className="text-3xl font-bold">{breakdown.overall}</p>
          </div>
          <Badge variant={isDecaying ? "destructive" : isAtRisk ? "secondary" : "default"}>
            {breakdown.tier.toUpperCase()}
          </Badge>
        </div>

        {/* Decay Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Decay Timeline</span>
            <span className={isAtRisk ? "text-orange-500 font-medium" : "text-muted-foreground"}>
              {isDecaying ? "Decaying now" : `${daysUntilDecay} days until decay`}
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={Math.min(decayProgress, 100)} 
              className="h-3"
            />
            <div className="absolute top-0 left-0 w-full h-3 flex items-center">
              {[0, 25, 50, 75, 100].map((mark) => (
                <div
                  key={mark}
                  className="absolute h-full border-l border-background/50"
                  style={{ left: `${mark}%` }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Active</span>
            <span>7 days</span>
            <span>14 days</span>
            <span>21 days</span>
            <span className="text-orange-500">30 days</span>
          </div>
        </div>

        {/* Warning Banner */}
        {isAtRisk && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg flex items-center gap-3 ${
              isDecaying 
                ? "bg-destructive/10 border border-destructive/30" 
                : "bg-orange-500/10 border border-orange-500/30"
            }`}
          >
            <AlertTriangle className={`h-5 w-5 ${isDecaying ? "text-destructive" : "text-orange-500"}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {isDecaying 
                  ? `Your trust score is decaying ${DECAY_RATE}% per month` 
                  : `Trust decay starts in ${daysUntilDecay} days`}
              </p>
              <p className="text-xs text-muted-foreground">
                Take action below to prevent score reduction
              </p>
            </div>
          </motion.div>
        )}

        {/* Last Activity */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>
            Last activity: {breakdown.lastActivity 
              ? breakdown.lastActivity.toLocaleDateString() 
              : "No recent activity"}
          </span>
        </div>

        {/* Prevention Actions */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Quick Actions to Prevent Decay</p>
          <div className="grid grid-cols-1 gap-2">
            {preventionActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="justify-between h-auto py-3"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{action.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {action.impact}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Decay Projection */}
        <div className="p-4 rounded-lg bg-muted/30 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Decay Projection</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold">{breakdown.overall}</p>
              <p className="text-xs text-muted-foreground">Now</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-500">
                {Math.max(0, breakdown.overall - DECAY_RATE)}
              </p>
              <p className="text-xs text-muted-foreground">+30 days</p>
            </div>
            <div>
              <p className="text-lg font-bold text-destructive">
                {Math.max(0, breakdown.overall - DECAY_RATE * 3)}
              </p>
              <p className="text-xs text-muted-foreground">+90 days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
