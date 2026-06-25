export type ProjectWorkspaceTabId =
  | "overview"
  | "milestones"
  | "tasks"
  | "files"
  | "team"
  | "funding"
  | "activity";

export type ProjectWorkspaceStatus = "draft" | "review" | "active" | "blocked" | "completed";

export type ProjectWorkspaceTab = {
  id: ProjectWorkspaceTabId;
  label: string;
  description: string;
  badge?: string;
};

export type ProjectWorkspaceSummary = {
  id: string;
  title: string;
  type: "FYP" | "Research" | "Prototype";
  status: ProjectWorkspaceStatus;
  owner: string;
  department: string;
  timeline: string;
  budgetLabel: string;
  progress: number;
  riskLevel: "Low" | "Medium" | "High";
};

export const PROJECT_WORKSPACE_TABS: ProjectWorkspaceTab[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Project summary, scope, outcomes, and readiness status.",
  },
  {
    id: "milestones",
    label: "Milestones",
    description: "Execution phases, acceptance criteria, and review checkpoints.",
    badge: "Next",
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Action items for students, researchers, supervisors, and sponsors.",
  },
  {
    id: "files",
    label: "Files",
    description: "Reports, proposals, datasets, demos, and evidence uploads.",
  },
  {
    id: "team",
    label: "Team",
    description: "Team members, supervisor, sponsor, and role assignments.",
  },
  {
    id: "funding",
    label: "Funding",
    description: "Demo-safe budget, milestones, release labels, and contribution records.",
  },
  {
    id: "activity",
    label: "Activity",
    description: "Timeline of updates, comments, status changes, and decisions.",
  },
];

export const DEMO_PROJECT_WORKSPACE: ProjectWorkspaceSummary = {
  id: "demo-project-workspace",
  title: "AI-Based Attendance & Engagement System",
  type: "FYP",
  status: "draft",
  owner: "ResearchCollab Demo Team",
  department: "Computer Science / Software Engineering",
  timeline: "10–12 weeks",
  budgetLabel: "PKR 150K–250K",
  progress: 18,
  riskLevel: "Medium",
};

export function getProjectWorkspaceTab(id?: string | null): ProjectWorkspaceTab {
  return PROJECT_WORKSPACE_TABS.find((tab) => tab.id === id) ?? PROJECT_WORKSPACE_TABS[0];
}

export function getProjectWorkspaceStatusLabel(status: ProjectWorkspaceStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "review":
      return "In Review";
    case "active":
      return "Active";
    case "blocked":
      return "Blocked";
    case "completed":
      return "Completed";
    default:
      return "Draft";
  }
}

export function getProjectWorkspaceStatusClass(status: ProjectWorkspaceStatus): string {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "review":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "blocked":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "completed":
      return "bg-primary/10 text-primary border-primary/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
