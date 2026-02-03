import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatPKR } from "@/lib/currency";
import { Shield, Lock, Unlock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EscrowStatusCardProps {
  lockedAmount: number;
  releasedAmount: number;
  totalAmount: number;
  status: string;
}

export function EscrowStatusCard({
  lockedAmount,
  releasedAmount,
  totalAmount,
  status,
}: EscrowStatusCardProps) {
  const remainingInEscrow = lockedAmount - releasedAmount;
  const releasePercent = totalAmount > 0 ? (releasedAmount / totalAmount) * 100 : 0;

  const isDisputed = status === "disputed";
  const isCompleted = status === "completed";

  return (
    <Card className={cn(
      "border-2",
      isDisputed && "border-destructive/50 bg-destructive/5",
      !isDisputed && lockedAmount > 0 && "border-amber-500/30 bg-amber-500/5"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className={cn(
            "h-5 w-5",
            isDisputed ? "text-destructive" : "text-amber-500"
          )} />
          Escrow Protection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDisputed && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            Funds frozen due to active dispute
          </div>
        )}

        {/* Escrow Amounts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-500" />
              <span className="text-sm">In Escrow</span>
            </div>
            <span className="font-semibold">{formatPKR(remainingInEscrow)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Unlock className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">Released</span>
            </div>
            <span className="font-semibold text-emerald-600">{formatPKR(releasedAmount)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={releasePercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(releasePercent)}% released</span>
            <span>Total: {formatPKR(totalAmount)}</span>
          </div>
        </div>

        {/* Security Note */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {isCompleted 
              ? "All funds have been released. Deal completed successfully."
              : "Funds are protected by escrow until milestones are approved."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
