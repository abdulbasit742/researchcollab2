/**
 * MilestoneActionGuard — Renders action buttons with state + role checks and tooltip explanations.
 * Does NOT modify any transition logic. Pure UI guard.
 */

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Upload, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MilestoneActionGuardProps {
  milestoneStatus: string;
  dealStatus: string;
  userRole: "initiator" | "executor";
  escrowFunded: boolean;
  onSubmit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDispute?: () => void;
  isSubmitting?: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
}

interface GuardResult {
  allowed: boolean;
  reason: string;
}

function canSubmit(milestoneStatus: string, dealStatus: string, userRole: string, escrowFunded: boolean): GuardResult {
  if (userRole !== "executor") return { allowed: false, reason: "Only the executor can submit milestones" };
  if (!escrowFunded) return { allowed: false, reason: "Escrow must be funded before submission" };
  if (dealStatus === "disputed") return { allowed: false, reason: "Cannot submit during an active dispute" };
  if (dealStatus === "cancelled") return { allowed: false, reason: "Deal has been cancelled" };
  if (milestoneStatus === "approved") return { allowed: false, reason: "Milestone already approved" };
  if (milestoneStatus === "submitted") return { allowed: false, reason: "Already submitted — awaiting review" };
  if (milestoneStatus === "pending") return { allowed: false, reason: "Milestone not yet started" };
  if (milestoneStatus !== "in_progress" && milestoneStatus !== "rejected") {
    return { allowed: false, reason: `Cannot submit in "${milestoneStatus}" state` };
  }
  return { allowed: true, reason: "Submit this milestone for review" };
}

function canApprove(milestoneStatus: string, dealStatus: string, userRole: string): GuardResult {
  if (userRole !== "initiator") return { allowed: false, reason: "Only the sponsor can approve milestones" };
  if (milestoneStatus !== "submitted") return { allowed: false, reason: "Milestone must be submitted before approval" };
  if (dealStatus === "disputed") return { allowed: false, reason: "Cannot approve during an active dispute" };
  return { allowed: true, reason: "Approve and release funds for this milestone" };
}

function canReject(milestoneStatus: string, dealStatus: string, userRole: string): GuardResult {
  if (userRole !== "initiator") return { allowed: false, reason: "Only the sponsor can request changes" };
  if (milestoneStatus !== "submitted") return { allowed: false, reason: "No submission to review" };
  if (dealStatus === "disputed") return { allowed: false, reason: "Cannot reject during an active dispute" };
  return { allowed: true, reason: "Request changes on this milestone" };
}

function canDispute(dealStatus: string): GuardResult {
  if (dealStatus === "disputed") return { allowed: false, reason: "Dispute already active" };
  if (dealStatus === "completed") return { allowed: false, reason: "Deal already completed" };
  if (dealStatus === "cancelled") return { allowed: false, reason: "Deal already cancelled" };
  if (dealStatus === "draft" || dealStatus === "submitted") return { allowed: false, reason: "Deal not yet in execution" };
  return { allowed: true, reason: "Raise a formal dispute about this deal" };
}

function GuardedButton({
  guard,
  onClick,
  isPending,
  pendingLabel,
  label,
  icon: Icon,
  variant = "default",
}: {
  guard: GuardResult;
  onClick?: () => void;
  isPending?: boolean;
  pendingLabel: string;
  label: string;
  icon: React.ElementType;
  variant?: "default" | "outline" | "destructive" | "ghost";
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Button
              size="sm"
              variant={variant}
              className="gap-1.5"
              disabled={!guard.allowed || isPending}
              onClick={guard.allowed ? onClick : undefined}
            >
              <Icon className="h-3.5 w-3.5" />
              {isPending ? pendingLabel : label}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs max-w-[200px]">{guard.reason}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function MilestoneActionGuard({
  milestoneStatus,
  dealStatus,
  userRole,
  escrowFunded,
  onSubmit,
  onApprove,
  onReject,
  onDispute,
  isSubmitting,
  isApproving,
  isRejecting,
}: MilestoneActionGuardProps) {
  const submitGuard = canSubmit(milestoneStatus, dealStatus, userRole, escrowFunded);
  const approveGuard = canApprove(milestoneStatus, dealStatus, userRole);
  const rejectGuard = canReject(milestoneStatus, dealStatus, userRole);
  const disputeGuard = canDispute(dealStatus);

  const showSubmit = userRole === "executor";
  const showApproveReject = userRole === "initiator";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {showSubmit && (
        <GuardedButton
          guard={submitGuard}
          onClick={onSubmit}
          isPending={isSubmitting}
          pendingLabel="Submitting..."
          label="Submit"
          icon={Upload}
        />
      )}
      {showApproveReject && (
        <>
          <GuardedButton
            guard={approveGuard}
            onClick={onApprove}
            isPending={isApproving}
            pendingLabel="Approving..."
            label="Approve & Release"
            icon={CheckCircle}
          />
          <GuardedButton
            guard={rejectGuard}
            onClick={onReject}
            isPending={isRejecting}
            pendingLabel="Rejecting..."
            label="Request Changes"
            icon={XCircle}
            variant="outline"
          />
        </>
      )}
      <GuardedButton
        guard={disputeGuard}
        onClick={onDispute}
        isPending={false}
        pendingLabel=""
        label="Dispute"
        icon={AlertTriangle}
        variant="destructive"
      />
    </div>
  );
}
