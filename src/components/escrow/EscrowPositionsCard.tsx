import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/currency";
import type { EscrowPosition } from "@/hooks/useEscrowMonitor";
import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface EscrowPositionsCardProps {
  positions: EscrowPosition[];
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  in_progress: { label: "Active", variant: "default" },
  negotiating: { label: "Negotiating", variant: "secondary" },
  agreed: { label: "Agreed", variant: "secondary" },
  disputed: { label: "Disputed", variant: "destructive" },
};

export function EscrowPositionsCard({ positions }: EscrowPositionsCardProps) {
  const totalLocked = positions.reduce((s, p) => s + p.locked_amount, 0);
  const totalReleased = positions.reduce((s, p) => s + p.released_amount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            Active Escrow Positions
          </CardTitle>
          <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600">
            <Lock className="h-3 w-3" />
            {formatPKR(totalLocked)} locked
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No active escrow positions</p>
            <p className="text-xs mt-1">Funds are locked when you accept deals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position, index) => {
              const releasePercent =
                position.total_amount > 0
                  ? (position.released_amount / position.total_amount) * 100
                  : 0;
              const isDisputed = position.status === "disputed";
              const cfg = statusConfig[position.status] || { label: position.status, variant: "secondary" as const };

              return (
                <motion.div
                  key={position.deal_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 rounded-lg border transition-all hover:shadow-sm",
                    isDisputed
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-amber-500/20 bg-amber-500/5"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate">
                        {position.deal_title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={cfg.variant} className="text-xs">
                          {cfg.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          as {position.role === "buyer" ? "Client" : "Provider"}
                        </span>
                      </div>
                    </div>
                    <Link to={`/deals/${position.deal_id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>

                  {/* Disputed warning */}
                  {isDisputed && (
                    <div className="flex items-center gap-2 p-2 mb-3 bg-destructive/10 rounded text-destructive text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                      Funds frozen — dispute in progress
                    </div>
                  )}

                  {/* Financial breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="p-2 rounded bg-background/80">
                      <Lock className="h-3.5 w-3.5 mx-auto text-amber-500 mb-0.5" />
                      <p className="text-xs font-semibold">{formatPKR(position.locked_amount)}</p>
                      <p className="text-[10px] text-muted-foreground">Locked</p>
                    </div>
                    <div className="p-2 rounded bg-background/80">
                      <Unlock className="h-3.5 w-3.5 mx-auto text-emerald-500 mb-0.5" />
                      <p className="text-xs font-semibold">{formatPKR(position.released_amount)}</p>
                      <p className="text-[10px] text-muted-foreground">Released</p>
                    </div>
                    <div className="p-2 rounded bg-background/80">
                      <Clock className="h-3.5 w-3.5 mx-auto text-blue-500 mb-0.5" />
                      <p className="text-xs font-semibold">{formatPKR(position.pending_release)}</p>
                      <p className="text-[10px] text-muted-foreground">Pending</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {position.milestones_released}/{position.milestones_total} milestones
                      </span>
                      <span>{Math.round(releasePercent)}% released</span>
                    </div>
                    <Progress value={releasePercent} className="h-1.5" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
