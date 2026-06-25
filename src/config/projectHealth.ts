import { DEMO_PROJECT_MILESTONES, getMilestoneCompletionScore, type ProjectMilestone } from "@/config/projectMilestones";
import { DEMO_PROJECT_TASKS, getTaskCompletionScore, type ProjectTask } from "@/config/projectTasks";
import type { ProjectWorkspaceSummary } from "@/config/projectWorkspace";

export type ProjectHealthGrade = "Excellent" | "Healthy" | "Watch" | "At Risk";

export type ProjectHealthSignal = {
  id: string;
  label: string;
  score: number;
  weight: number;
  status: "good" | "watch" | "risk";
  evidence: string;
};

export type ProjectHealthResult = {
  score: number;
  grade: ProjectHealthGrade;
  summary: string;
  signals: ProjectHealthSignal[];
  blockers: number;
  nextAction: string;
};

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export function getProjectHealthGrade(score: number): ProjectHealthGrade {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Healthy";
  if (score >= 50) return "Watch";
  return "At Risk";
}

export function getProjectHealthClass(grade: ProjectHealthGrade): string {
  switch (grade) {
    case "Excellent":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "Healthy":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "Watch":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-red-500/10 text-red-600 border-red-500/30";
  }
}

export function calculateProjectHealth(
  project: ProjectWorkspaceSummary,
  milestones: ProjectMilestone[] = DEMO_PROJECT_MILESTONES,
  tasks: ProjectTask[] = DEMO_PROJECT_TASKS
): ProjectHealthResult {
  const milestoneScore = getMilestoneCompletionScore(milestones);
  const taskScore = getTaskCompletionScore(tasks);
  const blockedMilestones = milestones.filter((milestone) => milestone.status === "blocked").length;
  const blockedTasks = tasks.filter((task) => task.status === "blocked").length;
  const reviewTasks = tasks.filter((task) => task.status === "review").length;
  const riskPenalty = project.riskLevel === "High" ? 35 : project.riskLevel === "Medium" ? 18 : 5;
  const blockerPenalty = blockedMilestones * 15 + blockedTasks * 10;
  const reviewScore = clampScore(100 - reviewTasks * 8);
  const riskScore = clampScore(100 - riskPenalty - blockerPenalty);

  const signals: ProjectHealthSignal[] = [
    {
      id: "milestone-progress",
      label: "Milestone progress",
      score: milestoneScore,
      weight: 0.35,
      status: milestoneScore >= 70 ? "good" : milestoneScore >= 40 ? "watch" : "risk",
      evidence: `${milestoneScore}% average milestone completion`,
    },
    {
      id: "task-completion",
      label: "Task completion",
      score: taskScore,
      weight: 0.3,
      status: taskScore >= 70 ? "good" : taskScore >= 35 ? "watch" : "risk",
      evidence: `${taskScore}% tasks marked done`,
    },
    {
      id: "review-load",
      label: "Review load",
      score: reviewScore,
      weight: 0.15,
      status: reviewTasks === 0 ? "good" : reviewTasks <= 2 ? "watch" : "risk",
      evidence: `${reviewTasks} tasks waiting for review`,
    },
    {
      id: "risk-blockers",
      label: "Risk and blockers",
      score: riskScore,
      weight: 0.2,
      status: blockedMilestones + blockedTasks === 0 && project.riskLevel === "Low" ? "good" : riskScore >= 55 ? "watch" : "risk",
      evidence: `${project.riskLevel} risk, ${blockedMilestones + blockedTasks} blockers`,
    },
  ];

  const weightedScore = signals.reduce((total, signal) => total + signal.score * signal.weight, 0);
  const score = clampScore(weightedScore);
  const grade = getProjectHealthGrade(score);
  const blockers = blockedMilestones + blockedTasks;

  return {
    score,
    grade,
    blockers,
    signals,
    summary:
      grade === "Excellent"
        ? "Project is moving strongly with low execution risk."
        : grade === "Healthy"
        ? "Project is progressing well with manageable review needs."
        : grade === "Watch"
        ? "Project needs closer monitoring before the next checkpoint."
        : "Project needs intervention before milestone confidence drops further.",
    nextAction:
      blockers > 0
        ? "Resolve blockers before adding new scope."
        : reviewTasks > 0
        ? "Clear pending review tasks to improve momentum."
        : milestoneScore < 60
        ? "Move the next milestone toward evidence submission."
        : "Maintain cadence and prepare next review checkpoint.",
  };
}
