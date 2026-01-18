import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: string;
  loading?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, color = "primary", loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-16 mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className={cn(
            "p-2 rounded-full",
            color === "primary" && "bg-primary/10 text-primary",
            color === "green" && "bg-green-500/10 text-green-500",
            color === "yellow" && "bg-yellow-500/10 text-yellow-500",
            color === "red" && "bg-red-500/10 text-red-500",
            color === "blue" && "bg-blue-500/10 text-blue-500",
          )}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs mt-1",
              trend.positive ? "text-green-500" : "text-red-500"
            )}>
              {trend.positive ? "+" : "-"}{Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickStatsProps {
  stats: StatCardProps[];
  loading?: boolean;
}

export function QuickStats({ stats, loading }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} loading={loading} />
      ))}
    </div>
  );
}
