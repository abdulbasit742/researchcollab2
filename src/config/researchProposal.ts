export type ResearchProposalSectionStatus = "not_started" | "draft" | "review" | "complete";
export type ResearchProposalSectionCategory = "core" | "method" | "planning" | "support";

export type ResearchProposalSection = {
  id: string;
  title: string;
  category: ResearchProposalSectionCategory;
  description: string;
  status: ResearchProposalSectionStatus;
  required: boolean;
  wordTarget: string;
  evidenceNeeded: string[];
  guidance: string[];
};

export const RESEARCH_PROPOSAL_SECTIONS: ResearchProposalSection[] = [
  {
    id: "title-summary",
    title: "Title, Abstract & Keywords",
    category: "core",
    description: "Working title, short proposal abstract, keywords, researcher/team details, and supervisor information.",
    status: "draft",
    required: true,
    wordTarget: "250–350 words",
    evidenceNeeded: ["Working title", "Abstract", "3–6 keywords", "Researcher/supervisor details"],
    guidance: ["Keep the title specific and researchable.", "State problem, method, and expected contribution in the abstract."],
  },
  {
    id: "background-problem",
    title: "Background & Problem Statement",
    category: "core",
    description: "Context, research problem, motivation, and why the study matters academically or practically.",
    status: "review",
    required: true,
    wordTarget: "800–1200 words",
    evidenceNeeded: ["Problem context", "Stakeholder/field need", "Problem statement", "Motivation"],
    guidance: ["Move from broad context to a precise problem.", "Avoid claiming impact without supporting evidence."],
  },
  {
    id: "research-gap",
    title: "Research Gap & Significance",
    category: "core",
    description: "Gap found in existing work and the expected contribution of the proposed study.",
    status: "draft",
    required: true,
    wordTarget: "600–900 words",
    evidenceNeeded: ["Recent references", "Gap statement", "Contribution statement", "Significance for field/users"],
    guidance: ["Show what previous work missed or left unresolved.", "Connect significance to measurable contribution."],
  },
  {
    id: "questions-objectives",
    title: "Research Questions & Objectives",
    category: "core",
    description: "Research questions, aims, objectives, hypotheses if relevant, and scope boundaries.",
    status: "complete",
    required: true,
    wordTarget: "400–700 words",
    evidenceNeeded: ["Research questions", "Objectives", "Scope", "Hypotheses if applicable"],
    guidance: ["Make each objective testable or verifiable.", "Keep objectives aligned with methodology."],
  },
  {
    id: "literature-plan",
    title: "Preliminary Literature Review Plan",
    category: "support",
    description: "Search strategy, themes, key papers, and comparison structure for the future literature review.",
    status: "draft",
    required: true,
    wordTarget: "900–1500 words",
    evidenceNeeded: ["Search keywords", "Key papers", "Comparison themes", "Citation style"],
    guidance: ["Use a matrix or table for comparison.", "Prioritize recent and high-quality references."],
  },
  {
    id: "methodology",
    title: "Methodology & Research Design",
    category: "method",
    description: "Study design, data collection, sampling, tools, experimental setup, analysis method, and validity plan.",
    status: "draft",
    required: true,
    wordTarget: "1200–2000 words",
    evidenceNeeded: ["Research design", "Data source", "Sampling plan", "Analysis method", "Validity/reliability plan"],
    guidance: ["Explain why this method fits the research questions.", "Mention constraints and limitations clearly."],
  },
  {
    id: "ethics-data",
    title: "Ethics, Data & Risk Plan",
    category: "method",
    description: "Ethical considerations, consent/data privacy, risk controls, and responsible research safeguards.",
    status: "not_started",
    required: true,
    wordTarget: "500–900 words",
    evidenceNeeded: ["Ethics concerns", "Consent/data plan", "Risk mitigation", "Storage/privacy notes"],
    guidance: ["Do not skip ethics if humans, health, education, or private data are involved.", "State how data will be protected."],
  },
  {
    id: "timeline-budget",
    title: "Timeline, Resources & Budget",
    category: "planning",
    description: "Research phases, schedule, required tools/resources, estimated budget, and dependency plan.",
    status: "not_started",
    required: true,
    wordTarget: "400–700 words",
    evidenceNeeded: ["Timeline", "Tools/resources", "Budget estimate", "Dependencies"],
    guidance: ["Break the project into realistic phases.", "Mark assumptions that can change later."],
  },
  {
    id: "expected-outcomes",
    title: "Expected Outcomes & Dissemination",
    category: "planning",
    description: "Expected findings, deliverables, publication/presentation plan, and practical outputs.",
    status: "not_started",
    required: true,
    wordTarget: "400–700 words",
    evidenceNeeded: ["Expected findings", "Deliverables", "Publication/presentation plan", "Impact statement"],
    guidance: ["Avoid guaranteeing results before research is done.", "Describe what evidence will be produced."],
  },
  {
    id: "references",
    title: "References",
    category: "support",
    description: "Initial references formatted in one consistent citation style.",
    status: "draft",
    required: true,
    wordTarget: "As needed",
    evidenceNeeded: ["Formatted references", "Citation style", "Reference manager/source notes"],
    guidance: ["Use one citation style consistently.", "Prefer primary papers and official reports over weak sources."],
  },
];

export function getResearchProposalStatusLabel(status: ResearchProposalSectionStatus): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "review":
      return "In Review";
    case "draft":
      return "Draft";
    default:
      return "Not Started";
  }
}

export function getResearchProposalStatusClass(status: ResearchProposalSectionStatus): string {
  switch (status) {
    case "complete":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "review":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "draft":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getResearchProposalCategoryLabel(category: ResearchProposalSectionCategory): string {
  switch (category) {
    case "core":
      return "Core";
    case "method":
      return "Method";
    case "planning":
      return "Planning";
    default:
      return "Support";
  }
}

export function getResearchProposalCompletionScore(sections: ResearchProposalSection[] = RESEARCH_PROPOSAL_SECTIONS): number {
  if (sections.length === 0) return 0;
  const score = sections.reduce((total, section) => {
    if (section.status === "complete") return total + 100;
    if (section.status === "review") return total + 70;
    if (section.status === "draft") return total + 40;
    return total;
  }, 0);
  return Math.round(score / sections.length);
}

export function getResearchProposalReadinessLabel(score: number): string {
  if (score >= 85) return "Submission Ready";
  if (score >= 65) return "Supervisor Review Ready";
  if (score >= 35) return "Drafting";
  return "Needs Setup";
}
