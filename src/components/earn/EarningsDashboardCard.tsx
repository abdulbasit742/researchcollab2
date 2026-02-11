import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Briefcase, Target } from "lucide-react";
import { formatPKR } from "@/lib/currency";
import { EarningBid } from "@/hooks/useEarning";
import { cn } from "@/lib/utils";

interface EarningsDashboardCardProps {
  bids: EarningBid[];
}

export function EarningsDashboardCard({ bids }: EarningsDashboardCardProps) {
  const totalBids = bids.length;
  const totalBidAmount = bids.reduce((sum, b) => sum + (b.amount || 0), 0);
  const avgBid = totalBids > 0 ? Math.round(totalBidAmount / totalBids) : 0;
  // For now, accepted/completed stats are mocked since we don't have bid status yet
  const activeBids = totalBids;
  const successRate = totalBids > 0 ? Math.round((0 / totalBids) * 100) : 0;

  const stats = [
    { label: "Total Bids", value: totalBids.toString(), icon: Briefcase, color: "text-primary" },
    { label: "Avg Bid", value: formatPKR(avgBid), icon: DollarSign, color: "text-emerald-500" },
    { label: "Active", value: activeBids.toString(), icon: Target, color: "text-amber-500" },
    { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp, color: "text-blue-500" },
  ];

  if (totalBids === 0) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 sm:gap-3">
              <div className={cn("p-1.5 sm:p-2 rounded-lg bg-muted", stat.color)}>
                <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-semibold text-xs sm:text-sm">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

