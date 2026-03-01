/**
 * StatusBadge — Unified status indicator for the entire platform.
 * Strict color mapping. No custom badges per page.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-tight transition-colors",
  {
    variants: {
      status: {
        // Execution states
        draft: "bg-muted/60 text-muted-foreground border-border",
        pending: "bg-muted/60 text-muted-foreground border-border",
        inactive: "bg-muted/60 text-muted-foreground border-border",

        // Active / In-Progress (blue)
        active: "bg-primary/10 text-primary border-primary/20",
        in_progress: "bg-primary/10 text-primary border-primary/20",
        funded: "bg-primary/10 text-primary border-primary/20",
        escrow_funded: "bg-primary/10 text-primary border-primary/20",
        negotiating: "bg-primary/10 text-primary border-primary/20",
        open: "bg-primary/10 text-primary border-primary/20",

        // Submitted / Pending Review (amber)
        submitted: "bg-warning/10 text-warning border-warning/20",
        milestone_submitted: "bg-warning/10 text-warning border-warning/20",
        under_review: "bg-warning/10 text-warning border-warning/20",
        awaiting: "bg-warning/10 text-warning border-warning/20",

        // Success (green)
        approved: "bg-success/10 text-success border-success/20",
        milestone_approved: "bg-success/10 text-success border-success/20",
        completed: "bg-success/10 text-success border-success/20",
        resolved: "bg-success/10 text-success border-success/20",
        released: "bg-success/10 text-success border-success/20",
        verified: "bg-success/10 text-success border-success/20",
        accepted: "bg-success/10 text-success border-success/20",

        // Danger (red)
        rejected: "bg-destructive/10 text-destructive border-destructive/20",
        disputed: "bg-destructive/10 text-destructive border-destructive/20",
        failed: "bg-destructive/10 text-destructive border-destructive/20",
        cancelled: "bg-destructive/10 text-destructive border-destructive/20",
        overdue: "bg-destructive/10 text-destructive border-destructive/20",
      },
      size: {
        sm: "text-[10px] px-1.5 py-px",
        default: "text-[11px] px-2 py-0.5",
        lg: "text-xs px-2.5 py-1",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "default",
    },
  }
);

// Human-readable labels
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Pending",
  inactive: "Inactive",
  active: "Active",
  in_progress: "In Progress",
  funded: "Funded",
  escrow_funded: "Escrow Funded",
  negotiating: "Negotiating",
  open: "Open",
  submitted: "Submitted",
  milestone_submitted: "Submitted",
  under_review: "Under Review",
  awaiting: "Awaiting",
  approved: "Approved",
  milestone_approved: "Approved",
  completed: "Completed",
  resolved: "Resolved",
  released: "Released",
  verified: "Verified",
  accepted: "Accepted",
  rejected: "Rejected",
  disputed: "Disputed",
  failed: "Failed",
  cancelled: "Cancelled",
  overdue: "Overdue",
};

// Dot color for indicator
const STATUS_DOT_COLORS: Record<string, string> = {
  draft: "bg-muted-foreground",
  pending: "bg-muted-foreground",
  inactive: "bg-muted-foreground",
  active: "bg-primary",
  in_progress: "bg-primary",
  funded: "bg-primary",
  escrow_funded: "bg-primary",
  negotiating: "bg-primary",
  open: "bg-primary",
  submitted: "bg-warning",
  milestone_submitted: "bg-warning",
  under_review: "bg-warning",
  awaiting: "bg-warning",
  approved: "bg-success",
  milestone_approved: "bg-success",
  completed: "bg-success",
  resolved: "bg-success",
  released: "bg-success",
  verified: "bg-success",
  accepted: "bg-success",
  rejected: "bg-destructive",
  disputed: "bg-destructive",
  failed: "bg-destructive",
  cancelled: "bg-destructive",
  overdue: "bg-destructive",
};

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "status"> {
  /** The status key — must match the variant map */
  status: string;
  /** Override the display label */
  label?: string;
  /** Show status dot indicator */
  showDot?: boolean;
  /** Size variant */
  size?: "sm" | "default" | "lg";
}

export function StatusBadge({
  status,
  label,
  showDot = true,
  size,
  className,
  ...props
}: StatusBadgeProps) {
  // Normalize status key
  const normalizedStatus = status.toLowerCase().replace(/[\s-]/g, "_");
  const validStatus = normalizedStatus in STATUS_LABELS ? normalizedStatus : "pending";
  const displayLabel = label || STATUS_LABELS[validStatus] || status;
  const dotColor = STATUS_DOT_COLORS[validStatus] || "bg-muted-foreground";

  return (
    <div
      className={cn(
        statusBadgeVariants({ status: validStatus as any, size }),
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      )}
      {displayLabel}
    </div>
  );
}
