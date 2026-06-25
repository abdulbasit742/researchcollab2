export type AIToolCategory = "research" | "writing" | "review" | "planning" | "safety";
export type AIToolStatus = "available" | "coming_soon" | "guarded";
export type AIToolRisk = "low" | "medium" | "high";

export type AIToolDefinition = {
  id: string;
  title: string;
  category: AIToolCategory;
  status: AIToolStatus;
  risk: AIToolRisk;
  description: string;
  inputNeeded: string[];
  outputPreview: string;
  safetyNote: string;
};

export const AI_TOOLS_HUB: AIToolDefinition[] = [
  {
    id: "research-gap-finder",
    title: "Research Gap Finder",
    category: "research",
    status: "coming_soon",
    risk: "medium",
    description: "Analyze literature matrix entries and suggest possible research gaps with evidence reminders.",
    inputNeeded: ["Literature matrix", "Project topic", "Target field"],
    outputPreview: "Gap statements, evidence quality notes, and follow-up search suggestions.",
    safetyNote: "Generated gaps must be verified against real sources before report/proposal use.",
  },
  {
    id: "literature-review-assistant",
    title: "Literature Review Assistant",
    category: "research",
    status: "coming_soon",
    risk: "medium",
    description: "Draft literature review paragraphs from approved matrix rows and citation-safe notes.",
    inputNeeded: ["Approved sources", "Comparison themes", "Citation style"],
    outputPreview: "Drafted review paragraphs with placeholders for verified citations.",
    safetyNote: "Should not invent citations or claim that a paper says something without source verification.",
  },
  {
    id: "abstract-generator",
    title: "Abstract Generator",
    category: "writing",
    status: "coming_soon",
    risk: "low",
    description: "Generate an abstract from problem, method, results, and contribution fields.",
    inputNeeded: ["Problem statement", "Methodology summary", "Results", "Contribution"],
    outputPreview: "200–300 word abstract draft with revision checklist.",
    safetyNote: "Results should only be included if the evidence/testing section supports them.",
  },
  {
    id: "methodology-assistant",
    title: "Methodology Assistant",
    category: "planning",
    status: "guarded",
    risk: "medium",
    description: "Turn design, data, tools, and validation notes into a clearer methodology plan.",
    inputNeeded: ["Research design", "Architecture notes", "Data plan", "Validation plan"],
    outputPreview: "Structured method draft with artifacts and review questions.",
    safetyNote: "Methodology should stay aligned with actual implementation and available evidence.",
  },
  {
    id: "viva-prep-assistant",
    title: "Viva Prep Assistant",
    category: "review",
    status: "coming_soon",
    risk: "low",
    description: "Generate viva questions from project scope, methodology, results, limitations, and evidence links.",
    inputNeeded: ["Project summary", "Methodology", "Testing results", "Limitations"],
    outputPreview: "Question bank with suggested answer points and weak-area flags.",
    safetyNote: "Answers should be treated as practice notes, not guaranteed examiner questions.",
  },
  {
    id: "citation-safety-checker",
    title: "Citation Safety Checker",
    category: "safety",
    status: "guarded",
    risk: "high",
    description: "Review generated text for citation gaps, weak sources, outdated references, and unsupported claims.",
    inputNeeded: ["Report/proposal text", "Reference list", "Citation warnings"],
    outputPreview: "Citation risk summary with recommended fixes.",
    safetyNote: "Must never fabricate references; it should ask for source verification where evidence is missing.",
  },
  {
    id: "project-risk-ai",
    title: "Project Risk AI",
    category: "planning",
    status: "coming_soon",
    risk: "medium",
    description: "Summarize blockers from health score, tasks, milestones, evidence gaps, and supervisor comments.",
    inputNeeded: ["Task status", "Milestones", "Risk alerts", "Supervisor comments"],
    outputPreview: "Risk summary, recommended actions, and next sprint focus.",
    safetyNote: "Risk suggestions should not override supervisor or department requirements.",
  },
  {
    id: "ai-prompt-library",
    title: "AI Prompt Library",
    category: "writing",
    status: "available",
    risk: "low",
    description: "Provide safe reusable prompts for report writing, review, summaries, and improvement tasks.",
    inputNeeded: ["Use case", "Section type", "Tone/format preference"],
    outputPreview: "Copy-ready prompts with safety reminders.",
    safetyNote: "Prompt outputs should be reviewed before adding to formal academic documents.",
  },
];

export function getAIToolCategoryLabel(category: AIToolCategory): string {
  switch (category) {
    case "research":
      return "Research";
    case "writing":
      return "Writing";
    case "review":
      return "Review";
    case "planning":
      return "Planning";
    default:
      return "Safety";
  }
}

export function getAIToolStatusLabel(status: AIToolStatus): string {
  switch (status) {
    case "available":
      return "Available";
    case "guarded":
      return "Guarded";
    default:
      return "Coming Soon";
  }
}

export function getAIToolStatusClass(status: AIToolStatus): string {
  switch (status) {
    case "available":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "guarded":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getAIToolRiskClass(risk: AIToolRisk): string {
  switch (risk) {
    case "high":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  }
}

export function getAIToolCounts(tools: AIToolDefinition[] = AI_TOOLS_HUB) {
  return {
    total: tools.length,
    available: tools.filter((tool) => tool.status === "available").length,
    guarded: tools.filter((tool) => tool.status === "guarded").length,
    comingSoon: tools.filter((tool) => tool.status === "coming_soon").length,
    highRisk: tools.filter((tool) => tool.risk === "high").length,
  };
}
