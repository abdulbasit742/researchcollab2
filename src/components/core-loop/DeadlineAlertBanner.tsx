import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, Timer, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export interface DeadlineAlert {
  id: string;
  milestone_title: string;
  deal_id: string;
  deal_title: string;
  days_remaining: number;
  auto_release: boolean;
}

interface DeadlineAlertBannerProps {
  alerts: DeadlineAlert[];
  className?: string;
}

function getSeverity(days: number) {
  if (days <= 1) return { level: "critical" as const, color: "border-destructive/50 bg-destructive/5 text-destructive", icon: AlertTriangle };
  if (days <= 3) return { level: "warning" as const, color: "border-amber-500/50 bg-amber-500/5 text-amber-700 dark:text-amber-400", icon: Timer };
  return { level: "info" as const, color: "border-blue-500/50 bg-blue-500/5 text-blue-700 dark:text-blue-400", icon: Clock };
}

export function DeadlineAlertBanner({ alerts, className }: DeadlineAlertBannerProps) {
  if (alerts.length === 0) return null;

  const sorted = [...alerts].sort((a, b) => a.days_remaining - b.days_remaining);

  return (
    <div className={cn("space-y-2", className)}>
      {sorted.slice(0, 3).map((alert) => {
        const sev = getSeverity(alert.days_remaining);
        const Icon = sev.icon;

        return (
          <Alert key={alert.id} className={cn("py-3", sev.color)}>
            <Icon className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold flex items-center gap-2">
              {alert.days_remaining <= 0
                ? "Overdue!"
                : `${alert.days_remaining} day${alert.days_remaining !== 1 ? "s" : ""} remaining`}
              {alert.auto_release && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Auto-release
                </Badge>
              )}
            </AlertTitle>
            <AlertDescription className="mt-1 flex items-center justify-between">
              <span className="text-xs">
                <strong>{alert.milestone_title}</strong> — {alert.deal_title}
              </span>
              <Link to={`/deals/${alert.deal_id}`}>
                <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                  View <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        );
      })}
      {alerts.length > 3 && (
        <p className="text-xs text-muted-foreground text-center">
          +{alerts.length - 3} more deadline{alerts.length - 3 !== 1 ? "s" : ""} approaching
        </p>
      )}
    </div>
  );
}
