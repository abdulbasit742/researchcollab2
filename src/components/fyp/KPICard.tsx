import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, className }: KPICardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-5 transition-shadow hover:shadow-md",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        {Icon && (
          <div className="h-8 w-8 rounded-md bg-primary/8 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {trend && trendValue && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium",
            trend === "up" && "text-success",
            trend === "down" && "text-critical",
            trend === "neutral" && "text-muted-foreground"
          )}>
            <TrendIcon className="h-3 w-3" />
            {trendValue}
          </span>
        )}
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  );
}
