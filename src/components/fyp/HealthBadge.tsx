import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, XCircle } from "lucide-react";

type HealthLevel = "healthy" | "at-risk" | "critical";

interface HealthBadgeProps {
  level: HealthLevel;
  score?: number;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const config: Record<HealthLevel, { label: string; icon: typeof Shield; bg: string; text: string; dot: string }> = {
  healthy: {
    label: "Healthy",
    icon: Shield,
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  "at-risk": {
    label: "At Risk",
    icon: AlertTriangle,
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning",
  },
  critical: {
    label: "Critical",
    icon: XCircle,
    bg: "bg-critical/10",
    text: "text-critical",
    dot: "bg-critical",
  },
};

export function HealthBadge({ level, score, showLabel = true, size = "sm", className }: HealthBadgeProps) {
  const c = config[level];
  const Icon = c.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        c.bg, c.text,
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", c.dot)} />
      {showLabel && <span>{c.label}</span>}
      {score !== undefined && <span className="font-bold">{score}</span>}
    </div>
  );
}
