import { cn } from "@/lib/utils";
import { Check, X, Eye, Star, Clock } from "lucide-react";

const STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "viewed", label: "Viewed", icon: Eye },
  { key: "shortlisted", label: "Shortlisted", icon: Star },
  { key: "accepted", label: "Accepted", icon: Check },
] as const;

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  viewed: 1,
  shortlisted: 2,
  accepted: 3,
  rejected: -1,
};

interface BidStatusTimelineProps {
  status: string;
}

export function BidStatusTimeline({ status }: BidStatusTimelineProps) {
  const isRejected = status === "rejected";
  const currentIndex = STATUS_ORDER[status] ?? 0;

  if (isRejected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-destructive/15 text-destructive">
          <X className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-medium text-destructive">Rejected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      {STEPS.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const StepIcon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full transition-colors",
                isCompleted
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
              title={step.label}
            >
              <StepIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-2 sm:w-4 h-0.5 mx-0.5",
                  i < currentIndex ? "bg-primary/40" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
      <span className="ml-1 sm:ml-2 text-xs font-medium text-muted-foreground capitalize hidden sm:inline">
        {status}
      </span>
    </div>
  );
}
