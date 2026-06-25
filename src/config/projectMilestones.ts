export type MilestoneStatus = "planned" | "in_progress" | "submitted" | "approved" | "blocked";
export type MilestonePriority = "low" | "medium" | "high";

export type ProjectMilestone = {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  priority: MilestonePriority;
  owner: string;
  dueLabel: string;
  deliverables: string[];
  acceptanceCriteria: string[];
  progress: number;
};

export const DEMO_PROJECT_MILESTONES: ProjectMilestone[] = [
  {
    id: "scope-freeze",
    title: "Discovery & Scope Freeze",
    description: "Confirm problem statement, success metrics, expected outputs, and final demo boundaries.",
    status: "approved",
    priority: "high",
    owner: "Project Owner + Supervisor",
    dueLabel: "Week 1",
    deliverables: ["Final scope brief", "Stakeholder notes", "Success criteria"],
    acceptanceCriteria: ["Problem is clearly defined", "Outcomes are measurable", "Supervisor accepts scope"],
    progress: 100,
  },
  {
    id: "prototype-plan",
    title: "Prototype / Research Plan Approval",
    description: "Convert scope into technical plan, research method, experiment plan, or prototype architecture.",
    status: "in_progress",
    priority: "high",
    owner: "Student Team",
    dueLabel: "Week 3",
    deliverables: ["System architecture", "Methodology plan", "Milestone evidence checklist"],
    acceptanceCriteria: ["Plan is feasible", "Risks are documented", "Required skills are mapped"],
    progress: 55,
  },
  {
    id: "execution-build",
    title: "Execution Build / Research Work",
    description: "Implement prototype, collect evidence, run experiments, or complete literature/research execution.",
    status: "planned",
    priority: "medium",
    owner: "Execution Team",
    dueLabel: "Week 8",
    deliverables: ["Working demo or research outputs", "Evidence screenshots", "Progress report"],
    acceptanceCriteria: ["Core feature/research goal works", "Evidence is attached", "Reviewer can reproduce results"],
    progress: 0,
  },
  {
    id: "final-handover",
    title: "Final Demo, Report & Handover",
    description: "Package final work into report, demo, presentation, and handover evidence.",
    status: "planned",
    priority: "medium",
    owner: "Full Project Team",
    dueLabel: "Week 12",
    deliverables: ["Final report", "Demo video", "Presentation slides", "Handover notes"],
    acceptanceCriteria: ["Final demo accepted", "Report is complete", "All files are attached"],
    progress: 0,
  },
];

export function getMilestoneStatusLabel(status: MilestoneStatus): string {
  switch (status) {
    case "planned":
      return "Planned";
    case "in_progress":
      return "In Progress";
    case "submitted":
      return "Submitted";
    case "approved":
      return "Approved";
    case "blocked":
      return "Blocked";
    default:
      return "Planned";
  }
}

export function getMilestoneStatusClass(status: MilestoneStatus): string {
  switch (status) {
    case "approved":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "in_progress":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "submitted":
      return "bg-primary/10 text-primary border-primary/30";
    case "blocked":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getMilestonePriorityClass(priority: MilestonePriority): string {
  switch (priority) {
    case "high":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getMilestoneCompletionScore(milestones: ProjectMilestone[]): number {
  if (milestones.length === 0) return 0;
  const total = milestones.reduce((sum, milestone) => sum + milestone.progress, 0);
  return Math.round(total / milestones.length);
}
