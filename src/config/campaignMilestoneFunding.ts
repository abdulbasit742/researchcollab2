export type CampaignMilestoneFundingStatus = "planned" | "funded" | "ready_to_release" | "released" | "blocked";
export type CampaignReleaseCheckStatus = "complete" | "missing" | "needs_review";
export type CampaignFundingLedgerStatus = "reserved" | "released" | "held" | "demo_only";

export type CampaignMilestoneFundingItem = {
  id: string;
  title: string;
  status: CampaignMilestoneFundingStatus;
  amount: number;
  fundedAmount: number;
  dueLabel: string;
  releaseCondition: string;
  evidenceRequired: string[];
};

export type CampaignReleaseCheck = {
  id: string;
  label: string;
  status: CampaignReleaseCheckStatus;
  helper: string;
};

export type CampaignFundingLedgerEntry = {
  id: string;
  label: string;
  status: CampaignFundingLedgerStatus;
  amount: number;
  note: string;
};

export type CampaignMilestoneFundingSummary = {
  campaignTitle: string;
  owner: string;
  sponsorLabel: string;
  status: CampaignMilestoneFundingStatus;
  totalMilestoneAmount: number;
  totalFundedAmount: number;
  releaseNote: string;
  milestones: CampaignMilestoneFundingItem[];
  releaseChecks: CampaignReleaseCheck[];
  ledger: CampaignFundingLedgerEntry[];
};

export const DEMO_CAMPAIGN_MILESTONE_FUNDING: CampaignMilestoneFundingSummary = {
  campaignTitle: "Smart Lab Assistant for FYP Teams",
  owner: "Student Research Team",
  sponsorLabel: "Alumni Sponsor Preview + Department Support",
  status: "blocked",
  totalMilestoneAmount: 150000,
  totalFundedAmount: 67000,
  releaseNote:
    "Milestone funding is shown as demo labels only. Funds cannot be reserved, released, refunded, or transferred until a verified payment provider and audit ledger exist.",
  milestones: [
    {
      id: "milestone-prototype-build",
      title: "Prototype Build",
      status: "ready_to_release",
      amount: 60000,
      fundedAmount: 60000,
      dueLabel: "Phase 1",
      releaseCondition: "Release after component list, prototype plan, and test screenshots are uploaded.",
      evidenceRequired: ["Prototype plan", "Component list", "Initial screenshots"],
    },
    {
      id: "milestone-validation-evidence",
      title: "Validation and Evidence",
      status: "funded",
      amount: 45000,
      fundedAmount: 7000,
      dueLabel: "Phase 2",
      releaseCondition: "Release after experiment logs, validation checklist, and supervisor notes are attached.",
      evidenceRequired: ["Experiment logs", "Validation checklist", "Supervisor notes"],
    },
    {
      id: "milestone-defense-pack",
      title: "Final Report and Defense Pack",
      status: "blocked",
      amount: 45000,
      fundedAmount: 0,
      dueLabel: "Phase 3",
      releaseCondition: "Locked until earlier milestones are accepted and final evidence files are ready.",
      evidenceRequired: ["Final report", "Defense slides", "Completion evidence"],
    },
  ],
  releaseChecks: [
    { id: "check-campaign-approved", label: "Campaign approved", status: "needs_review", helper: "Campaign is still in review mode." },
    { id: "check-evidence", label: "Release evidence attached", status: "needs_review", helper: "Prototype milestone has partial evidence only." },
    { id: "check-ledger", label: "Funding ledger configured", status: "missing", helper: "Production contribution ledger is not connected yet." },
    { id: "check-provider", label: "Payment provider verified", status: "missing", helper: "No real provider is connected in demo mode." },
  ],
  ledger: [
    {
      id: "ledger-existing-demo",
      label: "Existing campaign support",
      status: "demo_only",
      amount: 42000,
      note: "Existing demo raised amount from campaign builder.",
    },
    {
      id: "ledger-sponsor-preview",
      label: "Sponsor Pack contribution preview",
      status: "held",
      amount: 25000,
      note: "Selected contribution remains held because confirmation and payment are locked.",
    },
    {
      id: "ledger-release-preview",
      label: "Prototype release preview",
      status: "reserved",
      amount: 60000,
      note: "Release preview only; no payout or transfer is created.",
    },
  ],
};

export function formatMilestoneFundingAmount(amount: number): string {
  return `PKR ${amount.toLocaleString()} demo`;
}

export function getCampaignMilestoneFundingProgress(summary: CampaignMilestoneFundingSummary = DEMO_CAMPAIGN_MILESTONE_FUNDING): number {
  return Math.round((summary.totalFundedAmount / summary.totalMilestoneAmount) * 100);
}

export function getCampaignMilestoneItemProgress(milestone: CampaignMilestoneFundingItem): number {
  return Math.round((milestone.fundedAmount / milestone.amount) * 100);
}

export function getCampaignMilestoneFundingStatusLabel(status: CampaignMilestoneFundingStatus): string {
  if (status === "released") return "Released";
  if (status === "ready_to_release") return "Ready to Release";
  if (status === "funded") return "Funded";
  if (status === "blocked") return "Blocked";
  return "Planned";
}

export function getCampaignMilestoneFundingStatusClass(status: CampaignMilestoneFundingStatus): string {
  if (status === "released") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "ready_to_release") return "bg-primary/10 text-primary border-primary/30";
  if (status === "funded") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  if (status === "blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getCampaignReleaseCheckStatusLabel(status: CampaignReleaseCheckStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getCampaignReleaseCheckStatusClass(status: CampaignReleaseCheckStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getCampaignFundingLedgerStatusLabel(status: CampaignFundingLedgerStatus): string {
  if (status === "released") return "Released";
  if (status === "reserved") return "Reserved";
  if (status === "held") return "Held";
  return "Demo Only";
}

export function getCampaignFundingLedgerStatusClass(status: CampaignFundingLedgerStatus): string {
  if (status === "released") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "reserved") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  if (status === "held") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getCampaignMilestoneFundingCounts(summary: CampaignMilestoneFundingSummary = DEMO_CAMPAIGN_MILESTONE_FUNDING) {
  return {
    milestones: summary.milestones.length,
    readyToRelease: summary.milestones.filter((milestone) => milestone.status === "ready_to_release").length,
    blocked: summary.milestones.filter((milestone) => milestone.status === "blocked").length,
    missingChecks: summary.releaseChecks.filter((check) => check.status === "missing").length,
    ledgerEntries: summary.ledger.length,
  };
}
