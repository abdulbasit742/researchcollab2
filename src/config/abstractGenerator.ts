export type AbstractBlockStatus = "missing" | "draft" | "evidence_needed" | "ready";
export type AbstractBlockType = "problem" | "method" | "results" | "contribution" | "keywords";

export type AbstractInputBlock = {
  id: string;
  type: AbstractBlockType;
  label: string;
  status: AbstractBlockStatus;
  content: string;
  evidenceRequirement: string;
  warning?: string;
};

export const ABSTRACT_INPUT_BLOCKS: AbstractInputBlock[] = [
  {
    id: "abstract-problem",
    type: "problem",
    label: "Problem / Context",
    status: "ready",
    content:
      "Manual and single-method attendance workflows can be time-consuming, error-prone, and difficult to connect with student engagement support.",
    evidenceRequirement: "Link to problem notes, literature matrix, or local validation evidence.",
  },
  {
    id: "abstract-method",
    type: "method",
    label: "Method / Approach",
    status: "draft",
    content:
      "The project proposes a smart attendance and engagement workflow that combines verification options, dashboard signals, and supervisor-reviewed evidence tracking.",
    evidenceRequirement: "Attach methodology, architecture, and validation plan before final abstract export.",
    warning: "Do not describe unbuilt features as completed implementation.",
  },
  {
    id: "abstract-results",
    type: "results",
    label: "Results / Evaluation",
    status: "evidence_needed",
    content:
      "Expected evaluation will include workflow testing, evidence links, validation cases, and supervisor review readiness checks.",
    evidenceRequirement: "Replace expected results with measured results after testing is complete.",
    warning: "Results section must not claim accuracy, adoption, or impact without test evidence.",
  },
  {
    id: "abstract-contribution",
    type: "contribution",
    label: "Contribution / Value",
    status: "draft",
    content:
      "The contribution is a privacy-aware and evidence-linked project workflow that helps students prepare report, proposal, methodology, and viva-ready materials.",
    evidenceRequirement: "Connect contribution to research gap finder and literature review assistant outputs.",
  },
  {
    id: "abstract-keywords",
    type: "keywords",
    label: "Keywords",
    status: "ready",
    content: "smart attendance, learning analytics, evidence tracking, research workflow, FYP management",
    evidenceRequirement: "Confirm keywords match title, methodology, and literature review themes.",
  },
];

export const ABSTRACT_DRAFT =
  "This project addresses the challenge of manual and single-method attendance workflows that can be time-consuming, error-prone, and difficult to connect with student engagement support. It proposes a smart attendance and engagement workflow that combines verification options, dashboard signals, and supervisor-reviewed evidence tracking. The planned evaluation includes workflow testing, validation cases, evidence links, and review-readiness checks. The expected contribution is a privacy-aware and evidence-linked project workflow that supports report, proposal, methodology, and viva-ready preparation. Keywords include smart attendance, learning analytics, evidence tracking, research workflow, and FYP management.";

export function getAbstractBlockStatusLabel(status: AbstractBlockStatus): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "evidence_needed":
      return "Evidence Needed";
    case "draft":
      return "Draft";
    default:
      return "Missing";
  }
}

export function getAbstractBlockStatusClass(status: AbstractBlockStatus): string {
  switch (status) {
    case "ready":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "evidence_needed":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "draft":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getAbstractReadiness(blocks: AbstractInputBlock[] = ABSTRACT_INPUT_BLOCKS): number {
  if (blocks.length === 0) return 0;
  const score = blocks.reduce((total, block) => {
    if (block.status === "ready") return total + 100;
    if (block.status === "draft") return total + 65;
    if (block.status === "evidence_needed") return total + 35;
    return total;
  }, 0);
  return Math.round(score / blocks.length);
}

export function getAbstractCounts(blocks: AbstractInputBlock[] = ABSTRACT_INPUT_BLOCKS) {
  return {
    total: blocks.length,
    ready: blocks.filter((block) => block.status === "ready").length,
    drafts: blocks.filter((block) => block.status === "draft").length,
    evidenceNeeded: blocks.filter((block) => block.status === "evidence_needed").length,
    missing: blocks.filter((block) => block.status === "missing").length,
  };
}
