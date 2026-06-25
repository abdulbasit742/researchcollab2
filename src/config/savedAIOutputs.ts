export type SavedAIOutputSource = "gap_finder" | "literature_assistant" | "abstract_generator" | "methodology_assistant" | "viva_prep" | "risk_ai";
export type SavedAIOutputStatus = "draft" | "review_needed" | "approved" | "archived";
export type SavedAIOutputRisk = "low" | "medium" | "high";

export type SavedAIOutput = {
  id: string;
  title: string;
  source: SavedAIOutputSource;
  status: SavedAIOutputStatus;
  risk: SavedAIOutputRisk;
  savedBy: string;
  savedAtLabel: string;
  summary: string;
  outputPreview: string;
  reviewNotes: string[];
  reuseChecklist: string[];
};

export const SAVED_AI_OUTPUTS: SavedAIOutput[] = [
  {
    id: "saved-gap-privacy-workflow",
    title: "Privacy-aware workflow gap note",
    source: "gap_finder",
    status: "review_needed",
    risk: "medium",
    savedBy: "Research Lead",
    savedAtLabel: "Today, 09:30",
    summary: "Saved gap candidate about combining verification workflow, fallback options, and responsible data notes.",
    outputPreview: "A privacy-aware attendance workflow can be framed as a research gap when supported by current sources and local validation notes.",
    reviewNotes: ["Verify current sources before formal use", "Ask supervisor to approve wording", "Avoid broad legal claims"],
    reuseChecklist: ["Link to literature matrix", "Add citation evidence", "Mark scope boundary"],
  },
  {
    id: "saved-literature-analytics-draft",
    title: "Learning analytics paragraph draft",
    source: "literature_assistant",
    status: "draft",
    risk: "medium",
    savedBy: "Report Lead",
    savedAtLabel: "Today, 10:15",
    summary: "Draft literature paragraph about dashboards moving from passive tracking to teacher action workflow.",
    outputPreview: "Learning analytics dashboards can highlight students needing support, but the stronger contribution is linking signals to clear teacher actions.",
    reviewNotes: ["Needs final citations", "Check source wording", "Keep the claim tied to project scope"],
    reuseChecklist: ["Replace placeholders", "Attach source rows", "Run citation warning check"],
  },
  {
    id: "saved-abstract-preview",
    title: "Abstract draft preview",
    source: "abstract_generator",
    status: "review_needed",
    risk: "medium",
    savedBy: "Student Team",
    savedAtLabel: "Today, 11:00",
    summary: "Saved abstract draft based on problem, method, expected evaluation, contribution, and keywords.",
    outputPreview: "This project addresses manual workflow challenges and proposes an evidence-linked research preparation workflow with validation-ready documentation.",
    reviewNotes: ["Replace expected evaluation with measured results later", "Supervisor review required", "Keep contribution realistic"],
    reuseChecklist: ["Confirm results section", "Check keyword alignment", "Add final report version link"],
  },
  {
    id: "saved-method-validation-plan",
    title: "Validation plan outline",
    source: "methodology_assistant",
    status: "draft",
    risk: "high",
    savedBy: "QA Owner",
    savedAtLabel: "Today, 11:40",
    summary: "Methodology output describing test cases, acceptance criteria, observed results, and evidence links.",
    outputPreview: "Validation should map each objective to a test case, expected result, observed result, acceptance rule, and attached proof.",
    reviewNotes: ["Needs real test results", "Do not mark as complete yet", "Evidence links are missing"],
    reuseChecklist: ["Create test table", "Attach screenshots", "Update viva weak area"],
  },
  {
    id: "saved-risk-summary",
    title: "Project risk action summary",
    source: "risk_ai",
    status: "approved",
    risk: "low",
    savedBy: "Project Lead",
    savedAtLabel: "Today, 12:10",
    summary: "Approved summary of current risk focus areas and recommended next sprint actions.",
    outputPreview: "Focus on validation proof, scope clarity, review comments, and export blockers before final submission packaging.",
    reviewNotes: ["Useful for next sprint planning", "Keep owners updated"],
    reuseChecklist: ["Add to activity timeline", "Assign owners", "Review after next feature batch"],
  },
];

export function getSavedAIOutputSourceLabel(source: SavedAIOutputSource): string {
  if (source === "gap_finder") return "Research Gap Finder";
  if (source === "literature_assistant") return "Literature Review Assistant";
  if (source === "abstract_generator") return "Abstract Generator";
  if (source === "methodology_assistant") return "Methodology Assistant";
  if (source === "viva_prep") return "Viva Prep";
  return "Project Risk AI";
}

export function getSavedAIOutputStatusLabel(status: SavedAIOutputStatus): string {
  if (status === "approved") return "Approved";
  if (status === "review_needed") return "Review Needed";
  if (status === "archived") return "Archived";
  return "Draft";
}

export function getSavedAIOutputStatusClass(status: SavedAIOutputStatus): string {
  if (status === "approved") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review_needed") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "archived") return "bg-muted text-muted-foreground border-border";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getSavedAIOutputRiskClass(risk: SavedAIOutputRisk): string {
  if (risk === "high") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (risk === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
}

export function getSavedAIOutputCounts(outputs: SavedAIOutput[] = SAVED_AI_OUTPUTS) {
  return {
    total: outputs.length,
    approved: outputs.filter((output) => output.status === "approved").length,
    reviewNeeded: outputs.filter((output) => output.status === "review_needed").length,
    highRisk: outputs.filter((output) => output.risk === "high").length,
  };
}
