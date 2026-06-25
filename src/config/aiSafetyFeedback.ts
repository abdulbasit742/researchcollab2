export type AISafetyFeedbackCategory = "unsupported_claim" | "missing_source" | "overconfident_result" | "unclear_scope" | "sensitive_data" | "quality_issue";
export type AISafetySeverity = "low" | "medium" | "high" | "critical";
export type AISafetyStatus = "open" | "under_review" | "resolved" | "dismissed";

export type AISafetyFeedbackItem = {
  id: string;
  category: AISafetyFeedbackCategory;
  severity: AISafetySeverity;
  status: AISafetyStatus;
  relatedTool: string;
  title: string;
  feedbackSummary: string;
  affectedOutput: string;
  suggestedFix: string;
  reviewer: string;
  createdLabel: string;
};

export const AI_SAFETY_FEEDBACK_ITEMS: AISafetyFeedbackItem[] = [
  {
    id: "safety-validation-overclaim",
    category: "overconfident_result",
    severity: "high",
    status: "open",
    relatedTool: "Abstract Generator",
    title: "Expected results sound too final",
    feedbackSummary: "The abstract preview should avoid presenting planned validation as completed results.",
    affectedOutput: "Abstract draft preview",
    suggestedFix: "Use planned evaluation wording until observed results and evidence links are attached.",
    reviewer: "QA Owner",
    createdLabel: "Today, 12:25",
  },
  {
    id: "safety-citation-needed",
    category: "missing_source",
    severity: "medium",
    status: "under_review",
    relatedTool: "Literature Review Assistant",
    title: "Citation placeholder still present",
    feedbackSummary: "A literature paragraph includes claims that need final source support before report use.",
    affectedOutput: "Learning analytics paragraph draft",
    suggestedFix: "Attach approved literature matrix rows and replace placeholder references.",
    reviewer: "Report Lead",
    createdLabel: "Today, 12:35",
  },
  {
    id: "safety-scope-boundary",
    category: "unclear_scope",
    severity: "medium",
    status: "open",
    relatedTool: "Project Risk AI",
    title: "Completed versus planned work needs clearer label",
    feedbackSummary: "Some AI summaries mention future integrations near completed UI features, which may confuse reviewers.",
    affectedOutput: "Project risk action summary",
    suggestedFix: "Add a scope note separating implemented panels, disabled placeholders, and future backend integrations.",
    reviewer: "Project Lead",
    createdLabel: "Today, 12:45",
  },
  {
    id: "safety-data-note",
    category: "sensitive_data",
    severity: "high",
    status: "open",
    relatedTool: "Research Gap Finder",
    title: "Responsible data wording needs review",
    feedbackSummary: "A gap candidate references data handling and fallback workflow notes that need careful reviewer wording.",
    affectedOutput: "Privacy-aware workflow gap note",
    suggestedFix: "Keep wording general, ask for supervisor approval, and avoid unsupported compliance statements.",
    reviewer: "Supervisor Reviewer",
    createdLabel: "Today, 13:00",
  },
  {
    id: "safety-quality-resolved",
    category: "quality_issue",
    severity: "low",
    status: "resolved",
    relatedTool: "AI Prompt Library",
    title: "Prompt template wording improved",
    feedbackSummary: "Template wording now reminds users not to add unsupported claims.",
    affectedOutput: "Improve a Report Section template",
    suggestedFix: "No current action. Keep template linked to review workflow.",
    reviewer: "Documentation Owner",
    createdLabel: "Today, 13:10",
  },
];

export function getAISafetyCategoryLabel(category: AISafetyFeedbackCategory): string {
  if (category === "unsupported_claim") return "Unsupported Claim";
  if (category === "missing_source") return "Missing Source";
  if (category === "overconfident_result") return "Overconfident Result";
  if (category === "unclear_scope") return "Unclear Scope";
  if (category === "sensitive_data") return "Data Handling";
  return "Quality Issue";
}

export function getAISafetySeverityClass(severity: AISafetySeverity): string {
  if (severity === "critical") return "bg-red-600/10 text-red-700 border-red-600/30 dark:text-red-300";
  if (severity === "high") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (severity === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
}

export function getAISafetyStatusLabel(status: AISafetyStatus): string {
  if (status === "under_review") return "Under Review";
  if (status === "resolved") return "Resolved";
  if (status === "dismissed") return "Dismissed";
  return "Open";
}

export function getAISafetyStatusClass(status: AISafetyStatus): string {
  if (status === "resolved") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "under_review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "dismissed") return "bg-muted text-muted-foreground border-border";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getAISafetyFeedbackCounts(items: AISafetyFeedbackItem[] = AI_SAFETY_FEEDBACK_ITEMS) {
  return {
    total: items.length,
    open: items.filter((item) => item.status === "open").length,
    high: items.filter((item) => item.severity === "high" || item.severity === "critical").length,
    resolved: items.filter((item) => item.status === "resolved").length,
  };
}
