export type MethodologyAssistantStatus = "missing" | "draft" | "needs_evidence" | "ready";
export type MethodologyAssistantArea = "design" | "architecture" | "data" | "tools" | "validation" | "ethics";

export type MethodologyAssistantItem = {
  id: string;
  area: MethodologyAssistantArea;
  title: string;
  status: MethodologyAssistantStatus;
  draftText: string;
  artifactsNeeded: string[];
  validationChecks: string[];
  safePrompt: string;
  riskNote: string;
};

export const METHODOLOGY_ASSISTANT_ITEMS: MethodologyAssistantItem[] = [
  {
    id: "method-design-alignment",
    area: "design",
    title: "Research/System Design Alignment",
    status: "ready",
    draftText:
      "The methodology should explain the selected project design, its scope boundary, measurable objectives, and how each method step connects to the final deliverables.",
    artifactsNeeded: ["Design type", "Objective-to-method map", "Scope boundary", "Success criteria"],
    validationChecks: ["Objectives are measurable", "Method matches project problem", "Deliverables can be reviewed"],
    safePrompt:
      "Rewrite this methodology design section so it clearly maps objectives to methods without adding claims not present in the project evidence.",
    riskNote: "Weak alignment between objectives and method can make the project hard to defend during viva.",
  },
  {
    id: "method-architecture-workflow",
    area: "architecture",
    title: "Architecture and Workflow Explanation",
    status: "draft",
    draftText:
      "The system architecture should describe user roles, modules, data flow, verification workflow, dashboard outputs, and how evidence records support report preparation.",
    artifactsNeeded: ["Architecture diagram", "User flow", "Module responsibility list", "Integration notes"],
    validationChecks: ["Every module has a purpose", "Data movement is understandable", "Workflow supports project goals"],
    safePrompt:
      "Turn these architecture notes into a clear methodology paragraph and list missing diagrams or workflow evidence that must be attached.",
    riskNote: "Architecture text without diagrams may be difficult for supervisors and evaluators to verify.",
  },
  {
    id: "method-data-plan",
    area: "data",
    title: "Data, Sampling and Input Plan",
    status: "needs_evidence",
    draftText:
      "The data plan should define what inputs are collected, where they come from, how quality is checked, and how privacy or consent limits are handled.",
    artifactsNeeded: ["Input fields", "Sampling notes", "Data quality checks", "Consent/privacy note"],
    validationChecks: ["Data source is realistic", "Privacy limits are documented", "Sample assumptions are not overstated"],
    safePrompt:
      "Improve this data plan while clearly marking assumptions, missing evidence, and any privacy safeguards that require supervisor approval.",
    riskNote: "Unverified data assumptions can create ethics, privacy, and result-validity problems.",
  },
  {
    id: "method-validation-table",
    area: "validation",
    title: "Testing, Validation and Evaluation Plan",
    status: "needs_evidence",
    draftText:
      "Validation should include test cases, expected results, observed results, acceptance criteria, failure notes, and evidence links for each objective.",
    artifactsNeeded: ["Test case table", "Expected/observed results", "Acceptance criteria", "Evidence screenshots"],
    validationChecks: ["Tests map to objectives", "Failures are documented", "Results are repeatable"],
    safePrompt:
      "Create a validation-plan outline from these notes and avoid claiming accuracy or success until observed results are provided.",
    riskNote: "A project can look complete but remain academically weak if validation evidence is missing.",
  },
  {
    id: "method-ethics-limitations",
    area: "ethics",
    title: "Ethics, Limitations and Responsible Use",
    status: "missing",
    draftText:
      "The methodology should state limitations, responsible use boundaries, data handling constraints, fallback options, and any approval or consent requirements.",
    artifactsNeeded: ["Limitations list", "Responsible use note", "Consent/privacy safeguards", "Fallback workflow"],
    validationChecks: ["Limitations are honest", "Data handling is clear", "Sensitive claims are avoided"],
    safePrompt:
      "Draft an ethics and limitations subsection using only the provided project facts, and flag any policy or consent evidence that must be verified.",
    riskNote: "Skipping ethics and limitations can reduce trust and create compliance or grading risk.",
  },
];

export function getMethodologyAssistantStatusLabel(status: MethodologyAssistantStatus): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "needs_evidence":
      return "Needs Evidence";
    case "draft":
      return "Draft";
    default:
      return "Missing";
  }
}

export function getMethodologyAssistantStatusClass(status: MethodologyAssistantStatus): string {
  switch (status) {
    case "ready":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "needs_evidence":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "draft":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getMethodologyAssistantAreaLabel(area: MethodologyAssistantArea): string {
  switch (area) {
    case "design":
      return "Design";
    case "architecture":
      return "Architecture";
    case "data":
      return "Data";
    case "tools":
      return "Tools";
    case "validation":
      return "Validation";
    default:
      return "Ethics";
  }
}

export function getMethodologyAssistantReadiness(items: MethodologyAssistantItem[] = METHODOLOGY_ASSISTANT_ITEMS): number {
  if (items.length === 0) return 0;
  const score = items.reduce((total, item) => {
    if (item.status === "ready") return total + 100;
    if (item.status === "draft") return total + 65;
    if (item.status === "needs_evidence") return total + 35;
    return total;
  }, 0);
  return Math.round(score / items.length);
}

export function getMethodologyAssistantCounts(items: MethodologyAssistantItem[] = METHODOLOGY_ASSISTANT_ITEMS) {
  return {
    total: items.length,
    ready: items.filter((item) => item.status === "ready").length,
    drafts: items.filter((item) => item.status === "draft").length,
    needsEvidence: items.filter((item) => item.status === "needs_evidence").length,
    missing: items.filter((item) => item.status === "missing").length,
  };
}
