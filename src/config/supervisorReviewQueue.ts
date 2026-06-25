export type SupervisorQueueStatus = "pending" | "in_review" | "changes_requested" | "approved" | "blocked";
export type SupervisorQueuePriority = "low" | "medium" | "high" | "urgent";
export type SupervisorRubricStatus = "passed" | "needs_review" | "missing";
export type SupervisorFeedbackTone = "suggestion" | "required" | "praise" | "risk";

export type SupervisorRubricCheck = {
  id: string;
  label: string;
  status: SupervisorRubricStatus;
  helper: string;
};

export type SupervisorFeedbackNote = {
  id: string;
  tone: SupervisorFeedbackTone;
  author: string;
  note: string;
};

export type SupervisorReviewSubmission = {
  id: string;
  projectTitle: string;
  sectionTitle: string;
  submittedBy: string;
  status: SupervisorQueueStatus;
  priority: SupervisorQueuePriority;
  dueLabel: string;
  submittedLabel: string;
  readiness: number;
  summary: string;
  nextAction: string;
  rubric: SupervisorRubricCheck[];
  feedback: SupervisorFeedbackNote[];
};

export type SupervisorReviewQueueSummary = {
  supervisorName: string;
  department: string;
  queueLabel: string;
  safetyNote: string;
  submissions: SupervisorReviewSubmission[];
};

export const DEMO_SUPERVISOR_REVIEW_QUEUE: SupervisorReviewQueueSummary = {
  supervisorName: "Dr. Supervisor Preview",
  department: "Computer Science Department",
  queueLabel: "Current academic review queue",
  safetyNote:
    "Supervisor Review Queue uses demo review data only. Production review actions should store real comments, timestamps, student visibility rules, rubric scores, approvals, and audit history.",
  submissions: [
    {
      id: "submission-budget-plan",
      projectTitle: "Smart Lab Assistant for FYP Teams",
      sectionTitle: "Budget Planner Placeholder",
      submittedBy: "Student Research Team",
      status: "pending",
      priority: "urgent",
      dueLabel: "Today",
      submittedLabel: "Submitted 2 hours ago",
      readiness: 72,
      summary: "Budget planner needs supervisor review before sponsor proposal can move from review to ready state.",
      nextAction: "Check budget variance, source labels, contingency justification, and missing approval rules.",
      rubric: [
        { id: "rubric-budget", label: "Budget line clarity", status: "needs_review", helper: "Most lines are clear, but contingency is blocked." },
        { id: "rubric-evidence", label: "Evidence support", status: "needs_review", helper: "Some evidence is attached; invoices and test log are missing." },
        { id: "rubric-policy", label: "Policy-safe wording", status: "missing", helper: "Approval rules and production payment boundaries need text." },
      ],
      feedback: [
        { id: "feedback-variance", tone: "required", author: "Supervisor", note: "Explain why the contingency buffer is needed before approval." },
        { id: "feedback-hardware", tone: "praise", author: "Supervisor", note: "Hardware kit line is well supported by component evidence." },
      ],
    },
    {
      id: "submission-prototype-evidence",
      projectTitle: "Smart Lab Assistant for FYP Teams",
      sectionTitle: "Prototype Evidence",
      submittedBy: "Student Research Team",
      status: "in_review",
      priority: "high",
      dueLabel: "This week",
      submittedLabel: "Submitted yesterday",
      readiness: 64,
      summary: "Prototype screenshots and component list are ready, but initial test log is missing.",
      nextAction: "Confirm screenshot validity and request initial test log before milestone release preview.",
      rubric: [
        { id: "rubric-components", label: "Component list", status: "passed", helper: "Component list is attached." },
        { id: "rubric-screenshots", label: "Screenshots", status: "needs_review", helper: "Screenshots need confirmation." },
        { id: "rubric-test-log", label: "Initial test log", status: "missing", helper: "Test log is missing." },
      ],
      feedback: [
        { id: "feedback-test-log", tone: "required", author: "Supervisor", note: "Upload at least one test log with date, setup, and result." },
        { id: "feedback-screenshots", tone: "suggestion", author: "Supervisor", note: "Add captions to each screenshot for easier verification." },
      ],
    },
    {
      id: "submission-literature-matrix",
      projectTitle: "AI Literature Helper for Student Researchers",
      sectionTitle: "Literature Review Matrix",
      submittedBy: "Academic Methods Lab",
      status: "changes_requested",
      priority: "medium",
      dueLabel: "3 days",
      submittedLabel: "Submitted 3 days ago",
      readiness: 58,
      summary: "Literature matrix has sources but needs stronger comparison columns and clearer gap mapping.",
      nextAction: "Request changes for comparison criteria, research gap column, and citation quality notes.",
      rubric: [
        { id: "rubric-source-quality", label: "Source quality", status: "passed", helper: "Most sources are relevant." },
        { id: "rubric-comparison", label: "Comparison columns", status: "needs_review", helper: "Comparison dimensions need improvement." },
        { id: "rubric-gap", label: "Research gap mapping", status: "missing", helper: "Gap column is not strong enough." },
      ],
      feedback: [
        { id: "feedback-gap", tone: "required", author: "Supervisor", note: "Add a direct research gap statement for each major cluster." },
        { id: "feedback-sources", tone: "suggestion", author: "Supervisor", note: "Separate recent papers from background references." },
      ],
    },
    {
      id: "submission-viva-pack",
      projectTitle: "Defense Readiness Pack",
      sectionTitle: "Viva Prep Pack",
      submittedBy: "Final Defense Group",
      status: "approved",
      priority: "low",
      dueLabel: "Done",
      submittedLabel: "Reviewed this week",
      readiness: 92,
      summary: "Viva prep notes are ready for mock defense practice.",
      nextAction: "Keep approved notes available and schedule mock viva sign-off.",
      rubric: [
        { id: "rubric-questions", label: "Question coverage", status: "passed", helper: "Core questions are covered." },
        { id: "rubric-answers", label: "Answer quality", status: "passed", helper: "Answers are clear for practice." },
        { id: "rubric-risk", label: "Weak areas noted", status: "passed", helper: "Risk topics are listed." },
      ],
      feedback: [
        { id: "feedback-approved", tone: "praise", author: "Supervisor", note: "Good structure for mock defense preparation." },
      ],
    },
  ],
};

