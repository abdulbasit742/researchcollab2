import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Standardized status chip with unified color mapping.
 * Use this instead of ad-hoc Badge + className combos.
 */

const STATUS_MAP: Record<string, { className: string; label?: string }> = {
  // Milestone / Deal states
  draft: { className: "bg-muted text-muted-foreground border-transparent" },
  pending: { className: "bg-muted text-muted-foreground border-transparent" },
  funded: { className: "bg-primary/10 text-primary border-transparent" },
  in_progress: { className: "bg-primary/10 text-primary border-transparent", label: "In Progress" },
  submitted: { className: "bg-warning/10 text-warning border-transparent" },
  under_review: { className: "bg-warning/10 text-warning border-transparent", label: "Under Review" },
  approved: { className: "bg-success/10 text-success border-transparent" },
  released: { className: "bg-success/10 text-success border-transparent" },
  completed: { className: "bg-success/10 text-success border-transparent" },
  disputed: { className: "bg-destructive/10 text-destructive border-transparent" },
  rejected: { className: "bg-destructive/10 text-destructive border-transparent" },
  resolved: { className: "bg-muted text-muted-foreground border-transparent" },
  cancelled: { className: "bg-muted text-muted-foreground border-transparent" },
  expired: { className: "bg-muted text-muted-foreground border-transparent" },

  // Health states
  healthy: { className: "bg-success/10 text-success border-transparent" },
  at_risk: { className: "bg-warning/10 text-warning border-transparent", label: "At Risk" },
  critical: { className: "bg-destructive/10 text-destructive border-transparent" },
  stalled: { className: "bg-destructive/10 text-destructive border-transparent" },

  // Generic
  active: { className: "bg-success/10 text-success border-transparent" },
  inactive: { className: "bg-muted text-muted-foreground border-transparent" },
  open: { className: "bg-primary/10 text-primary border-transparent" },
  closed: { className: "bg-muted text-muted-foreground border-transparent" },
};

interface StatusChipProps {
  status: string;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const normalized = status.toLowerCase().replace(/[\s-]/g, "_");
  const config = STATUS_MAP[normalized];
  const label = config?.label || status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <Badge
      className={cn(
        "text-[10px] font-semibold tracking-wide",
        config?.className || "bg-muted text-muted-foreground border-transparent",
        className
      )}
    >
      {label}
    </Badge>
  );
}
