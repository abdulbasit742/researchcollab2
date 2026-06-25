export type DisputeStatus = "draft" | "opened" | "review" | "resolved" | "closed";
export type DisputeReasonCategory = "scope" | "quality" | "delivery" | "communication" | "payment_label";
export type DisputeSeverity = "low" | "medium" | "high";
export type DisputeEvidenceStatus = "attached" | "missing" | "needs_review";

export type DisputeEvidenceItem = {
  id: string;
  title: string;
  status: DisputeEvidenceStatus;
  owner: string;
  note: string;
};

export type DisputeTimelineEvent = {
  id: string;
  timeLabel: string;
  actor: string;
  event: string;
};

export type DisputeReviewCheck = {
  id: string;
  label: string;
  completed: boolean;
};

export type DisputeCase = {
  id: string;
  orderTitle: string;
  buyerName: string;
  sellerName: string;
  status: DisputeStatus;
  category: DisputeReasonCategory;
  severity: DisputeSeverity;
  summary: string;
  requestedResolution: string;
  moderatorNote: string;
  evidence: DisputeEvidenceItem[];
  timeline: DisputeTimelineEvent[];
  reviewChecks: DisputeReviewCheck[];
};

export const DEMO_DISPUTE_CASE: DisputeCase = {
  id: "dispute-proposal-review-scope",
  orderTitle: "FYP Proposal Review and Improvement",
  buyerName: "Student Research Team",
  sellerName: "Dr. Amina Research Studio",
  status: "review",
  category: "scope",
  severity: "medium",
  summary:
    "Buyer and seller need neutral review because one revision request includes package-scope items and one extra viva-prep item outside the selected package.",
  requestedResolution:
    "Approve in-scope format and methodology revisions, separate viva-prep request as an add-on, and keep demo payment labels locked.",
  moderatorNote:
    "This placeholder does not decide refunds or move funds. It only models evidence collection, scope review, and neutral moderation notes.",
  evidence: [
    {
      id: "evidence-order-terms",
      title: "Selected package terms",
      status: "attached",
      owner: "System",
      note: "Standard package includes proposal review and methodology checklist but not full viva question bank.",
    },
    {
      id: "evidence-deliverable",
      title: "Submitted proposal comments file",
      status: "attached",
      owner: "Seller",
      note: "Buyer says university-format feedback needs clearer section notes.",
    },
    {
      id: "evidence-buyer-request",
      title: "Buyer revision request",
      status: "needs_review",
      owner: "Buyer",
      note: "Request mixes included revision items with an extra viva-prep item.",
    },
    {
      id: "evidence-payment-proof",
      title: "Real payment proof",
      status: "missing",
      owner: "System",
      note: "Not applicable in demo mode because checkout does not move real money.",
    },
  ],
  timeline: [
    { id: "event-order-created", timeLabel: "Today, 13:25", actor: "System", event: "Demo order workroom created." },
    { id: "event-deliverable-submitted", timeLabel: "Today, 14:10", actor: "Seller", event: "Proposal review comments submitted for buyer review." },
    { id: "event-revision-requested", timeLabel: "Today, 14:45", actor: "Buyer", event: "Buyer requested revision with format, methodology, and viva-prep notes." },
    { id: "event-dispute-opened", timeLabel: "Today, 15:05", actor: "System", event: "Dispute placeholder opened for neutral scope review." },
  ],
  reviewChecks: [
    { id: "check-order-terms", label: "Package terms reviewed", completed: true },
    { id: "check-evidence-attached", label: "Core evidence attached", completed: true },
    { id: "check-extra-scope", label: "Extra-scope item separated", completed: false },
    { id: "check-resolution-note", label: "Moderator resolution note drafted", completed: false },
  ],
};

export function getDisputeStatusLabel(status: DisputeStatus): string {
  if (status === "opened") return "Opened";
  if (status === "review") return "Under Review";
  if (status === "resolved") return "Resolved";
  if (status === "closed") return "Closed";
  return "Draft";
}

export function getDisputeStatusClass(status: DisputeStatus): string {
  if (status === "resolved") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "opened") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  if (status === "closed") return "bg-muted text-muted-foreground border-border";
  return "bg-muted text-muted-foreground border-border";
}

export function getDisputeCategoryLabel(category: DisputeReasonCategory): string {
  if (category === "scope") return "Scope";
  if (category === "quality") return "Quality";
  if (category === "delivery") return "Delivery";
  if (category === "communication") return "Communication";
  return "Payment Label";
}

export function getDisputeSeverityClass(severity: DisputeSeverity): string {
  if (severity === "high") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (severity === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
}

export function getDisputeEvidenceStatusLabel(status: DisputeEvidenceStatus): string {
  if (status === "attached") return "Attached";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getDisputeEvidenceStatusClass(status: DisputeEvidenceStatus): string {
  if (status === "attached") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getDisputeCounts(dispute: DisputeCase = DEMO_DISPUTE_CASE) {
  return {
    evidence: dispute.evidence.length,
    attachedEvidence: dispute.evidence.filter((item) => item.status === "attached").length,
    missingEvidence: dispute.evidence.filter((item) => item.status === "missing").length,
    completedChecks: dispute.reviewChecks.filter((check) => check.completed).length,
  };
}