export function getSupervisorQueueStatusLabel(status: SupervisorQueueStatus): string {
  if (status === "in_review") return "In Review";
  if (status === "changes_requested") return "Changes Requested";
  if (status === "approved") return "Approved";
  if (status === "blocked") return "Blocked";
  return "Pending";
}

export function getSupervisorQueueStatusClass(status: SupervisorQueueStatus): string {
  if (status === "approved") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "in_review") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  if (status === "changes_requested" || status === "blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-amber-500/10 text-amber-600 border-amber-500/30";
}

export function getSupervisorQueuePriorityClass(priority: SupervisorQueuePriority): string {
  if (priority === "urgent") return "bg-red-600/10 text-red-700 border-red-600/30";
  if (priority === "high") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (priority === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
}

export function getSupervisorRubricStatusLabel(status: SupervisorRubricStatus): string {
  if (status === "passed") return "Passed";
  if (status === "needs_review") return "Needs Review";
  return "Missing";
}

export function getSupervisorRubricStatusClass(status: SupervisorRubricStatus): string {
  if (status === "passed") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "needs_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getSupervisorFeedbackToneLabel(tone: SupervisorFeedbackTone): string {
  if (tone === "required") return "Required";
  if (tone === "praise") return "Praise";
  if (tone === "risk") return "Risk";
  return "Suggestion";
}

export function getSupervisorFeedbackToneClass(tone: SupervisorFeedbackTone): string {
  if (tone === "required" || tone === "risk") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (tone === "praise") return "bg-green-500/10 text-green-600 border-green-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getSupervisorReviewQueueCounts(summary: SupervisorReviewQueueSummary = DEMO_SUPERVISOR_REVIEW_QUEUE) {
  return {
    submissions: summary.submissions.length,
    pending: summary.submissions.filter((submission) => submission.status === "pending" || submission.status === "in_review").length,
    changesRequested: summary.submissions.filter((submission) => submission.status === "changes_requested").length,
    approved: summary.submissions.filter((submission) => submission.status === "approved").length,
    urgent: summary.submissions.filter((submission) => submission.priority === "urgent").length,
    missingRubric: summary.submissions.flatMap((submission) => submission.rubric).filter((check) => check.status === "missing").length,
    averageReadiness: Math.round(
      summary.submissions.reduce((total, submission) => total + submission.readiness, 0) / summary.submissions.length,
    ),
  };
}
