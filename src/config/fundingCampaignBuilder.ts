export type FundingCampaignStatus = "draft" | "review" | "ready" | "published";
export type FundingCampaignSectionStatus = "complete" | "missing" | "needs_review";
export type FundingCampaignMilestoneStatus = "planned" | "ready" | "blocked";

export type FundingCampaignSection = {
  id: string;
  title: string;
  status: FundingCampaignSectionStatus;
  summary: string;
};

export type FundingCampaignMilestone = {
  id: string;
  title: string;
  status: FundingCampaignMilestoneStatus;
  amountLabel: string;
  releaseCondition: string;
};

export type FundingCampaignReadinessCheck = {
  id: string;
  label: string;
  status: FundingCampaignSectionStatus;
  helper: string;
};

export type FundingCampaignDraft = {
  id: string;
  title: string;
  owner: string;
  status: FundingCampaignStatus;
  category: string;
  goalAmount: number;
  raisedAmount: number;
  durationLabel: string;
  pitchSummary: string;
  impactStatement: string;
  sections: FundingCampaignSection[];
  milestones: FundingCampaignMilestone[];
  readinessChecks: FundingCampaignReadinessCheck[];
};

export const DEMO_FUNDING_CAMPAIGN: FundingCampaignDraft = {
  id: "campaign-smart-lab-assistant",
  title: "Smart Lab Assistant for FYP Teams",
  owner: "Student Research Team",
  status: "review",
  category: "Final Year Project Support",
  goalAmount: 150000,
  raisedAmount: 42000,
  durationLabel: "45-day demo campaign",
  pitchSummary:
    "A demo funding campaign for building a smart lab assistant that helps FYP teams organize experiments, evidence files, supervisor feedback, and final report readiness.",
  impactStatement:
    "The campaign explains how sponsor support can help students complete a research-grade prototype, improve documentation quality, and prepare for final defense.",
  sections: [
    {
      id: "section-story",
      title: "Campaign Story",
      status: "complete",
      summary: "Problem, student team background, prototype vision, and why sponsor support is needed.",
    },
    {
      id: "section-budget",
      title: "Budget Breakdown",
      status: "needs_review",
      summary: "Hardware, testing, documentation, deployment, and contingency lines need reviewer approval.",
    },
    {
      id: "section-impact",
      title: "Expected Impact",
      status: "complete",
      summary: "Explains learning impact, prototype value, and measurable academic deliverables.",
    },
    {
      id: "section-risk",
      title: "Risk and Accountability",
      status: "missing",
      summary: "Needs clear risk notes, sponsor update cadence, and no-guarantee wording before launch.",
    },
  ],
  milestones: [
    {
      id: "milestone-prototype",
      title: "Prototype Build",
      status: "ready",
      amountLabel: "PKR 60,000 demo",
      releaseCondition: "Release after prototype plan, component list, and test screenshots are uploaded.",
    },
    {
      id: "milestone-validation",
      title: "Validation and Evidence",
      status: "planned",
      amountLabel: "PKR 45,000 demo",
      releaseCondition: "Release after validation checklist, experiment logs, and supervisor review notes are attached.",
    },
    {
      id: "milestone-final-report",
      title: "Final Report and Defense Pack",
      status: "blocked",
      amountLabel: "PKR 45,000 demo",
      releaseCondition: "Locked until prior milestones are accepted and final evidence files are ready.",
    },
  ],
  readinessChecks: [
    { id: "check-owner", label: "Project owner verified", status: "complete", helper: "Owner identity is available in demo workspace." },
    { id: "check-budget", label: "Budget reviewed", status: "needs_review", helper: "Budget should be reviewed by supervisor or admin before launch." },
    { id: "check-policy", label: "Funding policy labels added", status: "missing", helper: "Real campaigns need sponsor terms and refund/usage rules." },
    { id: "check-updates", label: "Sponsor update plan ready", status: "needs_review", helper: "Impact update cadence should be defined before publishing." },
  ],
};

export function formatCampaignAmount(amount: number): string {
  return `PKR ${amount.toLocaleString()} demo`;
}

export function getFundingCampaignProgress(campaign: FundingCampaignDraft = DEMO_FUNDING_CAMPAIGN): number {
  return Math.round((campaign.raisedAmount / campaign.goalAmount) * 100);
}

export function getFundingCampaignStatusLabel(status: FundingCampaignStatus): string {
  if (status === "published") return "Published";
  if (status === "ready") return "Ready";
  if (status === "review") return "Needs Review";
  return "Draft";
}

export function getFundingCampaignStatusClass(status: FundingCampaignStatus): string {
  if (status === "published") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "ready") return "bg-primary/10 text-primary border-primary/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getFundingSectionStatusLabel(status: FundingCampaignSectionStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getFundingSectionStatusClass(status: FundingCampaignSectionStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getFundingMilestoneStatusLabel(status: FundingCampaignMilestoneStatus): string {
  if (status === "ready") return "Ready";
  if (status === "blocked") return "Blocked";
  return "Planned";
}

export function getFundingMilestoneStatusClass(status: FundingCampaignMilestoneStatus): string {
  if (status === "ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getFundingCampaignCounts(campaign: FundingCampaignDraft = DEMO_FUNDING_CAMPAIGN) {
  return {
    sections: campaign.sections.length,
    completeSections: campaign.sections.filter((section) => section.status === "complete").length,
    milestones: campaign.milestones.length,
    blockedMilestones: campaign.milestones.filter((milestone) => milestone.status === "blocked").length,
    missingChecks: campaign.readinessChecks.filter((check) => check.status === "missing").length,
  };
}
