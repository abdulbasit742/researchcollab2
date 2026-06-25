export type GrantSourceType = "government" | "university" | "industry" | "ngo" | "international";
export type GrantFitStatus = "strong" | "medium" | "low" | "blocked";
export type GrantDeadlineStatus = "open" | "closing_soon" | "upcoming" | "closed";
export type GrantRequirementStatus = "matched" | "missing" | "needs_review";

export type GrantRequirement = {
  id: string;
  label: string;
  status: GrantRequirementStatus;
  helper: string;
};

export type GrantOpportunity = {
  id: string;
  title: string;
  provider: string;
  sourceType: GrantSourceType;
  fitStatus: GrantFitStatus;
  deadlineStatus: GrantDeadlineStatus;
  amountLabel: string;
  deadlineLabel: string;
  category: string;
  matchScore: number;
  summary: string;
  bestFor: string;
  requirements: GrantRequirement[];
};

export type GrantFinderSummary = {
  projectTitle: string;
  owner: string;
  searchQuery: string;
  filterLabel: string;
  safetyNote: string;
  opportunities: GrantOpportunity[];
};

export const DEMO_GRANT_FINDER: GrantFinderSummary = {
  projectTitle: "Smart Lab Assistant for FYP Teams",
  owner: "Student Research Team",
  searchQuery: "student research prototype lab assistant validation",
  filterLabel: "FYP, prototype, documentation, student innovation",
  safetyNote:
    "Grant Finder uses demo opportunity data only. Production grant discovery should verify official sources, deadlines, eligibility rules, documents, and application submission requirements.",
  opportunities: [
    {
      id: "grant-university-innovation-mini",
      title: "University Innovation Mini Grant",
      provider: "University Research Office",
      sourceType: "university",
      fitStatus: "strong",
      deadlineStatus: "open",
      amountLabel: "PKR 100,000 demo",
      deadlineLabel: "Open · 21 days left",
      category: "Student prototype support",
      matchScore: 91,
      summary:
        "Supports student teams building practical prototypes with supervisor review, evidence files, and final documentation outputs.",
      bestFor: "Prototype components, validation tests, and final defense evidence.",
      requirements: [
        { id: "req-supervisor", label: "Supervisor endorsement", status: "matched", helper: "Supervisor verification note exists." },
        { id: "req-budget", label: "Budget breakdown", status: "needs_review", helper: "Budget lines need final reviewer approval." },
        { id: "req-proposal", label: "Project proposal", status: "matched", helper: "Campaign story and proposal summary are available." },
      ],
    },
    {
      id: "grant-industry-lab-equipment",
      title: "Industry Lab Equipment Support",
      provider: "Technology Partner Network",
      sourceType: "industry",
      fitStatus: "medium",
      deadlineStatus: "closing_soon",
      amountLabel: "PKR 250,000 demo",
      deadlineLabel: "Closing soon · 7 days left",
      category: "Prototype and equipment",
      matchScore: 76,
      summary:
        "Targets student prototypes that need components, test equipment, and a clear usage accountability report for sponsors.",
      bestFor: "Hardware kit, testing equipment, and impact update reporting.",
      requirements: [
        { id: "req-company-letter", label: "Industry relevance letter", status: "missing", helper: "No partner letter is attached yet." },
        { id: "req-impact", label: "Impact update plan", status: "matched", helper: "Impact update cadence exists in demo funding tools." },
        { id: "req-ledger", label: "Funding ledger", status: "needs_review", helper: "Ledger is demo-only and needs production setup." },
      ],
    },
    {
      id: "grant-government-youth-research",
      title: "Youth Research Commercialization Grant",
      provider: "Public Innovation Program",
      sourceType: "government",
      fitStatus: "medium",
      deadlineStatus: "upcoming",
      amountLabel: "PKR 500,000 demo",
      deadlineLabel: "Upcoming · opens next month",
      category: "Research commercialization",
      matchScore: 68,
      summary:
        "Designed for early research projects with commercialization potential, documentation maturity, and validated prototype evidence.",
      bestFor: "Prototype scale-up after initial validation evidence is complete.",
      requirements: [
        { id: "req-registration", label: "Team registration", status: "needs_review", helper: "Team ownership and roles need official validation." },
        { id: "req-validation", label: "Validation evidence", status: "missing", helper: "Initial test log is still missing." },
        { id: "req-commercial", label: "Commercialization plan", status: "missing", helper: "Business/market plan is not attached yet." },
      ],
    },
    {
      id: "grant-international-open-science",
      title: "Open Science Student Seed Fund",
      provider: "International Research Commons",
      sourceType: "international",
      fitStatus: "low",
      deadlineStatus: "open",
      amountLabel: "USD 1,000 demo",
      deadlineLabel: "Open · 35 days left",
      category: "Open research documentation",
      matchScore: 52,
      summary:
        "Focuses on open documentation, reproducible research notes, shared datasets, and community learning resources.",
      bestFor: "Publishing non-sensitive documentation and reusable student research templates.",
      requirements: [
        { id: "req-open-license", label: "Open license plan", status: "missing", helper: "No open license decision exists yet." },
        { id: "req-dataset", label: "Shareable dataset", status: "needs_review", helper: "Evidence files need privacy review before sharing." },
        { id: "req-report", label: "Public report", status: "matched", helper: "Report builder outputs can support this." },
      ],
    },
  ],
};

export function getGrantSourceTypeLabel(type: GrantSourceType): string {
  if (type === "government") return "Government";
  if (type === "university") return "University";
  if (type === "industry") return "Industry";
  if (type === "ngo") return "NGO";
  return "International";
}

export function getGrantFitStatusLabel(status: GrantFitStatus): string {
  if (status === "strong") return "Strong Fit";
  if (status === "medium") return "Medium Fit";
  if (status === "blocked") return "Blocked";
  return "Low Fit";
}

export function getGrantFitStatusClass(status: GrantFitStatus): string {
  if (status === "strong") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getGrantDeadlineStatusLabel(status: GrantDeadlineStatus): string {
  if (status === "open") return "Open";
  if (status === "closing_soon") return "Closing Soon";
  if (status === "upcoming") return "Upcoming";
  return "Closed";
}

export function getGrantDeadlineStatusClass(status: GrantDeadlineStatus): string {
  if (status === "open") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "closing_soon") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "upcoming") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getGrantRequirementStatusLabel(status: GrantRequirementStatus): string {
  if (status === "matched") return "Matched";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getGrantRequirementStatusClass(status: GrantRequirementStatus): string {
  if (status === "matched") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getGrantFinderCounts(summary: GrantFinderSummary = DEMO_GRANT_FINDER) {
  return {
    grants: summary.opportunities.length,
    strongFits: summary.opportunities.filter((grant) => grant.fitStatus === "strong").length,
    openGrants: summary.opportunities.filter((grant) => grant.deadlineStatus === "open" || grant.deadlineStatus === "closing_soon").length,
    missingRequirements: summary.opportunities
      .flatMap((grant) => grant.requirements)
      .filter((requirement) => requirement.status === "missing").length,
    averageScore: Math.round(
      summary.opportunities.reduce((total, grant) => total + grant.matchScore, 0) / summary.opportunities.length,
    ),
  };
}
