export type PromptLibraryCategory = "writing" | "review" | "research" | "methodology" | "viva" | "planning";
export type PromptSafetyLevel = "safe" | "review_needed" | "source_required";

export type PromptLibraryItem = {
  id: string;
  title: string;
  category: PromptLibraryCategory;
  safetyLevel: PromptSafetyLevel;
  useCase: string;
  prompt: string;
  inputsNeeded: string[];
  outputChecklist: string[];
};

export const AI_PROMPT_LIBRARY_ITEMS: PromptLibraryItem[] = [
  {
    id: "prompt-report-section-improve",
    title: "Improve a Report Section",
    category: "writing",
    safetyLevel: "review_needed",
    useCase: "Rewrite a report section in clearer academic language without changing the meaning.",
    prompt:
      "Improve the following report section for clarity, structure, and academic tone. Keep the original meaning, do not add unsupported claims, and list any missing evidence separately. Section text: {{section_text}}",
    inputsNeeded: ["Section text", "Target tone", "Evidence notes"],
    outputChecklist: ["Meaning preserved", "Missing evidence listed", "No unsupported claims added"],
  },
  {
    id: "prompt-citation-gap-check",
    title: "Citation Gap Check",
    category: "review",
    safetyLevel: "source_required",
    useCase: "Find claims that need citations or stronger source support.",
    prompt:
      "Review this text and identify statements that need citations, source verification, or softer wording. Do not invent references. Return a table with claim, issue, and recommended action. Text: {{draft_text}}",
    inputsNeeded: ["Draft text", "Reference list", "Citation style"],
    outputChecklist: ["Claims flagged", "No fabricated references", "Recommended action included"],
  },
  {
    id: "prompt-literature-matrix-summary",
    title: "Literature Matrix Summary",
    category: "research",
    safetyLevel: "source_required",
    useCase: "Summarize literature matrix rows into themes for review writing.",
    prompt:
      "Summarize these literature matrix rows into themes, limitations, and possible research gaps. Use only the provided rows and mark uncertain points as needs verification. Rows: {{matrix_rows}}",
    inputsNeeded: ["Matrix rows", "Project topic", "Research field"],
    outputChecklist: ["Themes grouped", "Limitations separated", "Uncertain points marked"],
  },
  {
    id: "prompt-methodology-refine",
    title: "Methodology Refiner",
    category: "methodology",
    safetyLevel: "review_needed",
    useCase: "Turn methodology notes into a structured methodology draft.",
    prompt:
      "Convert these methodology notes into a structured draft with headings for design, architecture, data, tools, validation, and limitations. Keep assumptions clearly marked. Notes: {{methodology_notes}}",
    inputsNeeded: ["Methodology notes", "Architecture summary", "Validation plan"],
    outputChecklist: ["Headings included", "Assumptions marked", "Validation needs listed"],
  },
  {
    id: "prompt-viva-answer-practice",
    title: "Viva Answer Practice",
    category: "viva",
    safetyLevel: "safe",
    useCase: "Practice a short viva answer from project facts.",
    prompt:
      "Help me answer this viva question in 5 to 7 clear bullet points using only the project facts provided. Also add one follow-up question the examiner may ask. Question: {{viva_question}} Project facts: {{project_facts}}",
    inputsNeeded: ["Viva question", "Project facts", "Weak area note"],
    outputChecklist: ["Short answer", "Project facts used", "Follow-up question included"],
  },
  {
    id: "prompt-risk-action-plan",
    title: "Risk Action Plan",
    category: "planning",
    safetyLevel: "safe",
    useCase: "Convert risk signals into a next-step plan.",
    prompt:
      "Create a practical action plan from these project risks. Prioritize by urgency, owner, and expected impact. Do not change project status; only suggest actions. Risks: {{risk_signals}}",
    inputsNeeded: ["Risk signals", "Owners", "Deadline"],
    outputChecklist: ["Actions prioritized", "Owners included", "No status changed automatically"],
  },
];

export function getPromptCategoryLabel(category: PromptLibraryCategory): string {
  if (category === "writing") return "Writing";
  if (category === "review") return "Review";
  if (category === "research") return "Research";
  if (category === "methodology") return "Methodology";
  if (category === "viva") return "Viva";
  return "Planning";
}

export function getPromptSafetyLabel(level: PromptSafetyLevel): string {
  if (level === "safe") return "Safe";
  if (level === "source_required") return "Source Required";
  return "Review Needed";
}

export function getPromptSafetyClass(level: PromptSafetyLevel): string {
  if (level === "safe") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (level === "source_required") return "bg-red-500/10 text-red-600 border-red-500/30";
  return "bg-amber-500/10 text-amber-600 border-amber-500/30";
}

export function getPromptLibraryCounts(items: PromptLibraryItem[] = AI_PROMPT_LIBRARY_ITEMS) {
  return {
    total: items.length,
    safe: items.filter((item) => item.safetyLevel === "safe").length,
    reviewNeeded: items.filter((item) => item.safetyLevel === "review_needed").length,
    sourceRequired: items.filter((item) => item.safetyLevel === "source_required").length,
  };
}
