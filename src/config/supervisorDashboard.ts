export type SupervisorProjectStatus = "on_track" | "review_needed" | "blocked" | "defense_ready";
export type SupervisorReviewStatus = "pending" | "in_review" | "approved" | "changes_requested";
export type SupervisorPriority = "low" | "medium" | "high";
export type SupervisorActionStatus = "complete" | "pending" | "needs_review" | "blocked";

export type SupervisorAssignedProject = {
  id: string;
  title: string;
  studentTeam: string;
  department: string;
  status: SupervisorProjectStatus;
  priority: SupervisorPriority;
  progress: number;
  riskLabel: string;
  nextReviewLabel: string;
  summary: string;
};

export type SupervisorReviewQueueItem = {
  id: string;
  projectTitle: string;
  sectionTitle: string;
  status: SupervisorReviewStatus;
  priority: SupervisorPriority;
  submittedBy: string;
  dueLabel: string;
  note: string;
};

export type SupervisorActionItem = {
  id: string;
  label: string;
  status: SupervisorActionStatus;
  helper: string;
};

export type SupervisorDashboardSummary = {
  supervisorName: string;
  department: string;
  cycleLabel: string;
  safetyNote: string;
  assignedProjects: SupervisorAssignedProject[];
  reviewQueue: SupervisorReviewQueueItem[];
  actionItems: SupervisorActionItem[];
};

export const DEMO_SUPERVISOR_DASHBOARD: SupervisorDashboardSummary = {
  supervisorName: "Dr. Supervisor Preview",
  department: "Computer Science Department",
  cycleLabel: "Current FYP supervision cycle",
  safetyNote:
    "Supervisor Dashboard uses demo academic-review data only. Production supervision should connect real project records, student permissions, timestamps, comments, approvals, rubrics, and audit history.",
  assignedProjects: [
    {
      id: "project-smart-lab-assistant",
      title: "Smart Lab Assistant for FYP Teams",
      studentTeam: "Student Research Team",
      department: "Computer Science",
      status: "review_needed",
      priority: "high",
      progress: 68,
      riskLabel: "Medium risk",
      nextReviewLabel: "Budget and prototype evidence review",
      summary: "Prototype plan, budget, funding tools, and evidence workflow are ready for supervisor review.",
    },
    {
      id: "project-ai-literature-helper",
      title: "AI Literature Helper for Student Researchers",
      studentTeam: "Academic Methods Lab",
      department: "Computer Science",
      status: "on_track",
      priority: "medium",
      progress: 54,
      riskLabel: "Low risk",
      nextReviewLabel: "Literature matrix and ethics note",
      summary: "Research scope is progressing, but budget clarity and usage accountability need more detail.",
    },
    {
      id: "project-validation-kit",
      title: "Prototype Validation Kit",
      studentTeam: "Capstone Team Alpha",
      department: "Engineering Lab",
      status: "blocked",
      priority: "high",
      progress: 39,
      riskLabel: "High risk",
      nextReviewLabel: "Policy labels and equipment usage plan",
      summary: "Equipment funding and supervisor verification exist, but policy labels and validation evidence are incomplete.",
    },
    {
      id: "project-defense-pack",
      title: "Defense Readiness Pack",
      studentTeam: "Final Defense Group",
      department: "Computer Science",
      status: "defense_ready",
      priority: "low",
      progress: 88,
      riskLabel: "Low risk",
      nextReviewLabel: "Mock viva sign-off",
      summary: "Final report sections, viva practice notes, and defense package are almost ready for approval.",
    },
  ],
  reviewQueue: [
    {
      id: "review-budget-plan",
      projectTitle: "Smart Lab Assistant for FYP Teams",
      sectionTitle: "Budget Planner Placeholder",
      status: "pending",
      priority: "high",
      submittedBy: "Student Research Team",
      dueLabel: "Today",
      note: "Review requested amount, approved amount, variance, and funding source labels before sponsor proposal is sent.",
    },
    {
      id: "review-prototype-evidence",
      projectTitle: "Smart Lab Assistant for FYP Teams",
      sectionTitle: "Prototype Evidence",
      status: "in_review",
      priority: "high",
      submittedBy: "Student Research Team",
      dueLabel: "This week",
      note: "Component list is attached, screenshots need confirmation, and initial test log is missing.",
    },
    {
      id: "review-literature-matrix",
      projectTitle: "AI Literature Helper for Student Researchers",
      sectionTitle: "Literature Review Matrix",
      status: "changes_requested",
      priority: "medium",
      submittedBy: "Academic Methods Lab",
      dueLabel: "3 days",
      note: "Matrix needs stronger comparison columns and clearer research gap notes.",
    },
    {
      id: "review-defense-pack",
      projectTitle: "Defense Readiness Pack",
      sectionTitle: "Viva Prep Pack",
      status: "approved",
      priority: "low",
      submittedBy: "Final Defense Group",
      dueLabel: "Done",
      note: "Viva preparation notes are approved for mock defense practice.",
    },
  ],
  actionItems: [
    { id: "action-comment", label: "Comment on pending reviews", status: "pending", helper: "Budget and prototype evidence still need supervisor comments." },
    { id: "action-approve", label: "Approve defense-ready project", status: "needs_review", helper: "Mock viva sign-off should be checked before final approval." },
    { id: "action-policy", label: "Escalate blocked policy labels", status: "blocked", helper: "Prototype Validation Kit needs admin policy review." },
    { id: "action-schedule", label: "Schedule review sessions", status: "complete", helper: "Current review slots are drafted in the supervision cycle." },
  ],
};

export function getSupervisorProjectStatusLabel(status: SupervisorProjectStatus): string {
  if (status === "on_track") return "On Track";
  if (status === "review_needed") return "Review Needed";
  if (status === "defense_ready") return "Defense Ready";
  return "Blocked";
}

export function getSupervisorProjectStatusClass(status: SupervisorProjectStatus): string {
  if (status === "on_track" || status === "defense_ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review_needed") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getSupervisorReviewStatusLabel(status: SupervisorReviewStatus): string {
  if (status === "in_review") return "In Review";
  if (status === "approved") return "Approved";
  if (status === "changes_requested") return "Changes Requested";
  return "Pending";
}

export function getSupervisorReviewStatusClass(status: SupervisorReviewStatus): string {
  if (status === "approved") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "in_review") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  if (status === "changes_requested") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-amber-500/10 text-amber-600 border-amber-500/30";
}

export function getSupervisorPriorityClass(priority: SupervisorPriority): string {
  if (priority === "high") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (priority === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
}

export function getSupervisorActionStatusLabel(status: SupervisorActionStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  if (status === "blocked") return "Blocked";
  return "Pending";
}

export function getSupervisorActionStatusClass(status: SupervisorActionStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getSupervisorDashboardCounts(summary: SupervisorDashboardSummary = DEMO_SUPERVISOR_DASHBOARD) {
  return {
    projects: summary.assignedProjects.length,
    needsReview: summary.assignedProjects.filter((project) => project.status === "review_needed").length,
    blockedProjects: summary.assignedProjects.filter((project) => project.status === "blocked").length,
    pendingReviews: summary.reviewQueue.filter((review) => review.status === "pending" || review.status === "in_review").length,
    approvedReviews: summary.reviewQueue.filter((review) => review.status === "approved").length,
    highPriority: [...summary.assignedProjects, ...summary.reviewQueue].filter((item) => item.priority === "high").length,
  };
}
