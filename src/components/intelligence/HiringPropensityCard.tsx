import { useHiringPropensity } from "@/hooks/useIntelligence";
import { HealthBadge } from "@/components/fyp/HealthBadge";
import { Briefcase } from "lucide-react";

interface Props {
  sponsorId: string;
}

export function HiringPropensityCard({ sponsorId }: Props) {
  const { data: scores } = useHiringPropensity(sponsorId);
  const score = scores?.[0];

  if (!score) return null;

  const s = score.scores;
  const level = score.health_level === "green" ? "healthy" : score.health_level === "red" ? "critical" : "at-risk";

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold">Hiring Propensity</span>
        <HealthBadge level={level} score={s.hiring_propensity} showLabel={false} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        <div>
          <p className="font-bold text-lg">{s.hiring_propensity}%</p>
          <p className="text-muted-foreground">Propensity</p>
        </div>
        <div>
          <p className="font-bold text-lg">{s.total_offers}</p>
          <p className="text-muted-foreground">Offers</p>
        </div>
        <div>
          <p className="font-bold text-lg">{s.total_hires}</p>
          <p className="text-muted-foreground">Hires</p>
        </div>
      </div>
      {score.recommendations.length > 0 && (
        <p className="text-xs text-success font-medium">✓ {score.recommendations[0]}</p>
      )}
    </div>
  );
}
