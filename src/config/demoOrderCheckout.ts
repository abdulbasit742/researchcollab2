export type DemoOrderCheckoutStatus = "draft" | "review" | "locked" | "ready";
export type DemoOrderRequirementStatus = "complete" | "missing" | "needs_review";

export type DemoOrderRequirement = {
  id: string;
  label: string;
  status: DemoOrderRequirementStatus;
  helper: string;
};

export type DemoOrderStep = {
  id: string;
  title: string;
  status: DemoOrderCheckoutStatus;
  description: string;
  checklist: string[];
};

export type DemoOrderCheckout = {
  id: string;
  serviceTitle: string;
  selectedPackage: string;
  buyerName: string;
  sellerName: string;
  status: DemoOrderCheckoutStatus;
  priceLabel: string;
  deliveryLabel: string;
  revisionLabel: string;
  readiness: number;
  orderSummary: string;
  requirements: DemoOrderRequirement[];
  steps: DemoOrderStep[];
};

export const DEMO_ORDER_CHECKOUT: DemoOrderCheckout = {
  id: "demo-order-proposal-review",
  serviceTitle: "FYP Proposal Review and Improvement",
  selectedPackage: "Standard",
  buyerName: "Student Research Team",
  sellerName: "Dr. Amina Research Studio",
  status: "locked",
  priceLabel: "PKR 8,000 demo",
  deliveryLabel: "5 days",
  revisionLabel: "2 revisions",
  readiness: 72,
  orderSummary:
    "A demo checkout for ordering proposal review support. The flow checks buyer files, scope clarity, package terms, review rules, and no-real-payment safety labels before order creation.",
  requirements: [
    { id: "req-proposal-draft", label: "Proposal draft uploaded", status: "complete", helper: "Required for review scope." },
    { id: "req-topic", label: "Research topic provided", status: "complete", helper: "Used to align feedback." },
    { id: "req-format", label: "University format attached", status: "needs_review", helper: "Optional but recommended." },
    { id: "req-policy", label: "Academic integrity acknowledgement", status: "missing", helper: "Must be accepted before real order placement." },
    { id: "req-payment", label: "Real payment disabled", status: "complete", helper: "Demo checkout does not move funds." },
  ],
  steps: [
    {
      id: "step-package",
      title: "Confirm Package",
      status: "ready",
      description: "Review selected service tier, deliverables, delivery time, and revision count.",
      checklist: ["Package selected", "Price label visible", "Delivery label visible", "Revision label visible"],
    },
    {
      id: "step-requirements",
      title: "Upload Requirements",
      status: "review",
      description: "Collect project files, instructions, formatting requirements, and supervisor notes.",
      checklist: ["Proposal draft", "Project topic", "Reference list", "Supervisor instructions"],
    },
    {
      id: "step-safety",
      title: "Review Terms and Safety Labels",
      status: "locked",
      description: "Confirm academic integrity, demo-only pricing, no guaranteed grades, and no real payment movement.",
      checklist: ["Integrity note", "Demo price label", "No guarantee label", "No real payment label"],
    },
    {
      id: "step-submit",
      title: "Create Demo Order",
      status: "locked",
      description: "Create a demo order record after all required checks are complete and policy labels are approved.",
      checklist: ["Buyer requirements complete", "Seller profile verified", "Checkout labels approved", "Order record ready"],
    },
  ],
};

export function getDemoOrderCheckoutStatusLabel(status: DemoOrderCheckoutStatus): string {
  if (status === "ready") return "Ready";
  if (status === "review") return "Needs Review";
  if (status === "locked") return "Locked";
  return "Draft";
}

export function getDemoOrderCheckoutStatusClass(status: DemoOrderCheckoutStatus): string {
  if (status === "ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "locked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getDemoOrderRequirementStatusLabel(status: DemoOrderRequirementStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getDemoOrderRequirementStatusClass(status: DemoOrderRequirementStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getDemoOrderCheckoutCounts(order: DemoOrderCheckout = DEMO_ORDER_CHECKOUT) {
  return {
    totalRequirements: order.requirements.length,
    completedRequirements: order.requirements.filter((requirement) => requirement.status === "complete").length,
    missingRequirements: order.requirements.filter((requirement) => requirement.status === "missing").length,
    lockedSteps: order.steps.filter((step) => step.status === "locked").length,
  };
}
