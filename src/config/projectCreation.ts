export type ProjectCreationType = "fyp" | "research" | "prototype";
export type ProjectBuildTier = "prototype" | "mvp" | "extended";

export type ProjectTypeOption = {
  value: ProjectCreationType;
  label: string;
  description: string;
  outcomeLabel: string;
};

export type ProjectTierOption = {
  value: ProjectBuildTier;
  label: string;
  budget: string;
  milestones: number;
  duration: string;
  description: string;
};

export const PROJECT_TYPE_OPTIONS: ProjectTypeOption[] = [
  {
    value: "fyp",
    label: "FYP Project",
    description: "Industry or academic problem for student teams with faculty supervision.",
    outcomeLabel: "Prototype, report, demo, and viva-ready documentation",
  },
  {
    value: "research",
    label: "Research Project",
    description: "Research proposal, literature review, experimentation, or publication workflow.",
    outcomeLabel: "Proposal, methodology, dataset/results, and final manuscript",
  },
  {
    value: "prototype",
    label: "Startup Prototype",
    description: "Applied product, MVP, automation, or technical proof-of-concept build.",
    outcomeLabel: "Working demo, milestone evidence, and handover package",
  },
];

export const PROJECT_TIER_OPTIONS: ProjectTierOption[] = [
  {
    value: "prototype",
    label: "Prototype",
    budget: "PKR 50K–100K",
    milestones: 3,
    duration: "6–8 weeks",
    description: "Best for idea validation, demos, and early technical proof.",
  },
  {
    value: "mvp",
    label: "Functional MVP",
    budget: "PKR 150K–250K",
    milestones: 4,
    duration: "10–12 weeks",
    description: "Best for a usable product, research workflow, or deployable pilot.",
  },
  {
    value: "extended",
    label: "Extended Build",
    budget: "PKR 300K–500K",
    milestones: 5,
    duration: "14–16 weeks",
    description: "Best for complex research, integrations, or multi-module execution.",
  },
];

export const PROJECT_CREATION_STEPS = [
  "Capture problem and expected outcomes",
  "Review feasibility and required skills",
  "Convert into milestones and evidence checkpoints",
  "Match with student/research team or execution partner",
  "Kick off with supervision, review, and demo-safe funding labels",
];

export function getProjectTypeOption(type: ProjectCreationType): ProjectTypeOption {
  return PROJECT_TYPE_OPTIONS.find((option) => option.value === type) ?? PROJECT_TYPE_OPTIONS[0];
}

export function getProjectTierOption(tier: ProjectBuildTier): ProjectTierOption {
  return PROJECT_TIER_OPTIONS.find((option) => option.value === tier) ?? PROJECT_TIER_OPTIONS[0];
}
