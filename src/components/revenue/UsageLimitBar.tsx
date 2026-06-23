import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { useUpgradeModal } from "@/contexts/UpgradeModalContext";
import type { PlanId } from "@/lib/revenue/plans";

interface UsageLimitBarProps {
  label: string;
  used: number;
  limit: number; // -1 = unlimited
  feature: string;
  recommendedPlan?: PlanId;
  unit?: string;
}

export function UsageLimitBar({ label, used, limit, feature, recommendedPlan = "student_pro", unit = "" }: UsageLimitBarProps) {
  const { prompt } = useUpgradeModal();
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const warn = pct >= 80;
  const blocked = pct >= 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-mono ${blocked ? "text-destructive" : warn ? "text-amber-600" : "text-foreground"}`}>
          {used.toLocaleString()}{unit} / {unlimited ? "∞" : `${limit.toLocaleString()}${unit}`}
        </span>
      </div>
      {!unlimited && <Progress value={pct} className={`h-1.5 ${blocked ? "[&>div]:bg-destructive" : warn ? "[&>div]:bg-amber-500" : ""}`} />}
      {warn && !unlimited && (
        <div className="flex items-center justify-between gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            {blocked ? "Limit reached" : "Approaching limit"}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[11px]"
            onClick={() => prompt({
              feature,
              reason: `You've used ${pct}% of your ${label.toLowerCase()} quota. Upgrade for more headroom.`,
              currentLimit: `${limit} ${label.toLowerCase()}`,
              recommendedPlan,
            })}
          >
            Upgrade <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
