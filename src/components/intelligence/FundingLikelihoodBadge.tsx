import { HealthBadge } from "@/components/fyp/HealthBadge";
import { useFundingLikelihood } from "@/hooks/useIntelligence";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp } from "lucide-react";

interface Props {
  topicId: string;
  showDetails?: boolean;
}

export function FundingLikelihoodBadge({ topicId, showDetails = false }: Props) {
  const { data: scores } = useFundingLikelihood(topicId);
  const score = scores?.[0];

  if (!score) return null;

  const level = score.health_level === "green" ? "healthy" : score.health_level === "red" ? "critical" : "at-risk";
  const s = score.scores;

  if (!showDetails) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <div className="inline-flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold">{s.funding_probability}%</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Funding probability: {s.funding_probability}%</p>
          <p className="text-xs">Est. time: {s.estimated_time_days} days</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <HealthBadge level={level} score={s.funding_probability} size="md" />
        <span className="text-sm font-medium">Funding Likelihood</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between p-1.5 rounded bg-muted/50">
          <span className="text-muted-foreground">Probability</span>
          <span className="font-semibold">{s.funding_probability}%</span>
        </div>
        <div className="flex justify-between p-1.5 rounded bg-muted/50">
          <span className="text-muted-foreground">Est. Days</span>
          <span className="font-semibold">{s.estimated_time_days}</span>
        </div>
        <div className="flex justify-between p-1.5 rounded bg-muted/50 col-span-2">
          <span className="text-muted-foreground">Match Strength</span>
          <span className="font-semibold">{s.sponsor_match_strength}/100</span>
        </div>
      </div>
      {score.recommendations.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          {score.recommendations.map((r, i) => <p key={i}>💡 {r}</p>)}
        </div>
      )}
    </div>
  );
}
