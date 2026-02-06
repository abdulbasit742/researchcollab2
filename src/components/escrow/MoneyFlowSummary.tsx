import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/currency";
import type { EscrowSummary } from "@/hooks/useEscrowMonitor";
import {
  Wallet,
  Shield,
  TrendingUp,
  TrendingDown,
  Landmark,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

interface MoneyFlowSummaryProps {
  summary: EscrowSummary;
}

export function MoneyFlowSummary({ summary }: MoneyFlowSummaryProps) {
  const cards = [
    {
      label: "Available",
      value: summary.total_available,
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      label: "In Escrow",
      value: summary.total_in_escrow,
      icon: Shield,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Total Earned",
      value: summary.total_earned_lifetime,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Fees Paid",
      value: summary.total_fees_paid,
      icon: Landmark,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
      borderColor: "border-border",
    },
    {
      label: "Active Deals",
      value: summary.active_deals,
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      isCurrency: false,
    },
    {
      label: "30d Net Flow",
      value: summary.net_flow_30d,
      icon: summary.net_flow_30d >= 0 ? ArrowDownLeft : ArrowUpRight,
      color: summary.net_flow_30d >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-destructive",
      bgColor: summary.net_flow_30d >= 0 ? "bg-emerald-500/10" : "bg-destructive/10",
      borderColor: summary.net_flow_30d >= 0 ? "border-emerald-500/20" : "border-destructive/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isCurrency = card.isCurrency !== false;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={cn("border", card.borderColor, card.bgColor, "hover:shadow-sm transition-shadow")}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("h-4 w-4", card.color)} />
                  <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
                </div>
                <p className={cn("text-lg font-bold", card.color)}>
                  {isCurrency ? formatPKR(card.value) : card.value}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
