export type DemoContributionStatus = "draft" | "review" | "ready" | "locked";
export type DemoContributionStepStatus = "complete" | "pending" | "locked" | "needs_review";
export type DemoContributorType = "individual" | "company" | "alumni" | "institution";

export type DemoContributionOption = {
  id: string;
  label: string;
  amount: number;
  description: string;
};

export type DemoContributionStep = {
  id: string;
  title: string;
  status: DemoContributionStepStatus;
  description: string;
  checklist: string[];
};

export type DemoContributionPolicyCheck = {
  id: string;
  label: string;
  status: DemoContributionStepStatus;
  helper: string;
};

export type DemoContributionFlow = {
  id: string;
  campaignTitle: string;
  contributorName: string;
  contributorType: DemoContributorType;
  status: DemoContributionStatus;
  selectedOptionId: string;
  contributionGoal: number;
  currentRaised: number;
  selectedAmount: number;
  summary: string;
  options: DemoContributionOption[];
  steps: DemoContributionStep[];
  policyChecks: DemoContributionPolicyCheck[];
};

export const DEMO_CONTRIBUTION_FLOW: DemoContributionFlow = {
  id: "contribution-smart-lab-sponsor-preview",
  campaignTitle: "Smart Lab Assistant for FYP Teams",
  contributorName: "Alumni Sponsor Preview",
  contributorType: "alumni",
  status: "locked",
  selectedOptionId: "option-sponsor-pack",
  contributionGoal: 150000,
  currentRaised: 42000,
  selectedAmount: 25000,
  summary:
    "A demo contribution preview for sponsors who want to support the Smart Lab Assistant campaign without creating real payment movement inside this workspace.",
  options: [
    {
      id: "option-supporter",
      label: "Supporter",
      amount: 5000,
      description: "Small demo contribution label for encouraging student project progress.",
    },
    {
      id: "option-sponsor-pack",
      label: "Sponsor Pack",
      amount: 25000,
      description: "Recommended demo amount for supporting prototype components and evidence documentation.",
    },
    {
      id: "option-institution",
      label: "Institution Partner",
      amount: 50000,
      description: "Large demo contribution label for department-level support and impact updates.",
    },
  ],
  steps: [
    {
      id: "step-select-amount",
      title: "Select Contribution Amount",
      status: "complete",
      description: "Choose a contribution label and confirm it is demo-only.",
      checklist: ["Amount selected", "Campaign matched", "Contributor type selected"],
    },
    {
      id: "step-sponsor-details",
      title: "Sponsor Details",
      status: "needs_review",
      description: "Collect sponsor name, public/private display preference, and contact note.",
      checklist: ["Sponsor name", "Display preference", "Contact note"],
    },
    {
      id: "step-policy",
      title: "Policy Acknowledgement",
      status: "pending",
      description: "Confirm demo payment label, usage accountability, and sponsor update expectations.",
      checklist: ["Demo-only label", "Usage note", "Update cadence", "No real payment statement"],
    },
    {
      id: "step-confirm",
      title: "Confirm Demo Contribution",
      status: "locked",
      description: "Contribution confirmation is locked until payment provider, sponsor terms, and audit records exist.",
      checklist: ["Payment provider ready", "Sponsor terms accepted", "Audit record ready"],
    },
  ],
  policyChecks: [
    { id: "check-campaign", label: "Campaign approved for contributions", status: "needs_review", helper: "Campaign is still in review mode." },
    { id: "check-payment", label: "Payment provider connected", status: "locked", helper: "No real payment provider is connected." },
    { id: "check-terms", label: "Sponsor terms accepted", status: "pending", helper: "Terms and refund/usage rules must be defined." },
    { id: "check-ledger", label: "Contribution ledger ready", status: "pending", helper: "Production ledger table is not connected yet." },
  ],
};

export function formatContributionAmount(amount: number): string {
  return `PKR ${amount.toLocaleString()} demo`;
}

export function getDemoContributionProgress(flow: DemoContributionFlow = DEMO_CONTRIBUTION_FLOW): number {
  return Math.round(((flow.currentRaised + flow.selectedAmount) / flow.contributionGoal) * 100);
}

export function getDemoContributionStatusLabel(status: DemoContributionStatus): string {
  if (status === "ready") return "Ready";
  if (status === "review") return "Needs Review";
  if (status === "locked") return "Locked";
  return "Draft";
}

export function getDemoContributionStatusClass(status: DemoContributionStatus): string {
  if (status === "ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "locked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getDemoContributionStepStatusLabel(status: DemoContributionStepStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  if (status === "locked") return "Locked";
  return "Pending";
}

export function getDemoContributionStepStatusClass(status: DemoContributionStepStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "locked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getDemoContributorTypeLabel(type: DemoContributorType): string {
  if (type === "company") return "Company";
  if (type === "alumni") return "Alumni";
  if (type === "institution") return "Institution";
  return "Individual";
}

export function getDemoContributionCounts(flow: DemoContributionFlow = DEMO_CONTRIBUTION_FLOW) {
  return {
    options: flow.options.length,
    steps: flow.steps.length,
    completeSteps: flow.steps.filter((step) => step.status === "complete").length,
    lockedItems: [...flow.steps, ...flow.policyChecks].filter((item) => item.status === "locked").length,
    pendingChecks: flow.policyChecks.filter((check) => check.status === "pending" || check.status === "needs_review").length,
  };
}
