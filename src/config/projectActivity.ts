export type ProjectActivityType =
  | "created"
  | "status"
  | "milestone"
  | "task"
  | "review"
  | "file"
  | "team"
  | "funding"
  | "comment";

export type ProjectActivityImportance = "low" | "normal" | "high";

export type ProjectActivityItem = {
  id: string;
  type: ProjectActivityType;
  title: string;
  description: string;
  actor: string;
  timeLabel: string;
  importance: ProjectActivityImportance;
  metadata?: string;
};

export const DEMO_PROJECT_ACTIVITY: ProjectActivityItem[] = [
  {
    id: "workspace-created",
    type: "created",
    title: "Project workspace created",
    description: "A demo workspace was created from the FYP/research project intake flow.",
    actor: "ResearchCollab System",
    timeLabel: "Today, 09:00",
    importance: "normal",
    metadata: "Workspace setup",
  },
  {
    id: "scope-approved",
    type: "milestone",
    title: "Discovery & Scope Freeze approved",
    description: "Problem scope, measurable outcomes, and exclusions were marked ready for execution planning.",
    actor: "Project Owner + Supervisor",
    timeLabel: "Today, 09:20",
    importance: "high",
    metadata: "Milestone 1",
  },
  {
    id: "methodology-review",
    type: "review",
    title: "Methodology plan moved to review",
    description: "Reviewer needs to validate feasibility, risks, and acceptance criteria before the next milestone.",
    actor: "Reviewer",
    timeLabel: "Today, 10:15",
    importance: "high",
    metadata: "Review pending",
  },
  {
    id: "task-progress",
    type: "task",
    title: "System architecture draft started",
    description: "Student team started preparing modules, data model, and integration assumptions.",
    actor: "Student Team",
    timeLabel: "Today, 11:05",
    importance: "normal",
    metadata: "In progress",
  },
  {
    id: "supervisor-placeholder",
    type: "team",
    title: "Supervisor invite placeholder prepared",
    description: "Supervisor invite readiness panel was added, but no real invite has been sent yet.",
    actor: "Workspace Admin",
    timeLabel: "Today, 11:30",
    importance: "normal",
    metadata: "Placeholder",
  },
  {
    id: "team-placeholder",
    type: "team",
    title: "Team member invite placeholder prepared",
    description: "Team role options and invite readiness checks are available for planning before production invite writes.",
    actor: "Workspace Admin",
    timeLabel: "Today, 11:45",
    importance: "normal",
    metadata: "Placeholder",
  },
  {
    id: "risk-alerts-generated",
    type: "status",
    title: "Risk alerts generated",
    description: "Project risk alerts were generated from health score, blockers, review load, and low progress signals.",
    actor: "ResearchCollab System",
    timeLabel: "Today, 12:05",
    importance: "high",
    metadata: "Health/Risk",
  },
  {
    id: "funding-demo-label",
    type: "funding",
    title: "Funding area remains demo-safe",
    description: "Workspace funding section is labelled as demo-only and does not move real funds.",
    actor: "Compliance Guard",
    timeLabel: "Today, 12:15",
    importance: "high",
    metadata: "Demo-safe",
  },
];

export function getActivityTypeLabel(type: ProjectActivityType): string {
  switch (type) {
    case "created":
      return "Created";
    case "status":
      return "Status";
    case "milestone":
      return "Milestone";
    case "task":
      return "Task";
    case "review":
      return "Review";
    case "file":
      return "File";
    case "team":
      return "Team";
    case "funding":
      return "Funding";
    case "comment":
      return "Comment";
    default:
      return "Activity";
  }
}

export function getActivityImportanceClass(importance: ProjectActivityImportance): string {
  switch (importance) {
    case "high":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "normal":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getRecentHighImportanceActivities(activities: ProjectActivityItem[] = DEMO_PROJECT_ACTIVITY): ProjectActivityItem[] {
  return activities.filter((activity) => activity.importance === "high");
}
