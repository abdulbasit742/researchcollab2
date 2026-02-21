import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPKR } from "@/lib/currency";
import { Shield, Lock, Unlock, DollarSign, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Milestone {
  title: string;
  amount: number;
  status: "locked" | "submitted" | "approved" | "released";
}

interface EscrowFeeBreakdownProps {
  totalAmount: number;
  lockedAmount: number;
  releasedAmount: number;
  platformFeeRate: number;
  milestones: Milestone[];
  status: string;
  className?: string;
}

const msStatusConfig: Record<string, { icon: typeof Lock; color: string; label: string }> = {
  locked: { icon: Lock, color: "text-amber-500", label: "Locked" },
  submitted: { icon: ArrowRight, color: "text-blue-500", label: "Submitted" },
  approved: { icon: CheckCircle2, color: "text-emerald-500", label: "Approved" },
  released: { icon: Unlock, color: "text-emerald-600", label: "Released" },
};

export function EscrowFeeBreakdown({
  totalAmount,
  lockedAmount,
  releasedAmount,
  platformFeeRate,
  milestones,
  status,
  className,
}: EscrowFeeBreakdownProps) {
  const feeAmount = totalAmount * platformFeeRate;
  const studentReceives = totalAmount - feeAmount;
  const releasePercent = totalAmount > 0 ? (releasedAmount / totalAmount) * 100 : 0;
  const isDisputed = status === "disputed";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Fee & Fund Breakdown
          <Badge variant="outline" className="ml-auto text-xs">
            Transparent
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
            <Lock className="h-4 w-4 mx-auto text-amber-500 mb-1" />
            <p className="text-sm font-bold">{formatPKR(lockedAmount)}</p>
            <p className="text-[10px] text-muted-foreground">In Escrow</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
            <Unlock className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
            <p className="text-sm font-bold">{formatPKR(releasedAmount)}</p>
            <p className="text-[10px] text-muted-foreground">Released</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border text-center">
            <Shield className="h-4 w-4 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold">{formatPKR(totalAmount)}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Release Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(releasePercent)}% released</span>
            <span>{formatPKR(totalAmount - releasedAmount)} remaining</span>
          </div>
          <Progress value={releasePercent} className="h-2" />
        </div>

        {/* Fee Transparency */}
        <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fee Transparency</h4>
          <div className="flex justify-between text-sm">
            <span>Total Project Value</span>
            <span className="font-semibold">{formatPKR(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="underline decoration-dotted cursor-help">
                  Platform Fee ({(platformFeeRate * 100).toFixed(0)}%)
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Trust-weighted commission rate</p>
              </TooltipContent>
            </Tooltip>
            <span className="text-muted-foreground">−{formatPKR(feeAmount)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-sm font-bold">
            <span>Student Receives</span>
            <span className="text-emerald-600">{formatPKR(studentReceives)}</span>
          </div>
        </div>

        {/* Milestone Funding Bar */}
        {milestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Milestone Funding</h4>
            {milestones.map((ms, i) => {
              const cfg = msStatusConfig[ms.status] || msStatusConfig.locked;
              const Icon = cfg.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", cfg.color)} />
                  <span className="flex-1 truncate">{ms.title}</span>
                  <Badge variant="outline" className={cn("text-[10px]", cfg.color)}>
                    {cfg.label}
                  </Badge>
                  <span className="font-semibold text-xs">{formatPKR(ms.amount)}</span>
                </div>
              );
            })}
          </div>
        )}

        {isDisputed && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-destructive text-xs">
            <AlertTriangle className="h-3.5 w-3.5" />
            All fund releases paused — dispute in progress
          </div>
        )}
      </CardContent>
    </Card>
  );
}
