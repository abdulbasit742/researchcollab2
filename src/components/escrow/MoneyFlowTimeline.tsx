import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/currency";
import type { MoneyFlowEntry } from "@/hooks/useEscrowMonitor";
import {
  ArrowRight,
  Shield,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Landmark,
} from "lucide-react";

const flowConfig: Record<
  MoneyFlowEntry["type"],
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  escrow_lock: {
    label: "Escrow Lock",
    icon: Shield,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  milestone_release: {
    label: "Milestone Release",
    icon: DollarSign,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  platform_fee: {
    label: "Platform Fee",
    icon: Landmark,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-border",
  },
  refund: {
    label: "Refund",
    icon: RotateCcw,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  deposit: {
    label: "Deposit",
    icon: ArrowDownLeft,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  withdrawal: {
    label: "Withdrawal",
    icon: ArrowUpRight,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
};

interface MoneyFlowTimelineProps {
  flows: MoneyFlowEntry[];
  maxItems?: number;
}

export function MoneyFlowTimeline({ flows, maxItems = 15 }: MoneyFlowTimelineProps) {
  const visibleFlows = flows.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Money Flow Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visibleFlows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No money movements yet</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-1">
              {visibleFlows.map((flow, index) => {
                const config = flowConfig[flow.type];
                const FlowIcon = config.icon;

                return (
                  <motion.div
                    key={flow.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className={cn(
                      "relative flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      config.bgColor,
                      config.borderColor,
                      "hover:shadow-sm"
                    )}
                  >
                    {/* Icon node on timeline */}
                    <div
                      className={cn(
                        "relative z-10 h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 bg-background",
                        config.borderColor
                      )}
                    >
                      <FlowIcon className={cn("h-4 w-4", config.color)} />
                    </div>

                    {/* Flow details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{config.label}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="truncate max-w-[80px]">{flow.from_label}</span>
                          <ArrowRight className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[80px]">{flow.to_label}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {flow.description}
                      </p>
                    </div>

                    {/* Amount and time */}
                    <div className="text-right flex-shrink-0">
                      <p className={cn("font-semibold text-sm", config.color)}>
                        {formatPKR(flow.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(flow.timestamp)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
