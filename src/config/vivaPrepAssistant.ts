export type VivaPrepStatus = "weak" | "practice" | "ready";
export type VivaPrepDifficulty = "easy" | "medium" | "hard";

export type VivaPrepItem = {
  id: string;
  topic: string;
  difficulty: VivaPrepDifficulty;
  status: VivaPrepStatus;
  question: string;
  answerPoints: string[];
  supportingMaterial: string[];
  focusNote: string;
};

export const VIVA_PREP_ITEMS: VivaPrepItem[] = [
  {
    id: "problem-intro",
    topic: "Problem",
    difficulty: "easy",
    status: "ready",
    question: "What problem does your project solve?",
    answerPoints: ["Explain the core problem.", "Mention why it matters.", "Connect it to the project scope."],
    supportingMaterial: ["Problem statement", "Project overview"],
    focusNote: "Keep the answer short, clear, and connected to project goals.",
  },
  {
    id: "method-choice",
    topic: "Methodology",
    difficulty: "medium",
    status: "practice",
    question: "Why did you choose this methodology?",
    answerPoints: ["Map method steps to objectives.", "Explain the workflow.", "Mention limitations."],
    supportingMaterial: ["Methodology assistant", "Architecture notes"],
    focusNote: "Practice explaining the method without adding unsupported claims.",
  },
  {
    id: "validation-plan",
    topic: "Validation",
    difficulty: "hard",
    status: "weak",
    question: "How will you validate your project?",
    answerPoints: ["Describe test cases.", "Explain success criteria.", "Use linked proof where available."],
    supportingMaterial: ["Validation table", "Evidence links"],
    focusNote: "This is a weak area until testing proof is attached.",
  },
  {
    id: "scope-limits",
    topic: "Scope",
    difficulty: "hard",
    status: "weak",
    question: "What are the limits of your project?",
    answerPoints: ["State included work.", "State excluded work.", "Separate demo placeholders from final work."],
    supportingMaterial: ["Version history", "Project workspace"],
    focusNote: "Be honest about boundaries and planned improvements.",
  },
  {
    id: "impact",
    topic: "Impact",
    difficulty: "medium",
    status: "practice",
    question: "What is your main contribution?",
    answerPoints: ["Explain the main value.", "Connect it to the research gap.", "Mention future improvements."],
    supportingMaterial: ["Abstract generator", "Research gap finder"],
    focusNote: "Avoid overstating results before evaluation is complete.",
  },
];

export function getVivaPrepStatusLabel(status: VivaPrepStatus): string {
  if (status === "ready") return "Ready";
  if (status === "practice") return "Practice";
  return "Weak Area";
}

export function getVivaPrepStatusClass(status: VivaPrepStatus): string {
  if (status === "ready") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "practice") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getVivaPrepDifficultyClass(difficulty: VivaPrepDifficulty): string {
  if (difficulty === "hard") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (difficulty === "medium") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getVivaPrepReadiness(items: VivaPrepItem[] = VIVA_PREP_ITEMS): number {
  if (items.length === 0) return 0;
  const score = items.reduce((total, item) => {
    if (item.status === "ready") return total + 100;
    if (item.status === "practice") return total + 60;
    return total + 25;
  }, 0);
  return Math.round(score / items.length);
}

export function getVivaPrepCounts(items: VivaPrepItem[] = VIVA_PREP_ITEMS) {
  return {
    total: items.length,
    ready: items.filter((item) => item.status === "ready").length,
    practice: items.filter((item) => item.status === "practice").length,
    weak: items.filter((item) => item.status === "weak").length,
    hard: items.filter((item) => item.difficulty === "hard").length,
  };
}
