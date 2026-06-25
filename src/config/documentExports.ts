export type ExportFormat = "pdf" | "docx";
export type ExportArea = "final_report" | "proposal" | "methodology" | "evidence_bundle";
export type ExportReadinessStatus = "blocked" | "needs_review" | "ready";

export type ExportTarget = {
  id: string;
  title: string;
  area: ExportArea;
  format: ExportFormat;
  status: ExportReadinessStatus;
  fileName: string;
  description: string;
  blockers: string[];
  includedSections: string[];
};

export const DOCUMENT_EXPORT_TARGETS: ExportTarget[] = [
  {
    id: "final-report-pdf",
    title: "Final Report PDF",
    area: "final_report",
    format: "pdf",
    status: "blocked",
    fileName: "fyp-final-report.pdf",
    description: "Submission-style PDF export for the final FYP/research report.",
    blockers: ["Resolve high-risk citation warnings", "Attach missing validation evidence", "Close supervisor revision comments"],
    includedSections: ["Title Page", "Abstract", "Introduction", "Methodology", "Testing & Results", "References"],
  },
  {
    id: "final-report-docx",
    title: "Final Report DOCX",
    area: "final_report",
    format: "docx",
    status: "needs_review",
    fileName: "fyp-final-report.docx",
    description: "Editable DOCX export for supervisor review and formatting adjustments.",
    blockers: ["Review section status tracker", "Confirm reference style", "Add remaining appendix evidence"],
    includedSections: ["Report Sections", "Evidence Notes", "Supervisor Comments", "Appendix Checklist"],
  },
  {
    id: "proposal-pdf",
    title: "Research Proposal PDF",
    area: "proposal",
    format: "pdf",
    status: "blocked",
    fileName: "research-proposal.pdf",
    description: "Formal PDF proposal package for supervisor or department review.",
    blockers: ["Complete ethics/data risk section", "Verify outdated privacy references", "Add expected outcomes"],
    includedSections: ["Problem Statement", "Research Gap", "Questions/Objectives", "Methodology", "Ethics", "Timeline"],
  },
  {
    id: "proposal-docx",
    title: "Research Proposal DOCX",
    area: "proposal",
    format: "docx",
    status: "needs_review",
    fileName: "research-proposal.docx",
    description: "Editable proposal draft for supervisor comments and department formatting.",
    blockers: ["Resolve open proposal comments", "Normalize citation style"],
    includedSections: ["Proposal Sections", "Literature Plan", "Budget/Timeline", "References"],
  },
  {
    id: "methodology-pdf",
    title: "Methodology PDF",
    area: "methodology",
    format: "pdf",
    status: "blocked",
    fileName: "methodology-validation-plan.pdf",
    description: "Methodology and validation plan export for viva/readiness review.",
    blockers: ["Add architecture evidence", "Create validation test table", "Complete ethics and limitations"],
    includedSections: ["Research Design", "Architecture", "Data Inputs", "Tools", "Validation", "Risks"],
  },
  {
    id: "evidence-bundle-docx",
    title: "Evidence Bundle DOCX",
    area: "evidence_bundle",
    format: "docx",
    status: "ready",
    fileName: "project-evidence-bundle.docx",
    description: "Editable evidence handover bundle summarizing linked proof, screenshots, tests, and references.",
    blockers: [],
    includedSections: ["Evidence Links", "Citation Warnings", "Version History", "Supervisor Actions"],
  },
];

export function getExportFormatLabel(format: ExportFormat): string {
  return format === "pdf" ? "PDF" : "DOCX";
}

export function getExportStatusLabel(status: ExportReadinessStatus): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "needs_review":
      return "Needs Review";
    default:
      return "Blocked";
  }
}

export function getExportStatusClass(status: ExportReadinessStatus): string {
  switch (status) {
    case "ready":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "needs_review":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-red-500/10 text-red-600 border-red-500/30";
  }
}

export function getExportReadinessScore(targets: ExportTarget[] = DOCUMENT_EXPORT_TARGETS): number {
  if (targets.length === 0) return 100;
  const score = targets.reduce((total, target) => {
    if (target.status === "ready") return total + 100;
    if (target.status === "needs_review") return total + 55;
    return total;
  }, 0);
  return Math.round(score / targets.length);
}

export function getExportStatusCounts(targets: ExportTarget[] = DOCUMENT_EXPORT_TARGETS) {
  return {
    ready: targets.filter((target) => target.status === "ready").length,
    needsReview: targets.filter((target) => target.status === "needs_review").length,
    blocked: targets.filter((target) => target.status === "blocked").length,
  };
}
