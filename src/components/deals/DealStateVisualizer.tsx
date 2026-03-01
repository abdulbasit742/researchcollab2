import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileEdit,
  Send,
  Handshake,
  Lock,
  Play,
  Upload,
  CheckCircle2,
  Trophy,
  AlertTriangle,
  XCircle,
  GitBranch,
} from "lucide-react";
import type { DealStatus } from "@/lib/deals/dealLifecycle";

interface DealStateVisualizerProps {
  currentStatus: string;
  escrowFunded: boolean;
  className?: string;
}

interface StateNode {
  key: DealStatus;
  label: string;
  tooltip: string;
  icon: React.ElementType;
}

const DEAL_STATES: StateNode[] = [
  { key: "draft", label: "Draft", tooltip: "Deal proposed — awaiting submission to counterparty", icon: FileEdit },
  { key: "submitted", label: "Submitted", tooltip: "Proposal sent — awaiting counterparty review", icon: Send },
  { key: "accepted", label: "Accepted", tooltip: "Terms agreed — awaiting escrow funding", icon: Handshake },
  { key: "escrow_funded", label: "Escrow Funded", tooltip: "Capital locked in escrow — funds secured", icon: Lock },
  { key: "in_progress", label: "In Progress", tooltip: "Active execution — milestones being worked on", icon: Play },
  { key: "milestone_submitted", label: "Milestone Submitted", tooltip: "Work submitted for review by sponsor", icon: Upload },
  { key: "milestone_approved", label: "Milestone Approved", tooltip: "Sponsor approved — funds eligible for release", icon: CheckCircle2 },
  { key: "completed", label: "Completed", tooltip: "All milestones done — deal successfully closed", icon: Trophy },
];

const EXCEPTION_STATES: StateNode[] = [
  { key: "disputed", label: "Disputed", tooltip: "Active dispute — funds frozen pending resolution", icon: AlertTriangle },
  { key: "cancelled", label: "Cancelled", tooltip: "Deal terminated — funds returned if applicable", icon: XCircle },
];

const stateColorMap: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  draft: { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-muted", ring: "ring-muted" },
  submitted: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30", ring: "ring-blue-500/20" },
  accepted: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30", ring: "ring-blue-500/20" },
  escrow_funded: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30", ring: "ring-amber-500/20" },
  in_progress: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", ring: "ring-primary/20" },
  milestone_submitted: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30", ring: "ring-amber-500/20" },
  milestone_approved: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30", ring: "ring-emerald-500/20" },
  completed: { bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30", ring: "ring-emerald-500/20" },
  disputed: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30", ring: "ring-destructive/20" },
  cancelled: { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-muted", ring: "ring-muted" },
};

function getStateIndex(status: string): number {
  return DEAL_STATES.findIndex(s => s.key === status);
}

export function DealStateVisualizer({ currentStatus, escrowFunded, className }: DealStateVisualizerProps) {
  const currentIdx = getStateIndex(currentStatus);
  const isException = currentStatus === "disputed" || currentStatus === "cancelled";
  const colors = stateColorMap[currentStatus] || stateColorMap.draft;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Deal State
          </CardTitle>
          <Badge variant="outline" className={cn("text-xs", colors.text, colors.border)}>
            {DEAL_STATES.find(s => s.key === currentStatus)?.label 
              || EXCEPTION_STATES.find(s => s.key === currentStatus)?.label 
              || currentStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main State Stepper */}
        <TooltipProvider delayDuration={200}>
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
            {!isException && currentIdx >= 0 && (
              <div
                className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
                style={{ width: `${Math.max(0, (currentIdx / (DEAL_STATES.length - 1)) * 100)}%`, maxWidth: "calc(100% - 2rem)" }}
              />
            )}

            <div className="relative flex justify-between">
              {DEAL_STATES.map((state, idx) => {
                const isCompleted = !isException && currentIdx >= 0 && idx < currentIdx;
                const isCurrent = state.key === currentStatus;
                const isFuture = !isException && (currentIdx < 0 || idx > currentIdx);
                const Icon = state.icon;
                const sc = stateColorMap[state.key];

                return (
                  <Tooltip key={state.key}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center gap-1.5 z-10 cursor-default" style={{ width: `${100 / DEAL_STATES.length}%` }}>
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                            isCompleted && "border-primary bg-primary text-primary-foreground",
                            isCurrent && cn("border-2", sc.border, sc.bg, sc.text, "ring-2", sc.ring, "ring-offset-2 ring-offset-background"),
                            isFuture && "border-border bg-background text-muted-foreground",
                            isException && "border-border bg-background text-muted-foreground opacity-50"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Icon className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span className={cn(
                          "text-[9px] font-medium text-center leading-tight max-w-[60px] hidden sm:block",
                          isCurrent ? sc.text : isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {state.label}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[200px]">
                      <p className="font-semibold text-xs">{state.label}</p>
                      <p className="text-[11px] text-muted-foreground">{state.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </TooltipProvider>

        {/* Exception States */}
        {isException && (
          <div className={cn("flex items-center gap-2 p-3 rounded-lg border", colors.bg, colors.border)}>
            {currentStatus === "disputed" ? (
              <AlertTriangle className={cn("h-4 w-4 shrink-0", colors.text)} />
            ) : (
              <XCircle className={cn("h-4 w-4 shrink-0", colors.text)} />
            )}
            <div>
              <p className={cn("text-xs font-semibold", colors.text)}>
                {currentStatus === "disputed" ? "Deal is Disputed" : "Deal Cancelled"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {currentStatus === "disputed"
                  ? "Funds are frozen. Resolution required before any further action."
                  : "This deal has been terminated."}
              </p>
            </div>
          </div>
        )}

        {/* Escrow Indicator */}
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "h-2 w-2 rounded-full",
            escrowFunded ? "bg-emerald-500" : "bg-muted-foreground"
          )} />
          <span className="text-muted-foreground">
            Escrow: {escrowFunded ? "Funded & Secured" : "Not yet funded"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
