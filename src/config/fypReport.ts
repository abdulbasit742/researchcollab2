export type FYPReportSectionStatus = "not_started" | "draft" | "review" | "complete";

export type FYPReportSection = {
  id: string;
  title: string;
  description: string;
  status: FYPReportSectionStatus;
  required: boolean;
  wordTarget: string;
  evidenceNeeded: string[];
  guidance: string[];
};

export const FYP_REPORT_SECTIONS: FYPReportSection[] = [
  {
    id: "title-page",
    title: "Title Page & Approval Details",
    description: "Project title, team members, supervisor, department, university, and submission session.",
    status: "complete",
    required: true,
    wordTarget: "1 page",
    evidenceNeeded: ["Project title", "Team member names", "Supervisor name", "Department/session"],
    guidance: ["Use the official university title format.", "Keep names and registration numbers consistent across all report files."],
  },
  {
    id: "abstract",
    title: "Abstract",
    description: "A concise summary of the problem, method, implementation, results, and final outcome.",
    status: "draft",
    required: true,
    wordTarget: "200–300 words",
    evidenceNeeded: ["Problem summary", "Method summary", "Key result", "Final contribution"],
    guidance: ["Write this after core implementation/results are ready.", "Avoid references, long background, or unexplained acronyms."],
  },
  {
    id: "introduction",
    title: "Introduction",
    description: "Background, motivation, problem statement, objectives, scope, and report organization.",
    status: "review",
    required: true,
    wordTarget: "1200–1800 words",
    evidenceNeeded: ["Problem statement", "Objectives", "Scope boundaries", "Stakeholder need"],
    guidance: ["Explain why this project matters.", "Clearly separate objectives from deliverables."],
  },
  {
    id: "literature-review",
    title: "Literature Review / Existing Systems",
    description: "Comparison of related work, existing systems, limitations, and identified gap.",
    status: "draft",
    required: true,
    wordTarget: "1800–2500 words",
    evidenceNeeded: ["Reference list", "Comparison table", "Research/system gap", "Limitations of existing solutions"],
    guidance: ["Use recent and credible sources.", "Connect every reviewed work to your project gap."],
  },
  {
    id: "methodology",
    title: "Methodology / System Design",
    description: "Architecture, workflow, data model, algorithms, tools, and implementation plan.",
    status: "draft",
    required: true,
    wordTarget: "2000–3000 words",
    evidenceNeeded: ["Architecture diagram", "Workflow diagram", "Data model", "Tool choices"],
    guidance: ["Explain why each tool or method was selected.", "Include diagrams where they reduce confusion."],
  },
  {
    id: "implementation",
    title: "Implementation",
    description: "Modules built, important screens, backend logic, integrations, and technical challenges.",
    status: "not_started",
    required: true,
    wordTarget: "2500–3500 words",
    evidenceNeeded: ["Screenshots", "Module list", "API/database notes", "Technical challenges"],
    guidance: ["Do not paste long code blocks.", "Focus on what was built and how it works."],
  },
  {
    id: "testing-results",
    title: "Testing & Results",
    description: "Test cases, evaluation metrics, screenshots, user testing, and result interpretation.",
    status: "not_started",
    required: true,
    wordTarget: "1500–2500 words",
    evidenceNeeded: ["Test cases", "Result table", "Screenshots", "Limitations"],
    guidance: ["Link tests to objectives.", "Report failed/limited cases honestly."],
  },
  {
    id: "conclusion",
    title: "Conclusion & Future Work",
    description: "Final contribution, lessons learned, limitations, and future improvement directions.",
    status: "not_started",
    required: true,
    wordTarget: "800–1200 words",
    evidenceNeeded: ["Completed objectives", "Limitations", "Future work list"],
    guidance: ["Avoid adding new technical details here.", "State clearly what was achieved and what remains open."],
  },
  {
    id: "references-appendix",
    title: "References & Appendix",
    description: "Citations, appendix materials, extra diagrams, data samples, and supplementary evidence.",
    status: "draft",
    required: true,
    wordTarget: "As needed",
    evidenceNeeded: ["Formatted references", "Appendix screenshots", "Extra tables", "Supporting documents"],
    guidance: ["Use one citation style consistently.", "Move bulky supporting material into appendices."],
  },
];

export function getFYPReportStatusLabel(status: FYPReportSectionStatus): string {
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

export function getFYPReportStatusClass(status: FYPReportSectionStatus): string {
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

export function getFYPReportCompletionScore(sections: FYPReportSection[] = FYP_REPORT_SECTIONS): number {
  if (sections.length === 0) return 0;
  const score = sections.reduce((total, section) => {
    if (section.status === "complete") return total + 100;
    if (section.status === "review") return total + 70;
    if (section.status === "draft") return total + 40;
    return total;
  }, 0);
  return Math.round(score / sections.length);
}

export function getFYPReportReadinessLabel(score: number): string {
  if (score >= 85) return "Submission Ready";
  if (score >= 65) return "Review Ready";
  if (score >= 35) return "Drafting";
  return "Needs Setup";
}
