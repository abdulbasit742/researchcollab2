import { useTrustPrediction } from "@/hooks/useIntelligence";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  userId: string;
  className?: string;
}

export function TrustImpactPredictor({ userId, className }: Props) {
  const { data: scores } = useTrustPrediction(userId);
  const score = scores?.[0];

  if (!score) return null;

  const s = score.scores;

  return (
    <div className={cn("rounded-lg border border-border p-3 space-y-2", className)}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trust Impact Preview</p>
      <div className="space-y-1.5">
        <Row icon={TrendingUp} label="On-time delivery" value={`+${s.on_time_impact}`} color="text-success" />
        <Row icon={TrendingDown} label="If delayed" value={`${s.delay_impact}`} color="text-warning" />
        <Row icon={TrendingDown} label="If disputed" value={`${s.dispute_impact}`} color="text-destructive" />
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", color)} />
        <span>{label}</span>
      </div>
      <span className={cn("font-bold", color)}>{value}</span>
    </div>
  );
}
