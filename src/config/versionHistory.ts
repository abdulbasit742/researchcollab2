export type VersionHistoryArea = "final_report" | "proposal" | "methodology" | "workspace";
export type VersionHistoryStatus = "draft" | "snapshot" | "reviewed" | "locked";

export type VersionHistoryItem = {
  id: string;
  version: string;
  area: VersionHistoryArea;
  areaLabel: string;
  title: string;
  status: VersionHistoryStatus;
  author: string;
  createdLabel: string;
  changeSummary: string;
  changedSections: string[];
  reviewerNote?: string;
};

export const VERSION_HISTORY_ITEMS: VersionHistoryItem[] = [
  {
    id: "v-0-1-workspace",
    version: "v0.1",
    area: "workspace",
    areaLabel: "Workspace",
    title: "Initial workspace setup",
    status: "snapshot",
    author: "ResearchCollab System",
    createdLabel: "Today, 09:00",
    changeSummary: "Created workspace structure with overview, milestones, tasks, files, team, funding, and activity tabs.",
    changedSections: ["Workspace shell", "Project overview", "Activity timeline"],
  },
  {
    id: "v-0-2-report",
    version: "v0.2",
    area: "final_report",
    areaLabel: "Final Report",
    title: "Final report outline generated",
    status: "draft",
    author: "Report Lead",
    createdLabel: "Today, 10:00",
    changeSummary: "Added final report sections, readiness score, evidence checklist, and export placeholders.",
    changedSections: ["Abstract", "Introduction", "Methodology", "Testing & Results"],
    reviewerNote: "Supervisor review needed before submission-ready status.",
  },
  {
    id: "v-0-3-proposal",
    version: "v0.3",
    area: "proposal",
    areaLabel: "Proposal",
    title: "Research proposal structure added",
    status: "draft",
    author: "Research Team",
    createdLabel: "Today, 10:40",
    changeSummary: "Added proposal sections for problem, gap, questions, methodology, ethics, timeline, and references.",
    changedSections: ["Problem Statement", "Research Gap", "Methodology", "Ethics Plan"],
    reviewerNote: "Ethics and expected outcomes still need detail.",
  },
  {
    id: "v-0-4-methodology",
    version: "v0.4",
    area: "methodology",
    areaLabel: "Methodology",
    title: "Methodology builder baseline",
    status: "reviewed",
    author: "Technical Lead",
    createdLabel: "Today, 11:25",
    changeSummary: "Added methodology design, architecture, data, tools, testing, validation, and ethics sections.",
    changedSections: ["System Design", "Architecture", "Data Inputs", "Validation"],
    reviewerNote: "Validation plan and ethics section still need completion.",
  },
  {
    id: "v-0-5-comments",
    version: "v0.5",
    area: "final_report",
    areaLabel: "Final Report",
    title: "Supervisor feedback snapshot",
    status: "snapshot",
    author: "Supervisor Reviewer",
    createdLabel: "Today, 12:30",
    changeSummary: "Captured supervisor comments on report, proposal, and methodology sections for action tracking.",
    changedSections: ["Introduction", "Literature Review", "Ethics Plan", "Validation Plan"],
    reviewerNote: "Resolve high-priority comments before locking a review version.",
  },
];

export function getVersionStatusLabel(status: VersionHistoryStatus): string {
  switch (status) {
    case "locked":
      return "Locked";
    case "reviewed":
      return "Reviewed";
    case "snapshot":
      return "Snapshot";
    default:
      return "Draft";
  }
}

export function getVersionStatusClass(status: VersionHistoryStatus): string {
  switch (status) {
    case "locked":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "reviewed":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "snapshot":
      return "bg-primary/10 text-primary border-primary/30";
    default:
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  }
}

export function getLatestVersion(items: VersionHistoryItem[] = VERSION_HISTORY_ITEMS): VersionHistoryItem | undefined {
  return items[items.length - 1];
}

export function getVersionAreaCount(area: VersionHistoryArea, items: VersionHistoryItem[] = VERSION_HISTORY_ITEMS): number {
  return items.filter((item) => item.area === area).length;
}
