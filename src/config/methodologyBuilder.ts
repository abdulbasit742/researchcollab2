export type MethodologySectionStatus = "not_started" | "draft" | "review" | "complete";
export type MethodologySectionCategory = "design" | "data" | "implementation" | "validation" | "ethics";

export type MethodologySection = {
  id: string;
  title: string;
  category: MethodologySectionCategory;
  description: string;
  status: MethodologySectionStatus;
  artifactNeeded: string[];
  reviewQuestions: string[];
  riskNote: string;
};

export const METHODOLOGY_SECTIONS: MethodologySection[] = [
  {
    id: "research-design",
    title: "Research / System Design",
    category: "design",
    description: "Define whether the project is experimental research, design science, survey-based, prototype-based, or mixed-method.",
    status: "review",
    artifactNeeded: ["Design type", "Scope boundary", "Variables/modules", "Success criteria"],
    reviewQuestions: ["Does the design match the problem?", "Are objectives measurable?", "Can reviewers verify the outcome?"],
    riskNote: "Weak design alignment can make results hard to defend in viva or supervisor review.",
  },
  {
    id: "architecture-workflow",
    title: "Architecture & Workflow",
    category: "implementation",
    description: "Map system modules, user flows, data movement, external services, and expected interactions.",
    status: "draft",
    artifactNeeded: ["Architecture diagram", "User flow", "Module list", "Integration notes"],
    reviewQuestions: ["Are all modules connected to a project objective?", "Are dependencies documented?", "Is the flow understandable to non-developers?"],
    riskNote: "Missing architecture can cause scope creep and unclear team ownership.",
  },
  {
    id: "data-sampling",
    title: "Data, Sampling & Inputs",
    category: "data",
    description: "Document datasets, sample size, collection method, input assumptions, consent needs, and data quality checks.",
    status: "draft",
    artifactNeeded: ["Data source", "Sampling plan", "Data fields", "Quality checks"],
    reviewQuestions: ["Is the data source valid?", "Is the sample enough for the claim?", "Are privacy limits respected?"],
    riskNote: "Unclear data assumptions can weaken results and create ethics/privacy problems.",
  },
  {
    id: "tools-tech-stack",
    title: "Tools, Technology & Setup",
    category: "implementation",
    description: "List frontend/backend tools, databases, models, hardware, libraries, and setup requirements.",
    status: "complete",
    artifactNeeded: ["Tech stack list", "Setup steps", "Library/model choices", "Version notes"],
    reviewQuestions: ["Why were these tools selected?", "Can another team reproduce setup?", "Are paid tools or APIs clearly labelled?"],
    riskNote: "Untracked tools or versions can make demos hard to reproduce.",
  },
  {
    id: "testing-validation",
    title: "Testing, Validation & Evaluation",
    category: "validation",
    description: "Define test cases, metrics, acceptance criteria, validation method, and evidence expected at each milestone.",
    status: "not_started",
    artifactNeeded: ["Test case table", "Evaluation metrics", "Acceptance criteria", "Evidence screenshots/results"],
    reviewQuestions: ["Do tests map to objectives?", "Are failures documented honestly?", "Can results be repeated?"],
    riskNote: "Without validation, the project may look built but not proven.",
  },
  {
    id: "ethics-limitations",
    title: "Ethics, Limitations & Responsible Use",
    category: "ethics",
    description: "Record consent, privacy, safety, limitations, bias risks, and responsible use boundaries.",
    status: "not_started",
    artifactNeeded: ["Ethics notes", "Limitations list", "Privacy controls", "Responsible use boundaries"],
    reviewQuestions: ["Does the project involve people/private data?", "Are limitations clear?", "Are risks reduced with safeguards?"],
    riskNote: "Skipping ethics and limitations can create trust, compliance, and grading risk.",
  },
];

export function getMethodologyStatusLabel(status: MethodologySectionStatus): string {
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

export function getMethodologyStatusClass(status: MethodologySectionStatus): string {
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

export function getMethodologyCategoryLabel(category: MethodologySectionCategory): string {
  switch (category) {
    case "design":
      return "Design";
    case "data":
      return "Data";
    case "implementation":
      return "Implementation";
    case "validation":
      return "Validation";
    case "ethics":
      return "Ethics";
    default:
      return "Method";
  }
}

export function getMethodologyReadiness(sections: MethodologySection[] = METHODOLOGY_SECTIONS): number {
  if (sections.length === 0) return 0;
  const score = sections.reduce((total, section) => {
    if (section.status === "complete") return total + 100;
    if (section.status === "review") return total + 70;
    if (section.status === "draft") return total + 40;
    return total;
  }, 0);
  return Math.round(score / sections.length);
}

export function getMethodologyReadinessLabel(score: number): string {
  if (score >= 85) return "Defense Ready";
  if (score >= 65) return "Review Ready";
  if (score >= 35) return "Drafting";
  return "Needs Setup";
}
