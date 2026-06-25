import { FYP_REPORT_SECTIONS } from "@/config/fypReport";
import { METHODOLOGY_SECTIONS } from "@/config/methodologyBuilder";
import { RESEARCH_PROPOSAL_SECTIONS } from "@/config/researchProposal";

export type TrackedReportArea = "final_report" | "proposal" | "methodology";
export type TrackedReportStatus = "not_started" | "draft" | "review" | "complete";

export type TrackedReportSection = {
  id: string;
  area: TrackedReportArea;
  areaLabel: string;
  title: string;
  status: TrackedReportStatus;
  owner: string;
  nextStep: string;
  evidenceCount: number;
};

export const TRACKED_REPORT_SECTIONS: TrackedReportSection[] = [
  ...FYP_REPORT_SECTIONS.map((section) => ({
    id: `final-report-${section.id}`,
    area: "final_report" as const,
    areaLabel: "Final Report",
    title: section.title,
    status: section.status,
    owner: section.status === "complete" ? "Report Lead" : section.status === "review" ? "Supervisor" : "Student Team",
    nextStep:
      section.status === "complete"
        ? "Keep section locked unless supervisor asks for changes."
        : section.status === "review"
        ? "Collect supervisor comments and close review notes."
        : section.status === "draft"
        ? "Polish content and attach missing evidence."
        : "Start section outline and assign writer.",
    evidenceCount: section.evidenceNeeded.length,
  })),
  ...RESEARCH_PROPOSAL_SECTIONS.map((section) => ({
    id: `proposal-${section.id}`,
    area: "proposal" as const,
    areaLabel: "Proposal",
    title: section.title,
    status: section.status,
    owner: section.status === "complete" ? "Research Lead" : section.status === "review" ? "Supervisor" : "Research Team",
    nextStep:
      section.status === "complete"
        ? "Keep section ready for submission package."
        : section.status === "review"
        ? "Resolve review feedback before proposal export."
        : section.status === "draft"
        ? "Improve clarity, references, and evidence alignment."
        : "Prepare first draft and required evidence.",
    evidenceCount: section.evidenceNeeded.length,
  })),
  ...METHODOLOGY_SECTIONS.map((section) => ({
    id: `methodology-${section.id}`,
    area: "methodology" as const,
    areaLabel: "Methodology",
    title: section.title,
    status: section.status,
    owner: section.status === "complete" ? "Technical Lead" : section.status === "review" ? "Supervisor" : "Method Owner",
    nextStep:
      section.status === "complete"
        ? "Keep artifacts ready for final report and viva."
        : section.status === "review"
        ? "Answer review questions and close method risks."
        : section.status === "draft"
        ? "Attach diagrams, data notes, and validation assumptions."
        : "Create method outline and define required artifacts.",
    evidenceCount: section.artifactNeeded.length,
  })),
];

export function getTrackedStatusLabel(status: TrackedReportStatus): string {
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

export function getTrackedStatusClass(status: TrackedReportStatus): string {
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

export function getReportStatusScore(sections: TrackedReportSection[] = TRACKED_REPORT_SECTIONS): number {
  if (sections.length === 0) return 0;
  const score = sections.reduce((total, section) => {
    if (section.status === "complete") return total + 100;
    if (section.status === "review") return total + 70;
    if (section.status === "draft") return total + 40;
    return total;
  }, 0);
  return Math.round(score / sections.length);
}

export function getReportStatusCounts(sections: TrackedReportSection[] = TRACKED_REPORT_SECTIONS) {
  return {
    complete: sections.filter((section) => section.status === "complete").length,
    review: sections.filter((section) => section.status === "review").length,
    draft: sections.filter((section) => section.status === "draft").length,
    notStarted: sections.filter((section) => section.status === "not_started").length,
  };
}

export function getAreaSections(area: TrackedReportArea, sections: TrackedReportSection[] = TRACKED_REPORT_SECTIONS): TrackedReportSection[] {
  return sections.filter((section) => section.area === area);
}
