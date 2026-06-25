export type SupervisorCommentStatus = "open" | "resolved" | "needs_revision" | "blocked";
export type SupervisorCommentPriority = "low" | "medium" | "high";
export type SupervisorCommentArea = "final_report" | "proposal" | "methodology";

export type SupervisorSectionComment = {
  id: string;
  area: SupervisorCommentArea;
  areaLabel: string;
  sectionTitle: string;
  supervisorName: string;
  comment: string;
  priority: SupervisorCommentPriority;
  status: SupervisorCommentStatus;
  createdLabel: string;
  requiredAction: string;
};

export const SUPERVISOR_SECTION_COMMENTS: SupervisorSectionComment[] = [
  {
    id: "comment-introduction-scope",
    area: "final_report",
    areaLabel: "Final Report",
    sectionTitle: "Introduction",
    supervisorName: "Supervisor Reviewer",
    comment: "Problem statement is clear, but objectives should be mapped more directly to final deliverables.",
    priority: "high",
    status: "needs_revision",
    createdLabel: "Today, 10:30",
    requiredAction: "Add an objective-to-deliverable mapping before marking the section complete.",
  },
  {
    id: "comment-lit-review-gap",
    area: "final_report",
    areaLabel: "Final Report",
    sectionTitle: "Literature Review / Existing Systems",
    supervisorName: "Supervisor Reviewer",
    comment: "The reviewed systems need a stronger comparison table and a clearer gap statement.",
    priority: "medium",
    status: "open",
    createdLabel: "Today, 11:00",
    requiredAction: "Add comparison criteria and connect each source to the final project gap.",
  },
  {
    id: "comment-proposal-ethics",
    area: "proposal",
    areaLabel: "Proposal",
    sectionTitle: "Ethics, Data & Risk Plan",
    supervisorName: "Ethics Reviewer",
    comment: "Ethics section is still missing. Add consent, privacy, and data retention notes before review.",
    priority: "high",
    status: "blocked",
    createdLabel: "Today, 11:40",
    requiredAction: "Draft ethics/data-risk section and attach privacy safeguards.",
  },
  {
    id: "comment-method-validation",
    area: "methodology",
    areaLabel: "Methodology",
    sectionTitle: "Testing, Validation & Evaluation",
    supervisorName: "Technical Supervisor",
    comment: "Validation plan should include test cases, expected results, and acceptance criteria.",
    priority: "high",
    status: "needs_revision",
    createdLabel: "Today, 12:10",
    requiredAction: "Prepare validation table and link tests to objectives.",
  },
  {
    id: "comment-tools-setup",
    area: "methodology",
    areaLabel: "Methodology",
    sectionTitle: "Tools, Technology & Setup",
    supervisorName: "Technical Supervisor",
    comment: "Tool choices are acceptable. Keep setup notes updated for reproducibility.",
    priority: "low",
    status: "resolved",
    createdLabel: "Today, 12:30",
    requiredAction: "No urgent action. Keep version notes synced with final report.",
  },
];

export function getSupervisorCommentStatusLabel(status: SupervisorCommentStatus): string {
  switch (status) {
    case "resolved":
      return "Resolved";
    case "needs_revision":
      return "Needs Revision";
    case "blocked":
      return "Blocked";
    default:
      return "Open";
  }
}

export function getSupervisorCommentStatusClass(status: SupervisorCommentStatus): string {
  switch (status) {
    case "resolved":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "needs_revision":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "blocked":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  }
}

export function getSupervisorCommentPriorityClass(priority: SupervisorCommentPriority): string {
  switch (priority) {
    case "high":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getOpenSupervisorCommentCount(comments: SupervisorSectionComment[] = SUPERVISOR_SECTION_COMMENTS): number {
  return comments.filter((comment) => comment.status !== "resolved").length;
}

export function getHighPrioritySupervisorCommentCount(comments: SupervisorSectionComment[] = SUPERVISOR_SECTION_COMMENTS): number {
  return comments.filter((comment) => comment.priority === "high" && comment.status !== "resolved").length;
}
