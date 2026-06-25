export type ResearchGapConfidence = "low" | "medium" | "high";
export type ResearchGapPriority = "watch" | "candidate" | "strong";
export type ResearchGapEvidenceStatus = "needs_sources" | "partial" | "supported";

export type ResearchGapCandidate = {
  id: string;
  title: string;
  confidence: ResearchGapConfidence;
  priority: ResearchGapPriority;
  evidenceStatus: ResearchGapEvidenceStatus;
  gapStatement: string;
  sourceSignals: string[];
  evidenceNeeded: string[];
  proposalUse: string;
  supervisorQuestion: string;
};

export const RESEARCH_GAP_CANDIDATES: ResearchGapCandidate[] = [
  {
    id: "privacy-aware-attendance",
    title: "Privacy-aware attendance verification workflow",
    confidence: "high",
    priority: "strong",
    evidenceStatus: "partial",
    gapStatement:
      "Existing attendance systems often optimize speed or automation, but do not clearly combine privacy safeguards, consent notes, and fallback verification in one workflow.",
    sourceSignals: ["Biometric privacy risk noted", "QR fallback limitation noted", "Computer vision attendance context exists"],
    evidenceNeeded: ["Current privacy guidance", "Consent/data retention note", "Fallback workflow diagram"],
    proposalUse: "Use as a central gap for a privacy-aware smart attendance and engagement system.",
    supervisorQuestion: "Can we prove privacy safeguards without overclaiming legal compliance?",
  },
  {
    id: "attendance-engagement-action-loop",
    title: "Attendance + engagement action loop",
    confidence: "high",
    priority: "strong",
    evidenceStatus: "supported",
    gapStatement:
      "Many systems track attendance or dashboard engagement, but fewer explain what action a teacher should take when low engagement is detected.",
    sourceSignals: ["Learning analytics dashboard limitation", "Manual process inefficiency", "Need for instructor controls"],
    evidenceNeeded: ["Engagement indicators", "Teacher action workflow", "User testing feedback"],
    proposalUse: "Frame the contribution as moving from passive tracking to actionable academic intervention.",
    supervisorQuestion: "Which engagement signals are realistic for our prototype scope?",
  },
  {
    id: "multi-layer-verification",
    title: "Multi-layer verification instead of single QR/biometric method",
    confidence: "medium",
    priority: "candidate",
    evidenceStatus: "partial",
    gapStatement:
      "Single-method attendance systems can fail under sharing, lighting, occlusion, or privacy constraints, so a layered verification design may be more defensible.",
    sourceSignals: ["QR sharing limitation", "Face recognition lighting/occlusion limitation", "Need fallback verification"],
    evidenceNeeded: ["Comparison table", "Failure case list", "Layered verification design"],
    proposalUse: "Use as a design justification for combining primary and fallback verification modes.",
    supervisorQuestion: "Which layers can be implemented within project timeline and resources?",
  },
  {
    id: "local-university-validation",
    title: "Local university validation gap",
    confidence: "medium",
    priority: "watch",
    evidenceStatus: "needs_sources",
    gapStatement:
      "Several attendance studies may not match the target university context, so local validation is needed before claiming broad effectiveness.",
    sourceSignals: ["One-institution thesis limitation", "Need target-university evidence", "Manual process assumptions need validation"],
    evidenceNeeded: ["Local stakeholder notes", "Survey/interview summary", "Department process evidence"],
    proposalUse: "Use carefully as a validation need, not as a final research claim until local data is collected.",
    supervisorQuestion: "Do we have permission to collect local feedback or process observations?",
  },
];

export function getResearchGapConfidenceClass(confidence: ResearchGapConfidence): string {
  switch (confidence) {
    case "high":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getResearchGapPriorityClass(priority: ResearchGapPriority): string {
  switch (priority) {
    case "strong":
      return "bg-primary/10 text-primary border-primary/30";
    case "candidate":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getResearchGapEvidenceClass(status: ResearchGapEvidenceStatus): string {
  switch (status) {
    case "supported":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "partial":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-red-500/10 text-red-600 border-red-500/30";
  }
}

export function getResearchGapReadiness(candidates: ResearchGapCandidate[] = RESEARCH_GAP_CANDIDATES): number {
  if (candidates.length === 0) return 0;
  const score = candidates.reduce((total, candidate) => {
    const confidenceScore = candidate.confidence === "high" ? 40 : candidate.confidence === "medium" ? 25 : 10;
    const evidenceScore = candidate.evidenceStatus === "supported" ? 60 : candidate.evidenceStatus === "partial" ? 35 : 5;
    return total + confidenceScore + evidenceScore;
  }, 0);
  return Math.round(score / candidates.length);
}

export function getResearchGapCounts(candidates: ResearchGapCandidate[] = RESEARCH_GAP_CANDIDATES) {
  return {
    total: candidates.length,
    strong: candidates.filter((candidate) => candidate.priority === "strong").length,
    supported: candidates.filter((candidate) => candidate.evidenceStatus === "supported").length,
    needsSources: candidates.filter((candidate) => candidate.evidenceStatus === "needs_sources").length,
  };
}
