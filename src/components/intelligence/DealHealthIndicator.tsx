import { HealthBadge } from "@/components/fyp/HealthBadge";
import { useDealHealthScore } from "@/hooks/useIntelligence";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  topicId: string;
  showDetails?: boolean;
}

export function DealHealthIndicator({ topicId, showDetails = false }: Props) {
  const { data: scores } = useDealHealthScore(topicId);
  const score = scores?.[0];

  if (!score) return null;

  const level = score.health_level === "green" ? "healthy" : score.health_level === "red" ? "critical" : "at-risk";
  const s = score.scores;

  if (!showDetails) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <HealthBadge level={level} score={s.overall} />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1 text-xs">
            <p>Completion: {s.completion_probability}%</p>
            <p>Delay Risk: {s.delay_risk}%</p>
            <p>Dispute Risk: {s.dispute_risk}%</p>
            <p>Sponsor Response: {s.sponsor_responsiveness}</p>
            <p>Student Execution: {s.student_execution}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <HealthBadge level={level} score={s.overall} size="md" />
        <span className="text-sm font-medium">Deal Health</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Metric label="Completion" value={`${s.completion_probability}%`} />
        <Metric label="Delay Risk" value={`${s.delay_risk}%`} danger={s.delay_risk > 50} />
        <Metric label="Dispute Risk" value={`${s.dispute_risk}%`} danger={s.dispute_risk > 50} />
        <Metric label="Sponsor Response" value={s.sponsor_responsiveness} />
        <Metric label="Student Execution" value={s.student_execution} />
      </div>
      {score.recommendations.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          {score.recommendations.map((r, i) => <p key={i}>⚠ {r}</p>)}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, danger }: { label: string; value: any; danger?: boolean }) {
  return (
    <div className="flex justify-between p-1.5 rounded bg-muted/50">
      <span className="text-muted-foreground">{label}</span>
      <span className={danger ? "text-destructive font-semibold" : "font-semibold"}>{value}</span>
    </div>
  );
}
