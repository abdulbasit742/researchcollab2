export type DeliverableStatus = "not_started" | "in_progress" | "submitted" | "accepted" | "revision_needed";
export type DeliverablePriority = "low" | "medium" | "high";
export type DeliverableReviewCheckStatus = "passed" | "pending" | "failed";

export type DeliverableReviewCheck = {
  id: string;
  label: string;
  status: DeliverableReviewCheckStatus;
};

export type OrderDeliverable = {
  id: string;
  title: string;
  status: DeliverableStatus;
  priority: DeliverablePriority;
  dueLabel: string;
  owner: string;
  fileName: string;
  summary: string;
  reviewChecks: DeliverableReviewCheck[];
  nextAction: string;
};

export const ORDER_DELIVERABLES: OrderDeliverable[] = [
  {
    id: "deliverable-proposal-comments",
    title: "Proposal Review Comments",
    status: "submitted",
    priority: "high",
    dueLabel: "Day 3",
    owner: "Seller",
    fileName: "Proposal_Review_Comments.docx",
    summary: "Structured comments covering problem statement, scope clarity, research gap, and methodology alignment.",
    reviewChecks: [
      { id: "check-readable", label: "Readable comments", status: "passed" },
      { id: "check-scope", label: "Scope issues identified", status: "passed" },
      { id: "check-format", label: "University format considered", status: "pending" },
    ],
    nextAction: "Buyer should confirm whether university format comments are required before acceptance.",
  },
  {
    id: "deliverable-methodology-checklist",
    title: "Methodology Alignment Checklist",
    status: "in_progress",
    priority: "high",
    dueLabel: "Day 4",
    owner: "Seller",
    fileName: "Methodology_Checklist.xlsx",
    summary: "Checklist mapping objectives, method choices, validation evidence, and expected final report sections.",
    reviewChecks: [
      { id: "check-objectives", label: "Objectives mapped", status: "passed" },
      { id: "check-validation", label: "Validation notes complete", status: "pending" },
      { id: "check-evidence", label: "Evidence files linked", status: "pending" },
    ],
    nextAction: "Seller should complete validation and evidence notes before submission.",
  },
  {
    id: "deliverable-improvement-summary",
    title: "Final Improvement Summary",
    status: "not_started",
    priority: "medium",
    dueLabel: "Day 5",
    owner: "Seller",
    fileName: "Final_Improvement_Summary.pdf",
    summary: "Final summary of what the student team should fix before supervisor review and viva preparation.",
    reviewChecks: [
      { id: "check-summary", label: "Summary drafted", status: "pending" },
      { id: "check-actions", label: "Action list included", status: "pending" },
      { id: "check-risk", label: "Risk wording reviewed", status: "pending" },
    ],
    nextAction: "Blocked until first review notes and methodology checklist are complete.",
  },
  {
    id: "deliverable-revision-response",
    title: "Revision Response Notes",
    status: "revision_needed",
    priority: "medium",
    dueLabel: "After buyer review",
    owner: "Buyer + Seller",
    fileName: "Revision_Response_Notes.md",
    summary: "Shared notes documenting buyer questions, seller responses, and agreed revision scope.",
    reviewChecks: [
      { id: "check-questions", label: "Buyer questions listed", status: "failed" },
      { id: "check-response", label: "Seller responses added", status: "pending" },
      { id: "check-agreement", label: "Revision scope confirmed", status: "pending" },
    ],
    nextAction: "Buyer should list questions clearly before seller prepares revision response.",
  },
];

export function getDeliverableStatusLabel(status: DeliverableStatus): string {
  if (status === "accepted") return "Accepted";
  if (status === "submitted") return "Submitted";
  if (status === "in_progress") return "In Progress";
  if (status === "revision_needed") return "Revision Needed";
  return "Not Started";
}

export function getDeliverableStatusClass(status: DeliverableStatus): string {
  if (status === "accepted") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "submitted") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  if (status === "in_progress") return "bg-primary/10 text-primary border-primary/30";
  if (status === "revision_needed") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getDeliverablePriorityClass(priority: DeliverablePriority): string {
  if (priority === "high") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (priority === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
}

export function getDeliverableReviewCheckStatusLabel(status: DeliverableReviewCheckStatus): string {
  if (status === "passed") return "Passed";
  if (status === "failed") return "Failed";
  return "Pending";
}

export function getDeliverableReviewCheckStatusClass(status: DeliverableReviewCheckStatus): string {
  if (status === "passed") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "failed") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-amber-500/10 text-amber-600 border-amber-500/30";
}

export function getDeliverablesTrackerCounts(deliverables: OrderDeliverable[] = ORDER_DELIVERABLES) {
  return {
    total: deliverables.length,
    submitted: deliverables.filter((deliverable) => deliverable.status === "submitted").length,
    accepted: deliverables.filter((deliverable) => deliverable.status === "accepted").length,
    revisionNeeded: deliverables.filter((deliverable) => deliverable.status === "revision_needed").length,
    highPriority: deliverables.filter((deliverable) => deliverable.priority === "high").length,
  };
}
