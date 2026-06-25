export type ServiceFlowStepStatus = "complete" | "in_progress" | "missing" | "review";
export type ServiceDraftStatus = "draft" | "needs_review" | "ready";

export type CreateServiceFlowStep = {
  id: string;
  title: string;
  status: ServiceFlowStepStatus;
  description: string;
  requiredFields: string[];
  reviewNote: string;
};

export type ServiceDraftRequirement = {
  id: string;
  label: string;
  completed: boolean;
};

export type CreateServiceDraft = {
  id: string;
  title: string;
  status: ServiceDraftStatus;
  category: string;
  priceLabel: string;
  deliveryLabel: string;
  revisionLabel: string;
  readiness: number;
  summary: string;
  includedDeliverables: string[];
  requirements: ServiceDraftRequirement[];
  steps: CreateServiceFlowStep[];
};

export const DEMO_CREATE_SERVICE_DRAFT: CreateServiceDraft = {
  id: "proposal-review-service-draft",
  title: "FYP Proposal Review and Improvement",
  status: "needs_review",
  category: "Proposal Support",
  priceLabel: "Demo price: PKR 5,000",
  deliveryLabel: "3 days",
  revisionLabel: "1 revision included",
  readiness: 76,
  summary:
    "A draft marketplace service for reviewing FYP proposals, improving scope clarity, checking methodology alignment, and preparing supervisor-ready feedback.",
  includedDeliverables: [
    "Proposal structure review",
    "Problem statement clarity notes",
    "Research gap feedback",
    "Methodology alignment checklist",
    "Supervisor-ready improvement summary",
  ],
  requirements: [
    { id: "req-title", label: "Service title and category", completed: true },
    { id: "req-scope", label: "Clear service scope", completed: true },
    { id: "req-pricing", label: "Demo pricing and delivery labels", completed: true },
    { id: "req-policy", label: "Academic integrity and originality note", completed: false },
    { id: "req-portfolio", label: "Portfolio/sample file link", completed: false },
  ],
  steps: [
    {
      id: "step-basics",
      title: "Service Basics",
      status: "complete",
      description: "Define service title, category, short summary, audience, and expected outcome.",
      requiredFields: ["Title", "Category", "Short summary", "Audience"],
      reviewNote: "Basics are ready for preview.",
    },
    {
      id: "step-deliverables",
      title: "Deliverables and Boundaries",
      status: "complete",
      description: "List exactly what the researcher will deliver and what is outside the service scope.",
      requiredFields: ["Deliverables", "Scope boundary", "Revision policy"],
      reviewNote: "Boundaries are clear enough for marketplace preview.",
    },
    {
      id: "step-pricing",
      title: "Pricing and Delivery",
      status: "review",
      description: "Set demo pricing, delivery time, revision count, and package visibility labels.",
      requiredFields: ["Price label", "Delivery time", "Revision count", "Package tier"],
      reviewNote: "Pricing is demo-only and needs real policy review before launch.",
    },
    {
      id: "step-quality",
      title: "Quality and Integrity Checks",
      status: "in_progress",
      description: "Add originality note, evidence rules, no-guarantee wording, and reviewer approval requirements.",
      requiredFields: ["Originality note", "Evidence rule", "No-guarantee wording", "Review checklist"],
      reviewNote: "Academic integrity note is still missing.",
    },
    {
      id: "step-publish",
      title: "Submit for Marketplace Review",
      status: "missing",
      description: "Submit the service draft for moderation, profile verification, and publishing approval.",
      requiredFields: ["Verified profile", "Portfolio sample", "Policy labels", "Moderation status"],
      reviewNote: "Publishing is locked until review checks pass.",
    },
  ],
};

export function getServiceDraftStatusLabel(status: ServiceDraftStatus): string {
  if (status === "ready") return "Ready";
  if (status === "needs_review") return "Needs Review";
  return "Draft";
}

export function getServiceDraftStatusClass(status: ServiceDraftStatus): string {
  if (status === "ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getServiceFlowStepStatusLabel(status: ServiceFlowStepStatus): string {
  if (status === "complete") return "Complete";
  if (status === "in_progress") return "In Progress";
  if (status === "review") return "Review";
  return "Missing";
}

export function getServiceFlowStepStatusClass(status: ServiceFlowStepStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "in_progress") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "review") return "bg-primary/10 text-primary border-primary/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getServiceFlowCounts(draft: CreateServiceDraft = DEMO_CREATE_SERVICE_DRAFT) {
  return {
    totalSteps: draft.steps.length,
    completeSteps: draft.steps.filter((step) => step.status === "complete").length,
    missingSteps: draft.steps.filter((step) => step.status === "missing").length,
    completedRequirements: draft.requirements.filter((requirement) => requirement.completed).length,
  };
}
