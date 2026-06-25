export type SupervisorInviteStatus = "draft" | "ready" | "pending" | "accepted" | "declined";

export type SupervisorInviteRequirement = {
  id: string;
  label: string;
  description: string;
  complete: boolean;
};

export type SupervisorInvitePreview = {
  projectTitle: string;
  supervisorRole: string;
  suggestedMessage: string;
  requirements: SupervisorInviteRequirement[];
};

export const DEMO_SUPERVISOR_INVITE: SupervisorInvitePreview = {
  projectTitle: "AI-Based Attendance & Engagement System",
  supervisorRole: "Academic Supervisor / Reviewer",
  suggestedMessage:
    "You are invited to supervise this project workspace. The team needs guidance on scope, milestone reviews, evidence quality, and final report readiness.",
  requirements: [
    {
      id: "scope-ready",
      label: "Scope brief ready",
      description: "Problem statement, outcomes, and exclusions are documented before inviting a supervisor.",
      complete: true,
    },
    {
      id: "milestones-ready",
      label: "Milestone plan ready",
      description: "Project has review checkpoints so the supervisor knows when feedback is needed.",
      complete: true,
    },
    {
      id: "team-owner-set",
      label: "Team owner assigned",
      description: "At least one student/research team owner should be responsible for supervisor communication.",
      complete: false,
    },
    {
      id: "evidence-policy",
      label: "Evidence policy visible",
      description: "Supervisor should know which reports, datasets, screenshots, or demos count as evidence.",
      complete: false,
    },
  ],
};

export function getSupervisorInviteStatus(requirements: SupervisorInviteRequirement[]): SupervisorInviteStatus {
  const completed = requirements.filter((requirement) => requirement.complete).length;
  if (completed === requirements.length) return "ready";
  if (completed === 0) return "draft";
  return "draft";
}

export function getSupervisorInviteReadiness(requirements: SupervisorInviteRequirement[]): number {
  if (requirements.length === 0) return 0;
  const completed = requirements.filter((requirement) => requirement.complete).length;
  return Math.round((completed / requirements.length) * 100);
}

export function getSupervisorInviteStatusLabel(status: SupervisorInviteStatus): string {
  switch (status) {
    case "ready":
      return "Ready to Invite";
    case "pending":
      return "Invite Pending";
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    default:
      return "Draft";
  }
}

export function getSupervisorInviteStatusClass(status: SupervisorInviteStatus): string {
  switch (status) {
    case "ready":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "pending":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "accepted":
      return "bg-primary/10 text-primary border-primary/30";
    case "declined":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
