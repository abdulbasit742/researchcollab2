import { cn } from "@/lib/utils";
import { Check, Clock, Lock, DollarSign, Banknote } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface EscrowStep {
  label: string;
  amount?: string;
  date?: string;
  approver?: string;
  status: "completed" | "active" | "pending";
}

interface EscrowTimelineProps {
  steps: EscrowStep[];
  className?: string;
}

const stepIcons = {
  completed: Check,
  active: Clock,
  pending: Lock,
};

export function EscrowTimeline({ steps, className }: EscrowTimelineProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center w-full">
        {steps.map((step, i) => {
          const Icon = stepIcons[step.status];
          const isLast = i === steps.length - 1;
          return (
            <div key={i} className={cn("flex items-center", !isLast && "flex-1")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1.5 min-w-0">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center border-2 transition-colors shrink-0",
                        step.status === "completed" && "bg-success border-success text-success-foreground",
                        step.status === "active" && "bg-primary/10 border-primary text-primary",
                        step.status === "pending" && "bg-muted border-border text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight max-w-[80px] truncate">
                      {step.label}
                    </span>
                    {step.amount && (
                      <span className={cn(
                        "text-[10px] font-semibold",
                        step.status === "completed" ? "text-success" : "text-muted-foreground"
                      )}>
                        {step.amount}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-medium">{step.label}</p>
                  {step.amount && <p>Amount: {step.amount}</p>}
                  {step.date && <p>Date: {step.date}</p>}
                  {step.approver && <p>Approved by: {step.approver}</p>}
                </TooltipContent>
              </Tooltip>
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 rounded-full",
                    step.status === "completed" ? "bg-success" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
