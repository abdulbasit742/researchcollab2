export type BudgetLineCategory = "hardware" | "software" | "testing" | "documentation" | "travel" | "contingency";
export type BudgetLineStatus = "draft" | "review" | "approved" | "blocked";
export type BudgetFundingSource = "campaign" | "grant" | "sponsor" | "department" | "self";
export type BudgetReviewStatus = "complete" | "missing" | "needs_review";

export type BudgetLineItem = {
  id: string;
  title: string;
  category: BudgetLineCategory;
  status: BudgetLineStatus;
  source: BudgetFundingSource;
  requestedAmount: number;
  approvedAmount: number;
  varianceNote: string;
  evidence: string;
};

export type BudgetReviewCheck = {
  id: string;
  label: string;
  status: BudgetReviewStatus;
  helper: string;
};

export type BudgetPlannerSummary = {
  projectTitle: string;
  owner: string;
  planStatus: BudgetLineStatus;
  periodLabel: string;
  totalRequested: number;
  totalApproved: number;
  safetyNote: string;
  lineItems: BudgetLineItem[];
  reviewChecks: BudgetReviewCheck[];
};

export const DEMO_BUDGET_PLANNER: BudgetPlannerSummary = {
  projectTitle: "Smart Lab Assistant for FYP Teams",
  owner: "Student Research Team",
  planStatus: "review",
  periodLabel: "Current demo budget cycle",
  totalRequested: 150000,
  totalApproved: 92000,
  safetyNote:
    "Budget Planner is a demo planning placeholder only. It does not approve spending, reserve funds, create invoices, trigger purchases, or release campaign/grant money.",
  lineItems: [
    {
      id: "budget-hardware-kit",
      title: "Prototype hardware kit",
      category: "hardware",
      status: "approved",
      source: "campaign",
      requestedAmount: 60000,
      approvedAmount: 60000,
      varianceNote: "Approved as Phase 1 prototype build estimate.",
      evidence: "Component list and prototype screenshots attached.",
    },
    {
      id: "budget-testing-tools",
      title: "Validation and testing tools",
      category: "testing",
      status: "review",
      source: "grant",
      requestedAmount: 45000,
      approvedAmount: 20000,
      varianceNote: "Partial approval until validation plan and test log are uploaded.",
      evidence: "Validation checklist is drafted; test log missing.",
    },
    {
      id: "budget-doc-pack",
      title: "Final report and defense pack",
      category: "documentation",
      status: "draft",
      source: "sponsor",
      requestedAmount: 25000,
      approvedAmount: 12000,
      varianceNote: "Needs final report outline and supervisor feedback before full approval.",
      evidence: "Report builder exists but final evidence package is incomplete.",
    },
    {
      id: "budget-cloud-demo",
      title: "Demo hosting and software tools",
      category: "software",
      status: "review",
      source: "department",
      requestedAmount: 12000,
      approvedAmount: 0,
      varianceNote: "Awaiting department review for approved tool list.",
      evidence: "No production provider invoice is attached.",
    },
    {
      id: "budget-contingency",
      title: "Contingency buffer",
      category: "contingency",
      status: "blocked",
      source: "self",
      requestedAmount: 8000,
      approvedAmount: 0,
      varianceNote: "Blocked until policy allows contingency labels in budget plan.",
      evidence: "No justification note attached.",
    },
  ],
  reviewChecks: [
    { id: "check-budget-lines", label: "Budget line items listed", status: "complete", helper: "Main categories are listed with requested and approved demo amounts." },
    { id: "check-evidence", label: "Evidence attached for each line", status: "needs_review", helper: "Some line items still need invoices, screenshots, or supervisor notes." },
    { id: "check-funding-source", label: "Funding source mapped", status: "needs_review", helper: "Grant, sponsor, campaign, and department labels need production mapping." },
    { id: "check-approval-rules", label: "Approval rules configured", status: "missing", helper: "Real approvals are not connected to roles, policies, or payment controls." },
  ],
};

export function formatBudgetAmount(amount: number): string {
  return `PKR ${amount.toLocaleString()} demo`;
}

export function getBudgetApprovalProgress(summary: BudgetPlannerSummary = DEMO_BUDGET_PLANNER): number {
  return Math.round((summary.totalApproved / summary.totalRequested) * 100);
}

export function getBudgetLineVariance(item: BudgetLineItem): number {
  return item.requestedAmount - item.approvedAmount;
}

export function getBudgetLineCategoryLabel(category: BudgetLineCategory): string {
  if (category === "hardware") return "Hardware";
  if (category === "software") return "Software";
  if (category === "testing") return "Testing";
  if (category === "documentation") return "Documentation";
  if (category === "travel") return "Travel";
  return "Contingency";
}

export function getBudgetFundingSourceLabel(source: BudgetFundingSource): string {
  if (source === "campaign") return "Campaign";
  if (source === "grant") return "Grant";
  if (source === "sponsor") return "Sponsor";
  if (source === "department") return "Department";
  return "Self";
}

export function getBudgetLineStatusLabel(status: BudgetLineStatus): string {
  if (status === "approved") return "Approved";
  if (status === "review") return "In Review";
  if (status === "blocked") return "Blocked";
  return "Draft";
}

export function getBudgetLineStatusClass(status: BudgetLineStatus): string {
  if (status === "approved") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getBudgetReviewStatusLabel(status: BudgetReviewStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getBudgetReviewStatusClass(status: BudgetReviewStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getBudgetPlannerCounts(summary: BudgetPlannerSummary = DEMO_BUDGET_PLANNER) {
  return {
    lines: summary.lineItems.length,
    approvedLines: summary.lineItems.filter((item) => item.status === "approved").length,
    reviewLines: summary.lineItems.filter((item) => item.status === "review").length,
    blockedLines: summary.lineItems.filter((item) => item.status === "blocked").length,
    missingChecks: summary.reviewChecks.filter((check) => check.status === "missing").length,
    variance: summary.totalRequested - summary.totalApproved,
  };
}
