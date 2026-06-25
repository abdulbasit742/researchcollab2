export type SponsorshipProposalStatus = "draft" | "review" | "ready" | "sent" | "blocked";
export type SponsorshipSectionStatus = "complete" | "missing" | "needs_review";
export type SponsorshipPackageTier = "supporter" | "partner" | "title_sponsor";
export type SponsorshipBenefitType = "visibility" | "reporting" | "event" | "mentorship" | "recruitment";

export type SponsorshipProposalSection = {
  id: string;
  title: string;
  status: SponsorshipSectionStatus;
  summary: string;
};

export type SponsorshipPackage = {
  id: string;
  tier: SponsorshipPackageTier;
  title: string;
  amount: number;
  timelineLabel: string;
  bestFor: string;
  benefits: string[];
};

export type SponsorshipBenefit = {
  id: string;
  type: SponsorshipBenefitType;
  label: string;
  status: SponsorshipSectionStatus;
  helper: string;
};

export type SponsorshipProposalBuilderSummary = {
  projectTitle: string;
  owner: string;
  targetSponsor: string;
  status: SponsorshipProposalStatus;
  readiness: number;
  askAmount: number;
  pitchSummary: string;
  safetyNote: string;
  sections: SponsorshipProposalSection[];
  packages: SponsorshipPackage[];
  benefits: SponsorshipBenefit[];
};

export const DEMO_SPONSORSHIP_PROPOSAL: SponsorshipProposalBuilderSummary = {
  projectTitle: "Smart Lab Assistant for FYP Teams",
  owner: "Student Research Team",
  targetSponsor: "Technology Partner Network",
  status: "review",
  readiness: 74,
  askAmount: 150000,
  pitchSummary:
    "A sponsor-ready proposal for supporting a student prototype with hardware, validation, documentation, impact reporting, and final defense readiness.",
  safetyNote:
    "Sponsorship Proposal Builder is a demo document workflow only. It does not send real sponsor outreach, create contracts, issue invoices, accept money, or guarantee sponsorship.",
  sections: [
    {
      id: "section-problem",
      title: "Problem and Student Need",
      status: "complete",
      summary: "Explains why FYP teams need structured lab support, evidence tracking, and defense-ready documentation.",
    },
    {
      id: "section-solution",
      title: "Prototype Solution",
      status: "complete",
      summary: "Describes the smart lab assistant workflow, prototype plan, and expected student outcomes.",
    },
    {
      id: "section-budget",
      title: "Budget and Funding Ask",
      status: "needs_review",
      summary: "Budget planner exists, but approval rules and final variance notes need review before sponsor send-out.",
    },
    {
      id: "section-impact",
      title: "Sponsor Impact Report",
      status: "needs_review",
      summary: "Impact update cadence is drafted but needs sponsor-facing reporting format and evidence rules.",
    },
    {
      id: "section-terms",
      title: "Terms and Boundaries",
      status: "missing",
      summary: "Needs no-guarantee wording, usage boundaries, privacy note, and sponsor recognition limits.",
    },
  ],
  packages: [
    {
      id: "package-supporter",
      tier: "supporter",
      title: "Supporter Sponsor",
      amount: 25000,
      timelineLabel: "One demo cycle",
      bestFor: "Small sponsor support for prototype materials or documentation improvements.",
      benefits: ["Name in sponsor update", "Impact summary email", "Final project acknowledgement"],
    },
    {
      id: "package-partner",
      tier: "partner",
      title: "Project Partner",
      amount: 75000,
      timelineLabel: "Full prototype phase",
      bestFor: "Sponsor support for components, validation evidence, and milestone reporting.",
      benefits: ["Logo in demo proposal", "Monthly impact update", "Prototype review session", "Recruitment interest note"],
    },
    {
      id: "package-title",
      tier: "title_sponsor",
      title: "Title Sponsor",
      amount: 150000,
      timelineLabel: "Full FYP cycle",
      bestFor: "Major sponsor support for full prototype, validation, documentation, and final defense pack.",
      benefits: ["Primary recognition", "Detailed impact report", "Demo day mention", "Mentorship session", "Talent pipeline note"],
    },
  ],
  benefits: [
    { id: "benefit-visibility", type: "visibility", label: "Sponsor recognition", status: "needs_review", helper: "Recognition must follow institution and privacy rules." },
    { id: "benefit-reporting", type: "reporting", label: "Impact reports", status: "complete", helper: "Impact Updates module supports progress reporting." },
    { id: "benefit-event", type: "event", label: "Demo day mention", status: "missing", helper: "No event schedule is connected yet." },
    { id: "benefit-mentorship", type: "mentorship", label: "Mentorship session", status: "needs_review", helper: "Requires sponsor availability and team consent." },
    { id: "benefit-recruitment", type: "recruitment", label: "Talent pipeline note", status: "needs_review", helper: "Must avoid job guarantees and keep student consent explicit." },
  ],
};

export function formatSponsorshipAmount(amount: number): string {
  return `PKR ${amount.toLocaleString()} demo`;
}

export function getSponsorshipProposalStatusLabel(status: SponsorshipProposalStatus): string {
  if (status === "sent") return "Sent";
  if (status === "ready") return "Ready";
  if (status === "review") return "In Review";
  if (status === "blocked") return "Blocked";
  return "Draft";
}

export function getSponsorshipProposalStatusClass(status: SponsorshipProposalStatus): string {
  if (status === "sent" || status === "ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getSponsorshipSectionStatusLabel(status: SponsorshipSectionStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getSponsorshipSectionStatusClass(status: SponsorshipSectionStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getSponsorshipPackageTierLabel(tier: SponsorshipPackageTier): string {
  if (tier === "partner") return "Partner";
  if (tier === "title_sponsor") return "Title Sponsor";
  return "Supporter";
}

export function getSponsorshipPackageTierClass(tier: SponsorshipPackageTier): string {
  if (tier === "title_sponsor") return "bg-primary/10 text-primary border-primary/30";
  if (tier === "partner") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getSponsorshipBenefitTypeLabel(type: SponsorshipBenefitType): string {
  if (type === "reporting") return "Reporting";
  if (type === "event") return "Event";
  if (type === "mentorship") return "Mentorship";
  if (type === "recruitment") return "Recruitment";
  return "Visibility";
}

export function getSponsorshipProposalCounts(summary: SponsorshipProposalBuilderSummary = DEMO_SPONSORSHIP_PROPOSAL) {
  return {
    sections: summary.sections.length,
    completeSections: summary.sections.filter((section) => section.status === "complete").length,
    packages: summary.packages.length,
    benefits: summary.benefits.length,
    missingItems: [...summary.sections, ...summary.benefits].filter((item) => item.status === "missing").length,
    reviewItems: [...summary.sections, ...summary.benefits].filter((item) => item.status === "needs_review").length,
  };
}
