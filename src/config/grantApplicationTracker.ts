export type GrantApplicationStatus = "saved" | "drafting" | "review" | "ready" | "submitted" | "blocked";
export type GrantApplicationStageStatus = "complete" | "in_progress" | "missing" | "locked";
export type GrantApplicationPriority = "low" | "medium" | "high";

export type GrantApplicationStage = {
  id: string;
  title: string;
  status: GrantApplicationStageStatus;
  owner: string;
  dueLabel: string;
  description: string;
};

export type GrantApplicationRequirement = {
  id: string;
  label: string;
  status: GrantApplicationStageStatus;
  helper: string;
};

export type GrantApplication = {
  id: string;
  grantTitle: string;
  provider: string;
  status: GrantApplicationStatus;
  priority: GrantApplicationPriority;
  amountLabel: string;
  deadlineLabel: string;
  readiness: number;
  reviewerNote: string;
  nextAction: string;
  stages: GrantApplicationStage[];
  requirements: GrantApplicationRequirement[];
};

export type GrantApplicationTrackerSummary = {
  projectTitle: string;
  owner: string;
  cycleLabel: string;
  safetyNote: string;
  applications: GrantApplication[];
};

export const DEMO_GRANT_APPLICATION_TRACKER: GrantApplicationTrackerSummary = {
  projectTitle: "Smart Lab Assistant for FYP Teams",
  owner: "Student Research Team",
  cycleLabel: "Current demo grant cycle",
  safetyNote:
    "Grant Application Tracker uses demo application data only. Production submission should verify official portals, deadlines, required documents, signatures, eligibility, and confirmation receipts.",
  applications: [
    {
      id: "application-university-innovation-mini",
      grantTitle: "University Innovation Mini Grant",
      provider: "University Research Office",
      status: "review",
      priority: "high",
      amountLabel: "PKR 100,000 demo",
      deadlineLabel: "21 days left",
      readiness: 78,
      reviewerNote: "Strong fit. Budget breakdown and risk/accountability note need final review before submission.",
      nextAction: "Supervisor should approve budget and risk section before application package is marked ready.",
      stages: [
        {
          id: "stage-save",
          title: "Grant Saved",
          status: "complete",
          owner: "Student Research Team",
          dueLabel: "Done",
          description: "Grant was saved from Grant Finder as a strong-fit opportunity.",
        },
        {
          id: "stage-documents",
          title: "Document Package",
          status: "in_progress",
          owner: "Project owner",
          dueLabel: "This week",
          description: "Proposal summary, supervisor note, budget table, and impact plan are being prepared.",
        },
        {
          id: "stage-review",
          title: "Supervisor Review",
          status: "in_progress",
          owner: "Supervisor",
          dueLabel: "Before submission",
          description: "Supervisor checks academic scope, budget accuracy, and project feasibility.",
        },
        {
          id: "stage-submit",
          title: "Submit Application",
          status: "locked",
          owner: "Admin / owner",
          dueLabel: "Locked",
          description: "Submission is locked until official portal integration and confirmation receipt tracking exist.",
        },
      ],
      requirements: [
        { id: "req-proposal", label: "Project proposal", status: "complete", helper: "Proposal summary is available from campaign builder." },
        { id: "req-budget", label: "Budget breakdown", status: "in_progress", helper: "Budget is present but needs final approval." },
        { id: "req-supervisor", label: "Supervisor endorsement", status: "complete", helper: "Supervisor note exists." },
        { id: "req-risk", label: "Risk and accountability note", status: "missing", helper: "Risk section is still missing." },
      ],
    },
    {
      id: "application-industry-equipment-support",
      grantTitle: "Industry Lab Equipment Support",
      provider: "Technology Partner Network",
      status: "drafting",
      priority: "medium",
      amountLabel: "PKR 250,000 demo",
      deadlineLabel: "7 days left",
      readiness: 54,
      reviewerNote: "Potentially useful, but industry relevance letter and production ledger setup are missing.",
      nextAction: "Team should request an industry relevance letter before spending time on final application.",
      stages: [
        {
          id: "stage-save",
          title: "Grant Saved",
          status: "complete",
          owner: "Student Research Team",
          dueLabel: "Done",
          description: "Grant saved as medium-fit equipment support opportunity.",
        },
        {
          id: "stage-letter",
          title: "Partner Letter",
          status: "missing",
          owner: "Industry contact",
          dueLabel: "Urgent",
          description: "Partner relevance letter is required before the application can move to review.",
        },
        {
          id: "stage-budget",
          title: "Equipment Budget",
          status: "in_progress",
          owner: "Project owner",
          dueLabel: "3 days",
          description: "Equipment cost list and usage accountability plan are being drafted.",
        },
        {
          id: "stage-submit",
          title: "Submit Application",
          status: "locked",
          owner: "Admin / owner",
          dueLabel: "Locked",
          description: "Application submission remains locked until requirements are complete.",
        },
      ],
      requirements: [
        { id: "req-letter", label: "Industry relevance letter", status: "missing", helper: "No partner letter is attached." },
        { id: "req-impact", label: "Impact update plan", status: "complete", helper: "Impact updates module can support this." },
        { id: "req-ledger", label: "Funding ledger", status: "in_progress", helper: "Demo ledger exists but production ledger is not connected." },
        { id: "req-equipment", label: "Equipment list", status: "in_progress", helper: "Draft component list exists." },
      ],
    },
    {
      id: "application-open-science-seed",
      grantTitle: "Open Science Student Seed Fund",
      provider: "International Research Commons",
      status: "blocked",
      priority: "low",
      amountLabel: "USD 1,000 demo",
      deadlineLabel: "35 days left",
      readiness: 38,
      reviewerNote: "Low fit until open license, data-sharing policy, and privacy review are complete.",
      nextAction: "Do not submit until project team decides what can be shared publicly.",
      stages: [
        {
          id: "stage-save",
          title: "Grant Saved",
          status: "complete",
          owner: "Student Research Team",
          dueLabel: "Done",
          description: "Grant saved for future open documentation consideration.",
        },
        {
          id: "stage-license",
          title: "Open License Decision",
          status: "missing",
          owner: "Project owner",
          dueLabel: "Before drafting",
          description: "Team must decide if public templates or datasets can be shared.",
        },
        {
          id: "stage-privacy",
          title: "Privacy Review",
          status: "missing",
          owner: "Admin / supervisor",
          dueLabel: "Before submission",
          description: "Evidence files need privacy screening before public sharing.",
        },
        {
          id: "stage-submit",
          title: "Submit Application",
          status: "locked",
          owner: "Admin / owner",
          dueLabel: "Locked",
          description: "Submission locked because eligibility and public sharing decisions are incomplete.",
        },
      ],
      requirements: [
        { id: "req-license", label: "Open license plan", status: "missing", helper: "No license plan exists." },
        { id: "req-dataset", label: "Shareable dataset", status: "missing", helper: "Dataset is not privacy reviewed." },
        { id: "req-public-report", label: "Public report", status: "in_progress", helper: "Report builder can support a public summary." },
        { id: "req-supervisor", label: "Supervisor approval", status: "missing", helper: "Supervisor has not approved public sharing." },
      ],
    },
  ],
};

