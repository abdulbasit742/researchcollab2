import { calculateProjectHealth } from "@/config/projectHealth";
import { DEMO_PROJECT_MILESTONES, type ProjectMilestone } from "@/config/projectMilestones";
import { DEMO_PROJECT_TASKS, type ProjectTask } from "@/config/projectTasks";
import { DEMO_PROJECT_WORKSPACE, type ProjectWorkspaceSummary } from "@/config/projectWorkspace";

export type ProjectRiskSeverity = "low" | "medium" | "high" | "critical";
export type ProjectRiskCategory = "schedule" | "quality" | "review" | "blocker" | "scope" | "funding";

export type ProjectRiskAlert = {
  id: string;
  title: string;
  description: string;
  severity: ProjectRiskSeverity;
  category: ProjectRiskCategory;
  signal: string;
  recommendedAction: string;
};

export function getRiskSeverityClass(severity: ProjectRiskSeverity): string {
  switch (severity) {
    case "critical":
      return "bg-red-600/10 text-red-700 border-red-600/30 dark:text-red-300";
    case "high":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  }
}

export function getRiskCategoryLabel(category: ProjectRiskCategory): string {
  switch (category) {
    case "schedule":
      return "Schedule";
    case "quality":
      return "Quality";
    case "review":
      return "Review";
    case "blocker":
      return "Blocker";
    case "scope":
      return "Scope";
    case "funding":
      return "Funding";
    default:
      return "Risk";
  }
}

export function generateProjectRiskAlerts(
  project: ProjectWorkspaceSummary = DEMO_PROJECT_WORKSPACE,
  milestones: ProjectMilestone[] = DEMO_PROJECT_MILESTONES,
  tasks: ProjectTask[] = DEMO_PROJECT_TASKS
): ProjectRiskAlert[] {
  const health = calculateProjectHealth(project, milestones, tasks);
  const alerts: ProjectRiskAlert[] = [];
  const blockedTasks = tasks.filter((task) => task.status === "blocked");
  const reviewTasks = tasks.filter((task) => task.status === "review");
  const plannedTasks = tasks.filter((task) => task.status === "todo");
  const lowProgressMilestones = milestones.filter((milestone) => milestone.progress < 25 && milestone.status !== "approved");

  if (health.score < 50) {
    alerts.push({
      id: "health-critical",
      title: "Project health is at risk",
      description: "Overall project health score is below the safe execution threshold.",
      severity: "critical",
      category: "quality",
      signal: `Health score: ${health.score}`,
      recommendedAction: "Pause new scope and resolve the highest-impact blockers first.",
    });
  } else if (health.score < 70) {
    alerts.push({
      id: "health-watch",
      title: "Project needs closer monitoring",
      description: "Project health is acceptable but needs attention before the next review checkpoint.",
      severity: "medium",
      category: "quality",
      signal: `Health score: ${health.score}`,
      recommendedAction: health.nextAction,
    });
  }

  if (blockedTasks.length > 0) {
    alerts.push({
      id: "blocked-tasks",
      title: "Blocked tasks detected",
      description: `${blockedTasks.length} task(s) are blocked and may delay final milestones.`,
      severity: blockedTasks.length > 1 ? "high" : "medium",
      category: "blocker",
      signal: blockedTasks.map((task) => task.title).join(", "),
      recommendedAction: "Review blocker notes and assign an owner for unblocking before the next sync.",
    });
  }

  if (reviewTasks.length > 1) {
    alerts.push({
      id: "review-bottleneck",
      title: "Review bottleneck forming",
      description: "Multiple tasks are waiting in review, which can slow team momentum.",
      severity: "medium",
      category: "review",
      signal: `${reviewTasks.length} review tasks pending`,
      recommendedAction: "Schedule reviewer feedback and clear review tasks before adding more work.",
    });
  }

  if (plannedTasks.length >= 3 && project.progress < 30) {
    alerts.push({
      id: "execution-start-delay",
      title: "Execution start may be delayed",
      description: "Several tasks are still in To Do while workspace progress remains low.",
      severity: "medium",
      category: "schedule",
      signal: `${plannedTasks.length} tasks not started, ${project.progress}% workspace progress`,
      recommendedAction: "Start the highest-priority planned task and confirm due-week ownership.",
    });
  }

  if (lowProgressMilestones.length >= 2) {
    alerts.push({
      id: "milestone-progress-risk",
      title: "Milestone progress is weak",
      description: "Multiple milestones have low progress and may need sequencing review.",
      severity: "medium",
      category: "schedule",
      signal: `${lowProgressMilestones.length} low-progress milestones`,
      recommendedAction: "Reconfirm milestone order and move one milestone to evidence-ready state.",
    });
  }

  if (project.riskLevel === "High") {
    alerts.push({
      id: "workspace-high-risk",
      title: "Workspace marked high risk",
      description: "The project has been labelled high risk at workspace level.",
      severity: "high",
      category: "scope",
      signal: "Workspace risk: High",
      recommendedAction: "Run a scope review and document risks before moving to execution.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "no-major-risk",
      title: "No major risk alerts",
      description: "Current workspace signals do not show major risk. Keep monitoring progress and reviews.",
      severity: "low",
      category: "quality",
      signal: `Health score: ${health.score}`,
      recommendedAction: "Maintain execution cadence and prepare the next checkpoint.",
    });
  }

  return alerts;
}
