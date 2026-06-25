export type DemoEarningStatus = "pending" | "available" | "on_hold" | "demo_only";
export type DemoPayoutCheckStatus = "complete" | "missing" | "needs_review";

export type ResearcherDemoEarning = {
  id: string;
  orderTitle: string;
  buyerName: string;
  packageLabel: string;
  status: DemoEarningStatus;
  completedLabel: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  note: string;
};

export type DemoPayoutCheck = {
  id: string;
  label: string;
  status: DemoPayoutCheckStatus;
  helper: string;
};

export type ResearcherDemoEarningsSummary = {
  researcherName: string;
  periodLabel: string;
  payoutStatus: DemoEarningStatus;
  payoutNote: string;
  earnings: ResearcherDemoEarning[];
  payoutChecks: DemoPayoutCheck[];
};

export const DEMO_RESEARCHER_EARNINGS: ResearcherDemoEarningsSummary = {
  researcherName: "Dr. Amina Research Studio",
  periodLabel: "Current demo month",
  payoutStatus: "demo_only",
  payoutNote:
    "Earnings are demo labels only. No real balance, payout, escrow release, invoice, or wallet transfer is created in this preview.",
  earnings: [
    {
      id: "earning-proposal-standard",
      orderTitle: "FYP Proposal Review and Improvement",
      buyerName: "Student Research Team",
      packageLabel: "Standard",
      status: "on_hold",
      completedLabel: "Dispute review open",
      grossAmount: 8000,
      platformFee: 800,
      netAmount: 7200,
      note: "Held because revision scope and dispute placeholder are still under review.",
    },
    {
      id: "earning-viva-basic",
      orderTitle: "Viva Question Bank and Practice Notes",
      buyerName: "Final Defense Group",
      packageLabel: "Basic",
      status: "available",
      completedLabel: "Accepted today",
      grossAmount: 3500,
      platformFee: 350,
      netAmount: 3150,
      note: "Demo accepted order. Payout remains locked until real provider setup exists.",
    },
    {
      id: "earning-methodology-standard",
      orderTitle: "Methodology and Validation Plan",
      buyerName: "Capstone Team Alpha",
      packageLabel: "Standard",
      status: "pending",
      completedLabel: "Delivery pending",
      grossAmount: 7500,
      platformFee: 750,
      netAmount: 6750,
      note: "Pending until deliverables are accepted by buyer.",
    },
  ],
  payoutChecks: [
    { id: "check-profile", label: "Researcher profile verified", status: "complete", helper: "Demo profile is marked verified." },
    { id: "check-policy", label: "Order policy labels reviewed", status: "needs_review", helper: "Dispute and revision labels still need review." },
    { id: "check-provider", label: "Payment provider configured", status: "missing", helper: "No real payout provider is connected." },
    { id: "check-invoice", label: "Invoice and tax fields ready", status: "missing", helper: "Production invoices are not implemented yet." },
  ],
};

export function formatDemoCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString()} demo`;
}

export function getDemoEarningStatusLabel(status: DemoEarningStatus): string {
  if (status === "available") return "Available";
  if (status === "on_hold") return "On Hold";
  if (status === "demo_only") return "Demo Only";
  return "Pending";
}

export function getDemoEarningStatusClass(status: DemoEarningStatus): string {
  if (status === "available") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "on_hold") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "demo_only") return "bg-muted text-muted-foreground border-border";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getDemoPayoutCheckStatusLabel(status: DemoPayoutCheckStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getDemoPayoutCheckStatusClass(status: DemoPayoutCheckStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getResearcherDemoEarningsCounts(summary: ResearcherDemoEarningsSummary = DEMO_RESEARCHER_EARNINGS) {
  return {
    orders: summary.earnings.length,
    gross: summary.earnings.reduce((total, earning) => total + earning.grossAmount, 0),
    fees: summary.earnings.reduce((total, earning) => total + earning.platformFee, 0),
    net: summary.earnings.reduce((total, earning) => total + earning.netAmount, 0),
    onHold: summary.earnings.filter((earning) => earning.status === "on_hold").length,
    missingChecks: summary.payoutChecks.filter((check) => check.status === "missing").length,
  };
}
