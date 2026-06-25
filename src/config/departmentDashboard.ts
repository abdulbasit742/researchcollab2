export type DepartmentProjectHealth = "healthy" | "watch" | "at_risk" | "blocked";
export type DepartmentBatchStatus = "active" | "review" | "viva_ready" | "completed";
export type DepartmentComplianceStatus = "complete" | "needs_review" | "missing";
export type DepartmentLoadStatus = "balanced" | "heavy" | "overloaded";

export type DepartmentBatchMetric = {
  id: string;
  label: string;
  status: DepartmentBatchStatus;
  students: number;
  teams: number;
  projects: number;
  completion: number;
  note: string;
};

export type DepartmentSupervisorLoad = {
  id: string;
  name: string;
  status: DepartmentLoadStatus;
  assignedProjects: number;
  pendingReviews: number;
  blockedProjects: number;
  nextAction: string;
};

export type DepartmentProjectSignal = {
  id: string;
  title: string;
  owner: string;
  health: DepartmentProjectHealth;
  progress: number;
  riskReason: string;
  departmentAction: string;
};

export type DepartmentComplianceCheck = {
  id: string;
  label: string;
  status: DepartmentComplianceStatus;
  helper: string;
};

export type DepartmentDashboardSummary = {
  departmentName: string;
  coordinatorName: string;
  cycleLabel: string;
  safetyNote: string;
  batches: DepartmentBatchMetric[];
  supervisorLoads: DepartmentSupervisorLoad[];
  projectSignals: DepartmentProjectSignal[];
  complianceChecks: DepartmentComplianceCheck[];
};

export const DEMO_DEPARTMENT_DASHBOARD: DepartmentDashboardSummary = {
  departmentName: "Computer Science Department",
  coordinatorName: "Department Coordinator Preview",
  cycleLabel: "Current FYP department cycle",
  safetyNote:
    "Department Dashboard uses demo academic operations data only. Production department views should connect real student records, supervisor assignments, review timestamps, rubrics, privacy rules, and audit logs.",
  batches: [
    {
      id: "batch-cs-2026-a",
      label: "CS 2026-A",
      status: "active",
      students: 96,
      teams: 32,
      projects: 32,
      completion: 64,
      note: "Most teams are in prototype, budget, and evidence-building phases.",
    },
    {
      id: "batch-cs-2026-b",
      label: "CS 2026-B",
      status: "review",
      students: 84,
      teams: 28,
      projects: 28,
      completion: 52,
      note: "Review queue volume is increasing and supervisor load needs monitoring.",
    },
    {
      id: "batch-viva-ready",
      label: "Viva Ready Track",
      status: "viva_ready",
      students: 42,
      teams: 14,
      projects: 14,
      completion: 88,
      note: "Viva-ready teams need mock viva scheduling and final sign-off.",
    },
  ],
  supervisorLoads: [
    {
      id: "load-dr-supervisor-preview",
      name: "Dr. Supervisor Preview",
      status: "heavy",
      assignedProjects: 12,
      pendingReviews: 5,
      blockedProjects: 1,
      nextAction: "Rebalance urgent budget and prototype evidence reviews.",
    },
    {
      id: "load-dr-methods",
      name: "Dr. Methods Lead",
      status: "balanced",
      assignedProjects: 8,
      pendingReviews: 2,
      blockedProjects: 0,
      nextAction: "Continue literature and methodology reviews.",
    },
    {
      id: "load-dr-lab",
      name: "Dr. Lab Coordinator",
      status: "overloaded",
      assignedProjects: 16,
      pendingReviews: 7,
      blockedProjects: 3,
      nextAction: "Escalate equipment and validation-kit policy bottlenecks.",
    },
  ],
  projectSignals: [
    {
      id: "signal-smart-lab",
      title: "Smart Lab Assistant for FYP Teams",
      owner: "Student Research Team",
      health: "watch",
      progress: 68,
      riskReason: "Budget, prototype evidence, and funding labels are waiting for review.",
      departmentAction: "Ask supervisor to finalize budget and evidence comments.",
    },
    {
      id: "signal-validation-kit",
      title: "Prototype Validation Kit",
      owner: "Capstone Team Alpha",
      health: "blocked",
      progress: 39,
      riskReason: "Policy labels and equipment usage plan are incomplete.",
      departmentAction: "Escalate to department coordinator and lab policy reviewer.",
    },
    {
      id: "signal-viva-pack",
      title: "Viva Readiness Pack",
      owner: "Final Viva Group",
      health: "healthy",
      progress: 88,
      riskReason: "Ready for mock viva sign-off.",
      departmentAction: "Schedule mock viva and final review slot.",
    },
  ],
  complianceChecks: [
    { id: "check-supervisor-map", label: "Supervisor allocation map", status: "needs_review", helper: "Some supervisors have heavy or overloaded queues." },
    { id: "check-rubrics", label: "Review rubric coverage", status: "complete", helper: "Demo review queues include rubric checks." },
    { id: "check-privacy", label: "Student visibility and privacy rules", status: "missing", helper: "Production privacy controls are not connected yet." },
    { id: "check-viva-schedule", label: "Viva schedule readiness", status: "needs_review", helper: "Viva-ready teams need mock viva scheduling." },
  ],
};

export function getDepartmentBatchStatusLabel(status: DepartmentBatchStatus): string {
  if (status === "review") return "Review";
  if (status === "viva_ready") return "Viva Ready";
  if (status === "completed") return "Completed";
  return "Active";
}

export function getDepartmentBatchStatusClass(status: DepartmentBatchStatus): string {
  if (status === "completed") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "viva_ready") return "bg-primary/10 text-primary border-primary/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getDepartmentLoadStatusLabel(status: DepartmentLoadStatus): string {
  if (status === "heavy") return "Heavy";
  if (status === "overloaded") return "Overloaded";
  return "Balanced";
}

export function getDepartmentLoadStatusClass(status: DepartmentLoadStatus): string {
  if (status === "balanced") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "heavy") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getDepartmentProjectHealthLabel(health: DepartmentProjectHealth): string {
  if (health === "healthy") return "Healthy";
  if (health === "watch") return "Watch";
  if (health === "at_risk") return "At Risk";
  return "Blocked";
}

export function getDepartmentProjectHealthClass(health: DepartmentProjectHealth): string {
  if (health === "healthy") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (health === "watch") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (health === "at_risk") return "bg-orange-500/10 text-orange-600 border-orange-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getDepartmentComplianceStatusLabel(status: DepartmentComplianceStatus): string {
  if (status === "complete") return "Complete";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getDepartmentComplianceStatusClass(status: DepartmentComplianceStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getDepartmentDashboardCounts(summary: DepartmentDashboardSummary = DEMO_DEPARTMENT_DASHBOARD) {
  return {
    batches: summary.batches.length,
    students: summary.batches.reduce((total, batch) => total + batch.students, 0),
    teams: summary.batches.reduce((total, batch) => total + batch.teams, 0),
    projects: summary.batches.reduce((total, batch) => total + batch.projects, 0),
    pendingReviews: summary.supervisorLoads.reduce((total, load) => total + load.pendingReviews, 0),
    overloadedSupervisors: summary.supervisorLoads.filter((load) => load.status === "overloaded").length,
    blockedProjects: summary.projectSignals.filter((project) => project.health === "blocked").length,
    missingCompliance: summary.complianceChecks.filter((check) => check.status === "missing").length,
    averageCompletion: Math.round(
      summary.batches.reduce((total, batch) => total + batch.completion, 0) / summary.batches.length,
    ),
  };
}
