export type FundingLedgerEntryType = "contribution" | "milestone_release" | "hold" | "refund_preview" | "adjustment";
export type FundingLedgerEntryStatus = "posted" | "pending" | "held" | "blocked" | "demo_only";
export type FundingLedgerAuditStatus = "complete" | "missing" | "needs_review";

export type DemoFundingLedgerEntry = {
  id: string;
  type: FundingLedgerEntryType;
  status: FundingLedgerEntryStatus;
  campaignTitle: string;
  actor: string;
  amount: number;
  dateLabel: string;
  reference: string;
  note: string;
};

export type DemoFundingLedgerAuditCheck = {
  id: string;
  label: string;
  status: FundingLedgerAuditStatus;
  helper: string;
};

export type DemoFundingLedgerSummary = {
  ledgerName: string;
  owner: string;
  periodLabel: string;
  openingBalance: number;
  totalContributions: number;
  totalHeld: number;
  totalReleasePreview: number;
  closingBalance: number;
  safetyNote: string;
  entries: DemoFundingLedgerEntry[];
  auditChecks: DemoFundingLedgerAuditCheck[];
};

export const DEMO_FUNDING_LEDGER: DemoFundingLedgerSummary = {
  ledgerName: "Campaign Funding Ledger Preview",
  owner: "ResearchCollab Demo Finance Layer",
  periodLabel: "Current demo funding cycle",
  openingBalance: 42000,
  totalContributions: 35000,
  totalHeld: 25000,
  totalReleasePreview: 60000,
  closingBalance: 67000,
  safetyNote:
    "This ledger is a demo-only accounting preview. It does not create balances, escrow accounts, refunds, receipts, payouts, bank transfers, or payment provider records.",
  entries: [
    {
      id: "ledger-entry-existing-support",
      type: "contribution",
      status: "demo_only",
      campaignTitle: "Smart Lab Assistant for FYP Teams",
      actor: "Campaign Builder",
      amount: 42000,
      dateLabel: "Before current cycle",
      reference: "DEMO-OPENING-001",
      note: "Opening demo support label imported from the campaign builder.",
    },
    {
      id: "ledger-entry-sponsor-pack",
      type: "contribution",
      status: "held",
      campaignTitle: "Smart Lab Assistant for FYP Teams",
      actor: "Alumni Sponsor Preview",
      amount: 25000,
      dateLabel: "Today",
      reference: "DEMO-CONTRIB-025",
      note: "Sponsor Pack contribution preview remains held because payment confirmation is locked.",
    },
    {
      id: "ledger-entry-validation-kit",
      type: "contribution",
      status: "pending",
      campaignTitle: "Prototype Validation Kit",
      actor: "Alumni Sponsor Preview",
      amount: 10000,
      dateLabel: "This week",
      reference: "DEMO-PLEDGE-010",
      note: "Draft pledge waits for campaign policy labels and supervisor verification.",
    },
    {
      id: "ledger-entry-prototype-release",
      type: "milestone_release",
      status: "blocked",
      campaignTitle: "Smart Lab Assistant for FYP Teams",
      actor: "Milestone Funding Preview",
      amount: -60000,
      dateLabel: "Release preview",
      reference: "DEMO-RELEASE-PHASE1",
      note: "Prototype Build release is blocked until provider setup, ledger table, and evidence approvals exist.",
    },
    {
      id: "ledger-entry-refund-preview",
      type: "refund_preview",
      status: "demo_only",
      campaignTitle: "Prototype Validation Kit",
      actor: "System",
      amount: -10000,
      dateLabel: "Preview only",
      reference: "DEMO-REFUND-PREVIEW",
      note: "Refund preview label only; no real sponsor money can be returned from demo data.",
    },
  ],
  auditChecks: [
    { id: "check-ledger-table", label: "Production ledger table connected", status: "missing", helper: "No real database ledger table is connected to this demo panel." },
    { id: "check-provider", label: "Payment provider events mapped", status: "missing", helper: "Provider webhooks and reconciliation events are not configured." },
    { id: "check-roles", label: "Finance roles reviewed", status: "needs_review", helper: "Admin, sponsor, and project-owner permissions need review." },
    { id: "check-demo-labels", label: "Demo-only labels visible", status: "complete", helper: "Ledger entries are clearly marked as demo previews." },
  ],
};

export function formatLedgerAmount(amount: number): string {
  const prefix = amount < 0 ? "-" : "";
  return `${prefix}PKR ${Math.abs(amount).toLocaleString()} demo`;
}

export function getFundingLedgerEntryTypeLabel(type: FundingLedgerEntryType): string {
  if (type === "milestone_release") return "Milestone Release";
  if (type === "hold") return "Hold";
  if (type === "refund_preview") return "Refund Preview";
  if (type === "adjustment") return "Adjustment";
  return "Contribution";
}

export function getFundingLedgerEntryStatusLabel(status: FundingLedgerEntryStatus): string {
  if (status === "posted") return "Posted";
  if (status === "pending") return "Pending";
  if (status === "held") return "Held";
  if (status === "blocked") return "Blocked";
  return "Demo Only";
}

export function getFundingLedgerEntryStatusClass(status: FundingLedgerEntryStatus): string {
  if (status === "posted") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "pending") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  if (status === "held") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getFundingLedgerAuditStatusLabel(status: FundingLedgerAuditStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getFundingLedgerAuditStatusClass(status: FundingLedgerAuditStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getDemoFundingLedgerCounts(summary: DemoFundingLedgerSummary = DEMO_FUNDING_LEDGER) {
  return {
    entries: summary.entries.length,
    contributions: summary.entries.filter((entry) => entry.type === "contribution").length,
    held: summary.entries.filter((entry) => entry.status === "held").length,
    blocked: summary.entries.filter((entry) => entry.status === "blocked").length,
    missingAuditChecks: summary.auditChecks.filter((check) => check.status === "missing").length,
  };
}
