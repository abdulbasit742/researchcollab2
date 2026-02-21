import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SponsorConfidenceBadgeProps {
  score: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

function getConfidence(score: number) {
  if (score >= 80) return { label: "High Confidence", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" };
  if (score >= 50) return { label: "Moderate", icon: Shield, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" };
  return { label: "Low Confidence", icon: ShieldAlert, color: "text-destructive bg-destructive/10 border-destructive/30" };
}

export function SponsorConfidenceBadge({ score, className, showLabel = true }: SponsorConfidenceBadgeProps) {
  const config = getConfidence(score);
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge className={cn("gap-1 text-xs font-semibold", config.color, className)}>
          <Icon className="h-3.5 w-3.5" />
          {showLabel && config.label}
          <span className="font-bold">{score}%</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs font-medium">Sponsor Confidence Score</p>
        <p className="text-xs text-muted-foreground">
          Based on completion rate, dispute history, and trust trajectory
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
