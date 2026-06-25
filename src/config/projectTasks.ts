export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

export type ProjectTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  milestoneId: string;
  milestoneLabel: string;
  dueLabel: string;
  tags: string[];
  blocker?: string;
};

export const DEMO_PROJECT_TASKS: ProjectTask[] = [
  {
    id: "task-scope-brief",
    title: "Finalize problem scope brief",
    description: "Convert the project idea into a clear scope, user problem, measurable outcomes, and exclusions.",
    status: "done",
    priority: "high",
    assignee: "Project Owner",
    milestoneId: "scope-freeze",
    milestoneLabel: "Discovery & Scope Freeze",
    dueLabel: "Week 1",
    tags: ["scope", "planning"],
  },
  {
    id: "task-stakeholder-notes",
    title: "Collect stakeholder notes",
    description: "Summarize sponsor, supervisor, and student expectations before execution starts.",
    status: "done",
    priority: "medium",
    assignee: "Supervisor",
    milestoneId: "scope-freeze",
    milestoneLabel: "Discovery & Scope Freeze",
    dueLabel: "Week 1",
    tags: ["review", "stakeholders"],
  },
  {
    id: "task-architecture-draft",
    title: "Draft system architecture",
    description: "Prepare technical architecture, modules, data model, and integration assumptions for the prototype.",
    status: "in_progress",
    priority: "high",
    assignee: "Student Team",
    milestoneId: "prototype-plan",
    milestoneLabel: "Prototype / Research Plan Approval",
    dueLabel: "Week 2",
    tags: ["architecture", "technical"],
  },
  {
    id: "task-methodology-review",
    title: "Review methodology plan",
    description: "Validate the research/build method, evidence plan, risks, and acceptance criteria with reviewer input.",
    status: "review",
    priority: "high",
    assignee: "Reviewer",
    milestoneId: "prototype-plan",
    milestoneLabel: "Prototype / Research Plan Approval",
    dueLabel: "Week 3",
    tags: ["methodology", "review"],
  },
  {
    id: "task-demo-dataset",
    title: "Prepare demo dataset and test cases",
    description: "Create sample records, test flows, and validation cases needed for prototype demonstration.",
    status: "todo",
    priority: "medium",
    assignee: "Execution Team",
    milestoneId: "execution-build",
    milestoneLabel: "Execution Build / Research Work",
    dueLabel: "Week 5",
    tags: ["testing", "dataset"],
  },
  {
    id: "task-build-core-flow",
    title: "Build core workflow prototype",
    description: "Implement the minimum working project flow and connect it to demo-ready evidence screens.",
    status: "todo",
    priority: "high",
    assignee: "Execution Team",
    milestoneId: "execution-build",
    milestoneLabel: "Execution Build / Research Work",
    dueLabel: "Week 7",
    tags: ["prototype", "build"],
  },
  {
    id: "task-final-report-outline",
    title: "Prepare final report outline",
    description: "Create sections for abstract, problem statement, methodology, results, limitations, and future work.",
    status: "todo",
    priority: "medium",
    assignee: "Student Team",
    milestoneId: "final-handover",
    milestoneLabel: "Final Demo, Report & Handover",
    dueLabel: "Week 10",
    tags: ["report", "documentation"],
  },
  {
    id: "task-supervisor-approval",
    title: "Supervisor final approval checklist",
    description: "Confirm final demo, report, presentation, and handover package are complete.",
    status: "blocked",
    priority: "medium",
    assignee: "Supervisor",
    milestoneId: "final-handover",
    milestoneLabel: "Final Demo, Report & Handover",
    dueLabel: "Week 12",
    tags: ["approval", "handover"],
    blocker: "Waiting for final evidence uploads and demo build completion.",
  },
];

export const TASK_STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "review", "blocked", "done"];

export function getTaskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "todo":
      return "To Do";
    case "in_progress":
      return "In Progress";
    case "review":
      return "Review";
    case "done":
      return "Done";
    case "blocked":
      return "Blocked";
    default:
      return "To Do";
  }
}

export function getTaskStatusClass(status: TaskStatus): string {
  switch (status) {
    case "done":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "in_progress":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "review":
      return "bg-primary/10 text-primary border-primary/30";
    case "blocked":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getTaskPriorityClass(priority: TaskPriority): string {
  switch (priority) {
    case "high":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getTaskCompletionScore(tasks: ProjectTask[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((task) => task.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}

export function groupTasksByStatus(tasks: ProjectTask[]): Record<TaskStatus, ProjectTask[]> {
  return TASK_STATUS_ORDER.reduce((groups, status) => {
    groups[status] = tasks.filter((task) => task.status === status);
    return groups;
  }, {} as Record<TaskStatus, ProjectTask[]>);
}
