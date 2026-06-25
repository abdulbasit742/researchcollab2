export type CitationWarningSeverity = "low" | "medium" | "high" | "critical";
export type CitationWarningType = "missing_citation" | "weak_source" | "outdated_source" | "format_issue" | "claim_mismatch";
export type CitationArea = "final_report" | "proposal" | "literature_review" | "methodology";

export type CitationWarning = {
  id: string;
  area: CitationArea;
  areaLabel: string;
  sectionTitle: string;
  warningType: CitationWarningType;
  severity: CitationWarningSeverity;
  claimOrReference: string;
  issue: string;
  recommendedAction: string;
};

export const CITATION_WARNINGS: CitationWarning[] = [
  {
    id: "citation-intro-impact",
    area: "final_report",
    areaLabel: "Final Report",
    sectionTitle: "Introduction",
    warningType: "missing_citation",
    severity: "high",
    claimOrReference: "Automated attendance systems significantly reduce proxy attendance and manual workload.",
    issue: "Impact claim needs a citation from a credible study or institutional report.",
    recommendedAction: "Attach a recent study or convert the sentence into a limited project-specific claim.",
  },
  {
    id: "citation-lit-weak-source",
    area: "literature_review",
    areaLabel: "Literature Review",
    sectionTitle: "Existing Systems Comparison",
    warningType: "weak_source",
    severity: "medium",
    claimOrReference: "General blog source about QR attendance systems",
    issue: "Source may be too weak for academic comparison unless supported by stronger references.",
    recommendedAction: "Replace or support it with a peer-reviewed paper, thesis, or official system documentation.",
  },
  {
    id: "citation-privacy-outdated",
    area: "proposal",
    areaLabel: "Proposal",
    sectionTitle: "Ethics, Data & Risk Plan",
    warningType: "outdated_source",
    severity: "high",
    claimOrReference: "Older privacy guidance for biometric data in education",
    issue: "Privacy and data protection rules can change. The proposal should use current guidance.",
    recommendedAction: "Verify the newest institutional, legal, or official policy source before submission.",
  },
  {
    id: "citation-method-claim",
    area: "methodology",
    areaLabel: "Methodology",
    sectionTitle: "Testing, Validation & Evaluation",
    warningType: "claim_mismatch",
    severity: "critical",
    claimOrReference: "Model accuracy is expected to be high across all classroom conditions.",
    issue: "The claim is stronger than the available validation plan and may be challenged in review.",
    recommendedAction: "Add measurable test cases or soften the claim until evidence is available.",
  },
  {
    id: "citation-format-reference",
    area: "final_report",
    areaLabel: "Final Report",
    sectionTitle: "References & Appendix",
    warningType: "format_issue",
    severity: "low",
    claimOrReference: "Mixed APA/IEEE style references",
    issue: "References appear to mix citation styles, which can reduce report professionalism.",
    recommendedAction: "Choose one citation style and apply it consistently across the report.",
  },
];

export function getCitationWarningTypeLabel(type: CitationWarningType): string {
  switch (type) {
    case "missing_citation":
      return "Missing Citation";
    case "weak_source":
      return "Weak Source";
    case "outdated_source":
      return "Outdated Source";
    case "format_issue":
      return "Format Issue";
    case "claim_mismatch":
      return "Claim Mismatch";
    default:
      return "Citation Warning";
  }
}

export function getCitationWarningSeverityClass(severity: CitationWarningSeverity): string {
  switch (severity) {
    case "critical":
      return "bg-red-600/10 text-red-700 border-red-600/30 dark:text-red-300";
    case "high":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  }
}

export function getOpenCitationWarningCount(warnings: CitationWarning[] = CITATION_WARNINGS): number {
  return warnings.length;
}

export function getHighRiskCitationWarningCount(warnings: CitationWarning[] = CITATION_WARNINGS): number {
  return warnings.filter((warning) => warning.severity === "critical" || warning.severity === "high").length;
}

export function getCitationReadinessScore(warnings: CitationWarning[] = CITATION_WARNINGS): number {
  if (warnings.length === 0) return 100;
  const penalty = warnings.reduce((total, warning) => {
    if (warning.severity === "critical") return total + 30;
    if (warning.severity === "high") return total + 20;
    if (warning.severity === "medium") return total + 10;
    return total + 5;
  }, 0);
  return Math.max(0, 100 - penalty);
}