export function getGrantApplicationStatusLabel(status: GrantApplicationStatus): string {
  if (status === "drafting") return "Drafting";
  if (status === "review") return "In Review";
  if (status === "ready") return "Ready";
  if (status === "submitted") return "Submitted";
  if (status === "blocked") return "Blocked";
  return "Saved";
}

export function getGrantApplicationStatusClass(status: GrantApplicationStatus): string {
  if (status === "submitted" || status === "ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "drafting" || status === "saved") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getGrantApplicationStageStatusLabel(status: GrantApplicationStageStatus): string {
  if (status === "complete") return "Complete";
  if (status === "in_progress") return "In Progress";
  if (status === "locked") return "Locked";
  return "Missing";
}

export function getGrantApplicationStageStatusClass(status: GrantApplicationStageStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "in_progress") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "locked") return "bg-muted text-muted-foreground border-border";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getGrantApplicationPriorityClass(priority: GrantApplicationPriority): string {
  if (priority === "high") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (priority === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
}

export function getGrantApplicationTrackerCounts(summary: GrantApplicationTrackerSummary = DEMO_GRANT_APPLICATION_TRACKER) {
  return {
    applications: summary.applications.length,
    inReview: summary.applications.filter((application) => application.status === "review").length,
    blocked: summary.applications.filter((application) => application.status === "blocked").length,
    lockedStages: summary.applications.flatMap((application) => application.stages).filter((stage) => stage.status === "locked").length,
    missingRequirements: summary.applications
      .flatMap((application) => application.requirements)
      .filter((requirement) => requirement.status === "missing").length,
    averageReadiness: Math.round(
      summary.applications.reduce((total, application) => total + application.readiness, 0) / summary.applications.length,
    ),
  };
}
