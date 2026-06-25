export type TeamInviteRole = "student_member" | "researcher" | "developer" | "designer" | "data_analyst" | "reviewer";
export type TeamInviteStatus = "draft" | "ready" | "pending" | "accepted" | "declined";

export type TeamInviteRoleOption = {
  value: TeamInviteRole;
  label: string;
  description: string;
  suggestedResponsibilities: string[];
};

export type TeamInviteRequirement = {
  id: string;
  label: string;
  description: string;
  complete: boolean;
};

export const TEAM_INVITE_ROLE_OPTIONS: TeamInviteRoleOption[] = [
  {
    value: "student_member",
    label: "Student Member",
    description: "Student contributor for FYP/research execution, reporting, and evidence collection.",
    suggestedResponsibilities: ["Attend weekly sync", "Complete assigned tasks", "Upload milestone evidence"],
  },
  {
    value: "researcher",
    label: "Researcher",
    description: "Research contributor for methodology, literature review, experiments, and manuscript readiness.",
    suggestedResponsibilities: ["Validate methodology", "Maintain literature matrix", "Prepare research outputs"],
  },
  {
    value: "developer",
    label: "Developer",
    description: "Technical builder for prototype, integrations, testing, and deployment-ready handover.",
    suggestedResponsibilities: ["Build core modules", "Document setup", "Fix technical blockers"],
  },
  {
    value: "designer",
    label: "Designer",
    description: "UX/UI contributor for user flows, wireframes, presentation visuals, and demo polish.",
    suggestedResponsibilities: ["Prepare wireframes", "Improve usability", "Polish final demo"],
  },
  {
    value: "data_analyst",
    label: "Data Analyst",
    description: "Data contributor for dataset cleaning, analysis, charts, and evidence reports.",
    suggestedResponsibilities: ["Clean dataset", "Run analysis", "Prepare result visuals"],
  },
  {
    value: "reviewer",
    label: "Reviewer",
    description: "Non-supervisor reviewer for quality checks, feedback, and readiness review.",
    suggestedResponsibilities: ["Review milestone evidence", "Flag risks", "Suggest improvements"],
  },
];

export const DEMO_TEAM_INVITE_REQUIREMENTS: TeamInviteRequirement[] = [
  {
    id: "role-defined",
    label: "Role is defined",
    description: "Invite should include the exact role and expected responsibilities.",
    complete: true,
  },
  {
    id: "milestone-link",
    label: "Milestone link is clear",
    description: "Invited member should know which milestone or workstream they will support.",
    complete: true,
  },
  {
    id: "permissions-reviewed",
    label: "Permissions reviewed",
    description: "Workspace permissions should be reviewed before adding real project members.",
    complete: false,
  },
  {
    id: "notification-log",
    label: "Notification log ready",
    description: "Real invites should be recorded for audit, acceptance, and resend tracking.",
    complete: false,
  },
];

export function getTeamInviteReadiness(requirements: TeamInviteRequirement[] = DEMO_TEAM_INVITE_REQUIREMENTS): number {
  if (requirements.length === 0) return 0;
  const complete = requirements.filter((requirement) => requirement.complete).length;
  return Math.round((complete / requirements.length) * 100);
}

export function getTeamInviteStatus(requirements: TeamInviteRequirement[] = DEMO_TEAM_INVITE_REQUIREMENTS): TeamInviteStatus {
  return getTeamInviteReadiness(requirements) === 100 ? "ready" : "draft";
}

export function getTeamInviteStatusLabel(status: TeamInviteStatus): string {
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

export function getTeamInviteStatusClass(status: TeamInviteStatus): string {
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
