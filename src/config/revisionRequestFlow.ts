export type RevisionRequestStatus = "draft" | "submitted" | "seller_review" | "accepted" | "rejected";
export type RevisionRequestScope = "included" | "extra" | "unclear";
export type RevisionRequestPriority = "low" | "medium" | "high";
export type RevisionChecklistStatus = "complete" | "missing" | "needs_review";

export type RevisionRequestReason = {
  id: string;
  label: string;
  scope: RevisionRequestScope;
  priority: RevisionRequestPriority;
  detail: string;
};

export type RevisionRequestChecklistItem = {
  id: string;
  label: string;
  status: RevisionChecklistStatus;
};

export type RevisionRequestResponse = {
  responder: string;
  status: RevisionRequestStatus;
  responseLabel: string;
  responseSummary: string;
  nextStep: string;
};

export type RevisionRequestFlow = {
  id: string;
  orderTitle: string;
  deliverableTitle: string;
  buyerName: string;
  sellerName: string;
  status: RevisionRequestStatus;
  dueLabel: string;
  requestSummary: string;
  reasons: RevisionRequestReason[];
  checklist: RevisionRequestChecklistItem[];
  sellerResponse: RevisionRequestResponse;
};

export const DEMO_REVISION_REQUEST_FLOW: RevisionRequestFlow = {
  id: "revision-proposal-comments",
  orderTitle: "FYP Proposal Review and Improvement",
  deliverableTitle: "Proposal Review Comments",
  buyerName: "Student Research Team",
  sellerName: "Dr. Amina Research Studio",
  status: "seller_review",
  dueLabel: "Response due in 24 hours",
  requestSummary:
    "Buyer wants the proposal review comments to include clearer university-format feedback and a separate methodology action list before accepting the deliverable.",
  reasons: [
    {
      id: "reason-format",
      label: "University format comments missing",
      scope: "included",
      priority: "high",
      detail: "Buyer uploaded a format guide, so the review should mention whether sections match the expected proposal structure.",
    },
    {
      id: "reason-method-list",
      label: "Methodology actions need separation",
      scope: "included",
      priority: "medium",
      detail: "Methodology feedback is present but should be separated into a short action checklist.",
    },
    {
      id: "reason-extra-viva",
      label: "Add viva questions to same file",
      scope: "extra",
      priority: "low",
      detail: "Viva question bank was not included in the selected package and may need a separate order or add-on.",
    },
  ],
  checklist: [
    { id: "check-linked-deliverable", label: "Linked to submitted deliverable", status: "complete" },
    { id: "check-within-scope", label: "Main request within package scope", status: "needs_review" },
    { id: "check-clear-comments", label: "Buyer comments are specific", status: "complete" },
    { id: "check-extra-items", label: "Extra add-on items separated", status: "missing" },
  ],
  sellerResponse: {
    responder: "Dr. Amina Research Studio",
    status: "seller_review",
    responseLabel: "Seller reviewing scope",
    responseSummary:
      "Seller can revise university-format feedback and methodology action list, but viva questions should remain outside this revision request.",
    nextStep: "Buyer should confirm that viva questions are removed from this revision before seller prepares the revised file.",
  },
};

export function getRevisionRequestStatusLabel(status: RevisionRequestStatus): string {
  if (status === "submitted") return "Submitted";
  if (status === "seller_review") return "Seller Review";
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Rejected";
  return "Draft";
}

export function getRevisionRequestStatusClass(status: RevisionRequestStatus): string {
  if (status === "accepted") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "seller_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "submitted") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  if (status === "rejected") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getRevisionRequestScopeLabel(scope: RevisionRequestScope): string {
  if (scope === "included") return "Included";
  if (scope === "extra") return "Extra";
  return "Unclear";
}

export function getRevisionRequestScopeClass(scope: RevisionRequestScope): string {
  if (scope === "included") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (scope === "extra") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-amber-500/10 text-amber-600 border-amber-500/30";
}

export function getRevisionRequestPriorityClass(priority: RevisionRequestPriority): string {
  if (priority === "high") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (priority === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
}

export function getRevisionChecklistStatusLabel(status: RevisionChecklistStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getRevisionChecklistStatusClass(status: RevisionChecklistStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getRevisionRequestCounts(flow: RevisionRequestFlow = DEMO_REVISION_REQUEST_FLOW) {
  return {
    reasons: flow.reasons.length,
    included: flow.reasons.filter((reason) => reason.scope === "included").length,
    extra: flow.reasons.filter((reason) => reason.scope === "extra").length,
    missingChecks: flow.checklist.filter((item) => item.status === "missing").length,
  };
}
