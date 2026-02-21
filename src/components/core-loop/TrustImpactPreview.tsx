import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Shield, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TrustImpactPreviewProps {
  currentTrust: number;
  projectedChange: number; // +3, -5, etc.
  reason: string; // "milestone_completion", "on_time_delivery", "late_submission"
  className?: string;
}

export function TrustImpactPreview({
  currentTrust,
  projectedChange,
  reason,
  className,
}: TrustImpactPreviewProps) {
  const projected = Math.min(100, Math.max(0, currentTrust + projectedChange));
  const isPositive = projectedChange > 0;
  const isNeutral = projectedChange === 0;

  const reasonLabels: Record<string, string> = {
    milestone_completion: "Milestone completed on time",
    on_time_delivery: "Early/on-time delivery bonus",
    late_submission: "Late submission penalty",
    dispute_filed: "Dispute filed against you",
    quality_bonus: "Quality exceeded expectations",
    streak_bonus: "Completion streak bonus",
  };

  return (
    <Card className={cn(
      "border-2 transition-colors",
      isPositive && "border-emerald-500/30 bg-emerald-500/5",
      !isPositive && !isNeutral && "border-destructive/30 bg-destructive/5",
      isNeutral && "border-border",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
            isPositive && "bg-emerald-500/10",
            !isPositive && !isNeutral && "bg-destructive/10",
            isNeutral && "bg-muted"
          )}>
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : isNeutral ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Trust Impact Preview</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold">{currentTrust}</span>
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "text-sm font-bold",
                  isPositive && "text-emerald-500",
                  !isPositive && !isNeutral && "text-destructive",
                )}
              >
                → {projected}
                <span className="text-xs ml-1">
                  ({isPositive ? "+" : ""}{projectedChange})
                </span>
              </motion.span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {reasonLabels[reason] || reason}
            </p>
          </div>

          {projectedChange >= 5 && (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs gap-1">
              <Star className="h-3 w-3" /> Boost
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
