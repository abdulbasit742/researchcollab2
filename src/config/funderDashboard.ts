export type FunderCampaignStatus = "watching" | "supported" | "milestone_review" | "blocked";
export type FunderContributionStatus = "pledged" | "confirmed" | "held" | "demo_only";
export type FunderUpdateStatus = "new" | "reviewed" | "needs_action";
export type FunderRiskLevel = "low" | "medium" | "high";

export type FunderSupportedCampaign = {
  id: string;
  title: string;
  status: FunderCampaignStatus;
  category: string;
  owner: string;
  contributionAmount: number;
  campaignGoal: number;
  campaignRaised: number;
  nextMilestone: string;
  nextAction: string;
  riskLevel: FunderRiskLevel;
};

export type FunderContribution = {
  id: string;
  campaignTitle: string;
  status: FunderContributionStatus;
  amount: number;
  dateLabel: string;
  note: string;
};

export type FunderImpactUpdate = {
  id: string;
  campaignTitle: string;
  status: FunderUpdateStatus;
  updateTitle: string;
  timeLabel: string;
  summary: string;
};

export type FunderDashboardSummary = {
  funderName: string;
  funderType: string;
  periodLabel: string;
  dashboardStatus: FunderCampaignStatus;
  safetyNote: string;
  campaigns: FunderSupportedCampaign[];
  contributions: FunderContribution[];
  impactUpdates: FunderImpactUpdate[];
};

export const DEMO_FUNDER_DASHBOARD: FunderDashboardSummary = {
  funderName: "Alumni Sponsor Preview",
  funderType: "Alumni sponsor",
  periodLabel: "Current demo funding cycle",
  dashboardStatus: "milestone_review",
  safetyNote:
    "Funder dashboard uses demo labels only. No real card charge, receipt, tax record, fund release, refund, or wallet movement is created from this preview.",
  campaigns: [
    {
      id: "campaign-smart-lab-assistant",
      title: "Smart Lab Assistant for FYP Teams",
      status: "milestone_review",
      category: "Final Year Project Support",
      owner: "Student Research Team",
      contributionAmount: 25000,
      campaignGoal: 150000,
      campaignRaised: 67000,
      nextMilestone: "Prototype Build",
      nextAction: "Review prototype evidence before milestone release preview.",
      riskLevel: "medium",
    },
    {
      id: "campaign-ai-literature-helper",
      title: "AI Literature Helper for Student Researchers",
      status: "watching",
      category: "Research Tooling",
      owner: "Academic Methods Lab",
      contributionAmount: 0,
      campaignGoal: 200000,
      campaignRaised: 56000,
      nextMilestone: "Proposal Review",
      nextAction: "Wait for campaign approval and clearer budget breakdown.",
      riskLevel: "low",
    },
    {
      id: "campaign-prototype-validation-kit",
      title: "Prototype Validation Kit",
      status: "blocked",
      category: "Lab Equipment",
      owner: "Capstone Team Alpha",
      contributionAmount: 10000,
      campaignGoal: 120000,
      campaignRaised: 38000,
      nextMilestone: "Component Purchase",
      nextAction: "Funding remains blocked until policy labels and supervisor verification are complete.",
      riskLevel: "high",
    },
  ],
  contributions: [
    {
      id: "contribution-sponsor-pack",
      campaignTitle: "Smart Lab Assistant for FYP Teams",
      status: "held",
      amount: 25000,
      dateLabel: "Today",
      note: "Sponsor Pack contribution preview is held because payment confirmation is locked.",
    },
    {
      id: "contribution-validation-kit",
      campaignTitle: "Prototype Validation Kit",
      status: "demo_only",
      amount: 10000,
      dateLabel: "This week",
      note: "Demo support label only; no real funds are reserved.",
    },
    {
      id: "contribution-literature-watch",
      campaignTitle: "AI Literature Helper for Student Researchers",
      status: "pledged",
      amount: 15000,
      dateLabel: "Draft pledge",
      note: "Pledge preview waits for campaign approval and sponsor terms.",
    },
  ],
  impactUpdates: [
    {
      id: "update-prototype-evidence",
      campaignTitle: "Smart Lab Assistant for FYP Teams",
      status: "new",
      updateTitle: "Prototype evidence uploaded",
      timeLabel: "Today, 16:20",
      summary: "Student team added component list and early prototype screenshots for sponsor review.",
    },
    {
      id: "update-budget-review",
      campaignTitle: "AI Literature Helper for Student Researchers",
      status: "needs_action",
      updateTitle: "Budget breakdown needs detail",
      timeLabel: "Yesterday",
      summary: "Campaign needs clearer usage plan before funder can confidently support it.",
    },
    {
      id: "update-supervisor-note",
      campaignTitle: "Prototype Validation Kit",
      status: "reviewed",
      updateTitle: "Supervisor verification note reviewed",
      timeLabel: "2 days ago",
      summary: "Supervisor note exists, but payment policy labels are still missing.",
    },
  ],
};

export function formatFunderAmount(amount: number): string {
  return `PKR ${amount.toLocaleString()} demo`;
}

export function getFunderCampaignProgress(campaign: FunderSupportedCampaign): number {
  return Math.round((campaign.campaignRaised / campaign.campaignGoal) * 100);
}

export function getFunderCampaignStatusLabel(status: FunderCampaignStatus): string {
  if (status === "supported") return "Supported";
  if (status === "milestone_review") return "Milestone Review";
  if (status === "blocked") return "Blocked";
  return "Watching";
}

export function getFunderCampaignStatusClass(status: FunderCampaignStatus): string {
  if (status === "supported") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "milestone_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getFunderContributionStatusLabel(status: FunderContributionStatus): string {
  if (status === "confirmed") return "Confirmed";
  if (status === "held") return "Held";
  if (status === "demo_only") return "Demo Only";
  return "Pledged";
}

export function getFunderContributionStatusClass(status: FunderContributionStatus): string {
  if (status === "confirmed") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "held") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "demo_only") return "bg-muted text-muted-foreground border-border";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getFunderUpdateStatusLabel(status: FunderUpdateStatus): string {
  if (status === "reviewed") return "Reviewed";
  if (status === "needs_action") return "Needs Action";
  return "New";
}

export function getFunderUpdateStatusClass(status: FunderUpdateStatus): string {
  if (status === "reviewed") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_action") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-primary/10 text-primary border-primary/30";
}

export function getFunderRiskClass(risk: FunderRiskLevel): string {
  if (risk === "high") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (risk === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
}

export function getFunderDashboardCounts(summary: FunderDashboardSummary = DEMO_FUNDER_DASHBOARD) {
  return {
    campaigns: summary.campaigns.length,
    supported: summary.campaigns.filter((campaign) => campaign.contributionAmount > 0).length,
    totalContributed: summary.contributions.reduce((total, contribution) => total + contribution.amount, 0),
    heldContributions: summary.contributions.filter((contribution) => contribution.status === "held").length,
    newUpdates: summary.impactUpdates.filter((update) => update.status === "new" || update.status === "needs_action").length,
  };
}
