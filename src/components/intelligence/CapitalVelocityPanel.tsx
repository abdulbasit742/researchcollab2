import { useCapitalVelocity } from "@/hooks/useIntelligence";
import { HealthBadge } from "@/components/fyp/HealthBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Clock, AlertTriangle } from "lucide-react";

export function CapitalVelocityPanel() {
  const { data: scores } = useCapitalVelocity();
  const score = scores?.[0];

  if (!score) return null;

  const s = score.scores;
  const level = score.health_level === "green" ? "healthy" : score.health_level === "red" ? "critical" : "at-risk";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Capital Velocity
          <HealthBadge level={level} showLabel={false} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-2 rounded-md bg-muted/50">
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="font-bold text-lg">{s.avg_release_days}d</p>
            <p className="text-muted-foreground">Avg Release</p>
          </div>
          <div className="p-2 rounded-md bg-muted/50">
            <p className="font-bold text-lg">{s.total_released}</p>
            <p className="text-muted-foreground">Released</p>
          </div>
          <div className="p-2 rounded-md bg-muted/50">
            <p className="font-bold text-lg">{s.total_pending}</p>
            <p className="text-muted-foreground">Pending</p>
          </div>
          <div className="p-2 rounded-md bg-muted/50">
            {s.stuck_count > 0 && <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />}
            <p className={`font-bold text-lg ${s.stuck_count > 0 ? "text-destructive" : ""}`}>{s.stuck_count}</p>
            <p className="text-muted-foreground">Stuck</p>
          </div>
        </div>
        {score.recommendations.length > 0 && (
          <div className="mt-3 space-y-1">
            {score.recommendations.map((r, i) => (
              <p key={i} className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 shrink-0" /> {r}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
