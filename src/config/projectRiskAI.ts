export type RiskAILevel = "low" | "medium" | "high" | "critical";
export type RiskAICategory = "schedule" | "quality" | "scope" | "evidence" | "review" | "release";
export type RiskAIStatus = "watch" | "action_needed" | "blocked" | "stable";

export type RiskAIInsight = {
  id: string;
  category: RiskAICategory;
  level: RiskAILevel;
  status: RiskAIStatus;
  title: string;
  summary: string;
  signals: string[];
  recommendedActions: string[];
  owner: string;
};

export const PROJECT_RISK_AI_INSIGHTS: RiskAIInsight[] = [
  {
    id: "risk-validation-proof",
    category: "evidence",
    level: "high",
    status: "action_needed",
    title: "Validation proof gap",
    summary: "Testing and validation content is visible in the workspace, but final proof still needs stronger linked evidence before confident submission.",
    signals: ["Evidence readiness below ideal", "Validation viva question marked weak", "Export targets blocked by missing validation proof"],
    recommendedActions: ["Create validation table", "Attach observed results", "Link evidence to final report sections"],
    owner: "QA Owner",
  },
  {
    id: "risk-scope-clarity",
    category: "scope",
    level: "medium",
    status: "watch",
    title: "Scope clarity needs polish",
    summary: "The project has many powerful modules, so demo placeholders should be clearly separated from completed production work.",
    signals: ["Version history includes placeholder snapshots", "Several actions are intentionally disabled", "Viva scope topic needs practice"],
    recommendedActions: ["Add scope boundary note", "List completed versus planned modules", "Keep demo labels visible"],
    owner: "Project Lead",
  },
  {
    id: "risk-review-comments",
    category: "review",
    level: "high",
    status: "action_needed",
    title: "Open review comments",
    summary: "Supervisor-style comments are present and should be closed before final export or defense preparation.",
    signals: ["Open comments exist", "High-priority feedback exists", "Report section tracker has review states"],
    recommendedActions: ["Resolve high-priority comments", "Document response notes", "Update affected sections"],
    owner: "Report Lead",
  },
  {
    id: "risk-release-readiness",
    category: "release",
    level: "medium",
    status: "watch",
    title: "Export and release readiness",
    summary: "Document export targets are planned, but blocked checks must be cleared before final PDF or DOCX generation is enabled.",
    signals: ["PDF export blocked", "Citation checks still open", "Evidence bundle partly ready"],
    recommendedActions: ["Clear export blockers", "Run citation review", "Confirm included sections"],
    owner: "Documentation Owner",
  },
  {
    id: "risk-health-stable",
    category: "quality",
    level: "low",
    status: "stable",
    title: "Workspace structure is improving",
    summary: "Core project workspace tabs, trackers, and AI support panels are now organized into a clearer execution flow.",
    signals: ["Health dashboard exists", "Tasks and milestones are visible", "AI tools hub is connected"],
    recommendedActions: ["Keep sections synced", "Avoid duplicate placeholders", "Let build workflow validate imports"],
    owner: "Tech Lead",
  },
];

export function getRiskAILevelClass(level: RiskAILevel): string {
  if (level === "critical") return "bg-red-600/10 text-red-700 border-red-600/30 dark:text-red-300";
  if (level === "high") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (level === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
}

export function getRiskAIStatusLabel(status: RiskAIStatus): string {
  if (status === "action_needed") return "Action Needed";
  if (status === "blocked") return "Blocked";
  if (status === "stable") return "Stable";
  return "Watch";
}

export function getRiskAIStatusClass(status: RiskAIStatus): string {
  if (status === "action_needed") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (status === "blocked") return "bg-red-600/10 text-red-700 border-red-600/30 dark:text-red-300";
  if (status === "stable") return "bg-green-500/10 text-green-600 border-green-500/30";
  return "bg-amber-500/10 text-amber-600 border-amber-500/30";
}

export function getRiskAICategoryLabel(category: RiskAICategory): string {
  if (category === "schedule") return "Schedule";
  if (category === "quality") return "Quality";
  if (category === "scope") return "Scope";
  if (category === "evidence") return "Evidence";
  if (category === "review") return "Review";
  return "Release";
}

export function getRiskAIScore(insights: RiskAIInsight[] = PROJECT_RISK_AI_INSIGHTS): number {
  if (insights.length === 0) return 100;
  const penalty = insights.reduce((total, insight) => {
    if (insight.level === "critical") return total + 30;
    if (insight.level === "high") return total + 20;
    if (insight.level === "medium") return total + 10;
    return total + 3;
  }, 0);
  return Math.max(0, 100 - penalty);
}

export function getRiskAICounts(insights: RiskAIInsight[] = PROJECT_RISK_AI_INSIGHTS) {
  return {
    total: insights.length,
    high: insights.filter((insight) => insight.level === "high" || insight.level === "critical").length,
    actionNeeded: insights.filter((insight) => insight.status === "action_needed" || insight.status === "blocked").length,
    stable: insights.filter((insight) => insight.status === "stable").length,
  };
}
