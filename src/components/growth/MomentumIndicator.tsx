import { useProjectMomentum, MomentumLevel } from "@/hooks/useProjectMomentum";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const MOMENTUM_CONFIG: Record<MomentumLevel, { label: string; icon: React.ElementType; className: string }> = {
  high: { label: "High Momentum", icon: TrendingUp, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  stable: { label: "Stable", icon: Activity, className: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  slowing: { label: "Slowing", icon: TrendingDown, className: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  at_risk: { label: "At Risk", icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/30" },
};

export function MomentumIndicator({ projectId }: { projectId: string }) {
  const { data: momentum, isLoading } = useProjectMomentum(projectId);

  if (isLoading || !momentum) return null;

  const config = MOMENTUM_CONFIG[momentum.level];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
