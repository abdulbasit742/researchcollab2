import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GitBranch,
  ArrowRight,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Lock,
  Unlock,
  DollarSign,
} from "lucide-react";

interface EscrowState {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const ESCROW_STATES: EscrowState[] = [
  {
    id: "uninitialized",
    label: "Uninitialized",
    description: "Deal proposed, no funds committed",
    icon: GitBranch,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
  },
  {
    id: "funded",
    label: "Funded",
    description: "Buyer's funds moved to escrow",
    icon: Lock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "locked",
    label: "Locked",
    description: "Work in progress, funds secured",
    icon: Shield,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "milestone_released",
    label: "Milestone Released",
    description: "Partial release on milestone approval",
    icon: Unlock,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "disputed",
    label: "Disputed",
    description: "Funds frozen pending resolution",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    id: "refunded",
    label: "Refunded",
    description: "Funds returned to buyer",
    icon: RotateCcw,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "completed",
    label: "Completed",
    description: "All milestones released, deal closed",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/15",
  },
];

interface Transition {
  from: string;
  to: string;
  trigger: string;
}

const TRANSITIONS: Transition[] = [
  { from: "uninitialized", to: "funded", trigger: "Buyer accepts & funds" },
  { from: "funded", to: "locked", trigger: "Work begins" },
  { from: "locked", to: "milestone_released", trigger: "Milestone approved" },
  { from: "milestone_released", to: "locked", trigger: "Next milestone starts" },
  { from: "milestone_released", to: "completed", trigger: "All milestones done" },
  { from: "locked", to: "disputed", trigger: "Dispute raised" },
  { from: "disputed", to: "locked", trigger: "Dispute resolved (continue)" },
  { from: "disputed", to: "refunded", trigger: "Dispute resolved (refund)" },
  { from: "funded", to: "refunded", trigger: "Deal cancelled" },
  { from: "locked", to: "refunded", trigger: "Deal cancelled" },
];

interface EscrowStateMachineProps {
  activeState?: string;
}

export function EscrowStateMachine({ activeState = "uninitialized" }: EscrowStateMachineProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Escrow State Machine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* State nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {ESCROW_STATES.map((state) => {
            const Icon = state.icon;
            const isActive = state.id === activeState;

            return (
              <div
                key={state.id}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all",
                  state.bgColor,
                  isActive
                    ? "border-primary shadow-md ring-2 ring-primary/20 scale-[1.02]"
                    : "border-transparent opacity-70"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("h-4 w-4", state.color)} />
                  <span className={cn("text-xs font-semibold", state.color)}>
                    {state.label}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {state.description}
                </p>
                {isActive && (
                  <Badge className="mt-2 text-[10px] h-4" variant="default">
                    Current
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Transition table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-3 py-2 border-b">
            <span className="text-xs font-semibold">State Transitions</span>
          </div>
          <div className="divide-y max-h-48 overflow-y-auto">
            {TRANSITIONS.map((t, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs",
                  t.from === activeState && "bg-primary/5"
                )}
              >
                <Badge variant="outline" className="text-[10px] h-5 font-mono">
                  {t.from}
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <Badge variant="outline" className="text-[10px] h-5 font-mono">
                  {t.to}
                </Badge>
                <span className="text-muted-foreground ml-auto truncate">
                  {t.trigger}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety guarantee */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <Shield className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Money Safety Guarantee
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Every state transition is atomic. Funds can never be lost, duplicated, or trapped.
              All movements are logged and auditable.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
