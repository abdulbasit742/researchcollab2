import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, Shield, TrendingUp } from "lucide-react";

const stats = [
  { icon: Users, label: "Active Users", value: "12.4K", change: "+8%" },
  { icon: Briefcase, label: "FYPs Funded", value: "3,240", change: "+12%" },
  { icon: Shield, label: "Avg Trust", value: "72.3", change: "+3%" },
  { icon: TrendingUp, label: "Escrow Vol.", value: "PKR 48M", change: "+15%" },
];

export function PlatformStatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{stat.value}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
                <span className="text-[10px] text-emerald-500 font-medium">{stat.change}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
