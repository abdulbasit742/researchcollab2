import { Card, CardContent } from "@/components/ui/card";
import { calcCommission, type PlanId } from "@/lib/revenue/plans";
import { Info } from "lucide-react";

interface Props {
  gross: number;
  sellerPlan?: PlanId;
  showEscrow?: boolean;
}

export function MarketplaceCommissionBreakdown({ gross, sellerPlan = "researcher_pro", showEscrow = true }: Props) {
  const { fee, rate, net } = calcCommission(gross, sellerPlan);
  const ratePct = (rate * 100).toFixed(0);

  return (
    <Card className="border-dashed">
      <CardContent className="pt-4 space-y-2 text-sm">
        <Row label="Service price" value={`PKR ${gross.toLocaleString()}`} />
        <Row label={`Platform fee (${ratePct}%)`} value={`− PKR ${fee.toLocaleString()}`} subtle />
        {showEscrow && (
          <Row label="Held in escrow" value={`PKR ${gross.toLocaleString()}`} subtle />
        )}
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Researcher receives</span>
          <span className="text-emerald-600">PKR {net.toLocaleString()}</span>
        </div>
        <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground pt-1">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          Funds release on milestone approval. Commission rate decreases as your plan upgrades.
        </p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value, subtle }: { label: string; value: string; subtle?: boolean }) {
  return (
    <div className={`flex justify-between ${subtle ? "text-muted-foreground" : ""}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
