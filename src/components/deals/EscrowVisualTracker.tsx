import { Check, Lock, Send, UserCheck, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

type EscrowStage = "locked" | "submitted" | "validated" | "released";

interface EscrowVisualTrackerProps {
  currentStage: EscrowStage;
  amount?: string;
  avgReleaseTime?: string;
  className?: string;
}

const stages = [
  { key: "locked" as const, label: "Escrow Secured", sublabel: "Funds Locked", icon: Lock },
  { key: "submitted" as const, label: "Milestone Submitted", sublabel: "Awaiting Review", icon: Send },
  { key: "validated" as const, label: "Supervisor Validated", sublabel: "Approved", icon: UserCheck },
  { key: "released" as const, label: "Payment Released", sublabel: "Completed", icon: Banknote },
];

const stageIndex = (stage: EscrowStage) => stages.findIndex((s) => s.key === stage);

export function EscrowVisualTracker({
  currentStage,
  amount,
  avgReleaseTime,
  className,
}: EscrowVisualTrackerProps) {
  const current = stageIndex(currentStage);

  return (
    <div className={cn("rounded-xl border bg-card p-4 md:p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Escrow Status</h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-primary font-medium">
            <Check className="h-3 w-3" />
            Zero-Error
          </span>
          {avgReleaseTime && (
            <span className="text-xs text-muted-foreground">
              Avg release: {avgReleaseTime}
            </span>
          )}
        </div>
      </div>

      {amount && (
        <p className="text-lg font-bold text-foreground mb-4">{amount}</p>
      )}

      {/* Progress bar */}
      <div className="relative flex items-center justify-between mb-2">
        {/* Background line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
        {/* Active line */}
        <div
          className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(current / (stages.length - 1)) * 100}%`, maxWidth: "calc(100% - 2rem)" }}
        />

        {stages.map((stage, i) => {
          const completed = i <= current;
          const active = i === current;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                  completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
                  active && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                )}
              >
                {completed && i < current ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] md:text-xs font-medium text-center leading-tight max-w-[80px]",
                  completed ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
              <span className="text-[9px] md:text-[10px] text-muted-foreground text-center hidden sm:block">
                {stage.sublabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
