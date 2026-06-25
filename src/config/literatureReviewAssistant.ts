export type LiteratureReviewDraftStatus = "outline" | "draft" | "needs_sources" | "review_ready";
export type LiteratureReviewTheme = "attendance" | "analytics" | "privacy" | "verification" | "operations";

export type LiteratureReviewDraft = {
  id: string;
  theme: LiteratureReviewTheme;
  title: string;
  status: LiteratureReviewDraftStatus;
  sourceCount: number;
  citationPlaceholders: number;
  draftParagraph: string;
  sourceNotes: string[];
  warnings: string[];
  nextAction: string;
};

export const LITERATURE_REVIEW_DRAFTS: LiteratureReviewDraft[] = [
  {
    id: "draft-attendance-automation",
    theme: "attendance",
    title: "Automated attendance verification",
    status: "draft",
    sourceCount: 2,
    citationPlaceholders: 2,
    draftParagraph:
      "Automated attendance verification has been explored as a way to reduce manual attendance workload and proxy attendance risks. Computer-vision-based methods can support faster verification, while QR-based systems provide a lightweight deployment path. However, both approaches need careful handling of failure cases such as lighting variation, code sharing, occlusion, and user privacy concerns [citation needed].",
    sourceNotes: ["Computer vision attendance source", "QR attendance system source"],
    warnings: ["Do not claim universal accuracy without test evidence.", "Add a verified citation for workload reduction."],
    nextAction: "Verify the two source claims and replace citation placeholders with final references.",
  },
  {
    id: "draft-engagement-analytics",
    theme: "analytics",
    title: "Learning analytics and instructor action",
    status: "review_ready",
    sourceCount: 1,
    citationPlaceholders: 1,
    draftParagraph:
      "Learning analytics dashboards can help instructors identify students who may need early support. Existing dashboard work highlights the value of engagement indicators, but many systems still stop at visualization and do not clearly connect analytics to an action workflow for teachers [citation needed]. This creates space for a system that links attendance, engagement signals, and recommended interventions.",
    sourceNotes: ["Learning analytics dashboard source"],
    warnings: ["Supervisor should approve which engagement indicators are realistic."],
    nextAction: "Map engagement indicators to teacher actions and connect this paragraph to the research gap section.",
  },
  {
    id: "draft-privacy-ethics",
    theme: "privacy",
    title: "Privacy and ethics in biometric education systems",
    status: "needs_sources",
    sourceCount: 1,
    citationPlaceholders: 3,
    draftParagraph:
      "Biometric and attendance-related educational systems require careful attention to consent, data retention, user transparency, and fallback options. A privacy-aware workflow should avoid treating biometric verification as the only acceptable path and should clearly explain how data is stored, reviewed, and removed [citation needed].",
    sourceNotes: ["Biometric privacy report source"],
    warnings: ["Privacy guidance may be outdated.", "Verify local institution/legal policy before formal submission."],
    nextAction: "Add current institutional or official policy references before using this in the proposal.",
  },
  {
    id: "draft-local-validation",
    theme: "operations",
    title: "Local validation and operational fit",
    status: "outline",
    sourceCount: 1,
    citationPlaceholders: 2,
    draftParagraph:
      "Attendance management challenges can vary by institution, department, class size, and teacher workflow. Local validation is therefore important before making broad claims about effectiveness. Stakeholder notes, process observations, or small surveys can help confirm whether manual attendance problems and proposed digital workflows match the target university context [citation needed].",
    sourceNotes: ["Manual attendance limitations thesis/source"],
    warnings: ["Needs local evidence before strong claims.", "Do not overgeneralize from one institution."],
    nextAction: "Collect local process notes or mark this as a limitation until evidence is available.",
  },
];

export function getLiteratureReviewDraftStatusLabel(status: LiteratureReviewDraftStatus): string {
  switch (status) {
    case "review_ready":
      return "Review Ready";
    case "needs_sources":
      return "Needs Sources";
    case "draft":
      return "Draft";
    default:
      return "Outline";
  }
}

export function getLiteratureReviewDraftStatusClass(status: LiteratureReviewDraftStatus): string {
  switch (status) {
    case "review_ready":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "needs_sources":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "draft":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getLiteratureReviewThemeLabel(theme: LiteratureReviewTheme): string {
  switch (theme) {
    case "attendance":
      return "Attendance";
    case "analytics":
      return "Analytics";
    case "privacy":
      return "Privacy";
    case "verification":
      return "Verification";
    default:
      return "Operations";
  }
}

export function getLiteratureReviewAssistantReadiness(drafts: LiteratureReviewDraft[] = LITERATURE_REVIEW_DRAFTS): number {
  if (drafts.length === 0) return 0;
  const score = drafts.reduce((total, draft) => {
    if (draft.status === "review_ready") return total + 100;
    if (draft.status === "draft") return total + 65;
    if (draft.status === "outline") return total + 35;
    return total + 20;
  }, 0);
  return Math.round(score / drafts.length);
}

export function getLiteratureReviewAssistantCounts(drafts: LiteratureReviewDraft[] = LITERATURE_REVIEW_DRAFTS) {
  return {
    total: drafts.length,
    reviewReady: drafts.filter((draft) => draft.status === "review_ready").length,
    needsSources: drafts.filter((draft) => draft.status === "needs_sources").length,
    citationPlaceholders: drafts.reduce((total, draft) => total + draft.citationPlaceholders, 0),
  };
}
