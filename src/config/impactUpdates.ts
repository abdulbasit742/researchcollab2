export type ImpactUpdateStatus = "draft" | "review" | "published" | "needs_evidence";
export type ImpactUpdateAudience = "funders" | "public" | "supervisors" | "internal";
export type ImpactEvidenceStatus = "attached" | "missing" | "needs_review";
export type ImpactMetricTrend = "up" | "steady" | "risk";

export type ImpactUpdateMetric = {
  id: string;
  label: string;
  value: string;
  trend: ImpactMetricTrend;
  helper: string;
};

export type ImpactEvidenceItem = {
  id: string;
  title: string;
  status: ImpactEvidenceStatus;
  source: string;
  note: string;
};

export type CampaignImpactUpdate = {
  id: string;
  campaignTitle: string;
  title: string;
  status: ImpactUpdateStatus;
  audience: ImpactUpdateAudience;
  author: string;
  timeLabel: string;
  summary: string;
  nextAction: string;
  metrics: ImpactUpdateMetric[];
  evidence: ImpactEvidenceItem[];
};

export const DEMO_IMPACT_UPDATES: CampaignImpactUpdate[] = [
  {
    id: "impact-prototype-evidence",
    campaignTitle: "Smart Lab Assistant for FYP Teams",
    title: "Prototype evidence uploaded",
    status: "review",
    audience: "funders",
    author: "Student Research Team",
    timeLabel: "Today, 16:20",
    summary:
      "The team uploaded component screenshots, an initial workflow note, and a prototype build plan for funder review before milestone release preview.",
    nextAction: "Reviewer should confirm whether prototype screenshots and component list satisfy Phase 1 evidence requirements.",
    metrics: [
      { id: "metric-progress", label: "Prototype progress", value: "62%", trend: "up", helper: "Based on submitted demo checklist." },
      { id: "metric-evidence", label: "Evidence files", value: "3/5", trend: "steady", helper: "Two proof files still need upload." },
      { id: "metric-risk", label: "Release risk", value: "Medium", trend: "risk", helper: "Payment/provider setup is missing." },
    ],
    evidence: [
      { id: "evidence-component-list", title: "Component list", status: "attached", source: "Files tab", note: "Core hardware list is available." },
      { id: "evidence-screenshots", title: "Prototype screenshots", status: "needs_review", source: "Project workspace", note: "Screenshots are attached but need reviewer confirmation." },
      { id: "evidence-test-log", title: "Initial test log", status: "missing", source: "Team upload", note: "Test log is still missing." },
    ],
  },
  {
    id: "impact-budget-review",
    campaignTitle: "AI Literature Helper for Student Researchers",
    title: "Budget breakdown needs detail",
    status: "needs_evidence",
    audience: "internal",
    author: "Academic Methods Lab",
    timeLabel: "Yesterday",
    summary:
      "The campaign explains the tool idea, but funders need clearer budget lines for model usage, hosting, dataset preparation, and supervision review.",
    nextAction: "Owner should attach a revised budget sheet and usage accountability note before public sponsor updates are sent.",
    metrics: [
      { id: "metric-budget", label: "Budget clarity", value: "48%", trend: "risk", helper: "Major line items need details." },
      { id: "metric-interest", label: "Funder interest", value: "2 watchers", trend: "up", helper: "Demo watchers only." },
      { id: "metric-policy", label: "Policy labels", value: "Partial", trend: "steady", helper: "Sponsor terms still need review." },
    ],
    evidence: [
      { id: "evidence-budget", title: "Budget sheet", status: "missing", source: "Campaign owner", note: "Detailed budget is required." },
      { id: "evidence-scope", title: "Scope note", status: "attached", source: "Campaign draft", note: "Initial project scope is present." },
      { id: "evidence-policy", title: "Usage accountability note", status: "needs_review", source: "Admin review", note: "Needs clearer reporting cadence." },
    ],
  },
  {
    id: "impact-supervisor-verification",
    campaignTitle: "Prototype Validation Kit",
    title: "Supervisor verification note reviewed",
    status: "published",
    audience: "supervisors",
    author: "Capstone Team Alpha",
    timeLabel: "2 days ago",
    summary:
      "Supervisor verification note confirms academic need for the validation kit, but campaign payment policy labels remain incomplete.",
    nextAction: "Keep the update visible to supervisors while payment labels remain locked for funders.",
    metrics: [
      { id: "metric-supervisor", label: "Supervisor status", value: "Reviewed", trend: "up", helper: "Academic verification exists." },
      { id: "metric-campaign", label: "Campaign readiness", value: "58%", trend: "steady", helper: "Policy setup is pending." },
      { id: "metric-risk", label: "Sponsor risk", value: "High", trend: "risk", helper: "Funding remains blocked." },
    ],
    evidence: [
      { id: "evidence-supervisor", title: "Supervisor note", status: "attached", source: "Supervisor", note: "Verification note is reviewed." },
      { id: "evidence-policy", title: "Payment policy label", status: "missing", source: "Admin", note: "Required before real funder action." },
      { id: "evidence-kit", title: "Kit usage plan", status: "needs_review", source: "Project team", note: "Usage plan needs more detail." },
    ],
  },
];

export function getImpactUpdateStatusLabel(status: ImpactUpdateStatus): string {
  if (status === "published") return "Published";
  if (status === "review") return "In Review";
  if (status === "needs_evidence") return "Needs Evidence";
  return "Draft";
}

export function getImpactUpdateStatusClass(status: ImpactUpdateStatus): string {
  if (status === "published") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "needs_evidence") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getImpactAudienceLabel(audience: ImpactUpdateAudience): string {
  if (audience === "public") return "Public";
  if (audience === "supervisors") return "Supervisors";
  if (audience === "internal") return "Internal";
  return "Funders";
}

export function getImpactAudienceClass(audience: ImpactUpdateAudience): string {
  if (audience === "public") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (audience === "supervisors") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  if (audience === "internal") return "bg-muted text-muted-foreground border-border";
  return "bg-primary/10 text-primary border-primary/30";
}

export function getImpactEvidenceStatusLabel(status: ImpactEvidenceStatus): string {
  if (status === "attached") return "Attached";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getImpactEvidenceStatusClass(status: ImpactEvidenceStatus): string {
  if (status === "attached") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getImpactMetricTrendClass(trend: ImpactMetricTrend): string {
  if (trend === "up") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (trend === "risk") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getImpactUpdateCounts(updates: CampaignImpactUpdate[] = DEMO_IMPACT_UPDATES) {
  return {
    updates: updates.length,
    published: updates.filter((update) => update.status === "published").length,
    needsEvidence: updates.filter((update) => update.status === "needs_evidence").length,
    attachedEvidence: updates.flatMap((update) => update.evidence).filter((item) => item.status === "attached").length,
    missingEvidence: updates.flatMap((update) => update.evidence).filter((item) => item.status === "missing").length,
  };
}
