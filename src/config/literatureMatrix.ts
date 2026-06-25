export type LiteratureSourceType = "journal" | "conference" | "thesis" | "report" | "system";
export type LiteratureRelevance = "low" | "medium" | "high";
export type LiteratureEvidenceStatus = "missing" | "partial" | "complete";

export type LiteratureMatrixEntry = {
  id: string;
  citation: string;
  year: string;
  sourceType: LiteratureSourceType;
  topic: string;
  method: string;
  datasetOrContext: string;
  keyFinding: string;
  limitation: string;
  gapContribution: string;
  relevance: LiteratureRelevance;
  evidenceStatus: LiteratureEvidenceStatus;
  tags: string[];
};

export const DEMO_LITERATURE_MATRIX: LiteratureMatrixEntry[] = [
  {
    id: "attendance-cv-2024",
    citation: "Computer vision attendance verification study",
    year: "2024",
    sourceType: "journal",
    topic: "Face recognition attendance",
    method: "CNN-based detection with classroom image samples",
    datasetOrContext: "University classroom attendance scenarios",
    keyFinding: "Automated verification can reduce manual attendance time and proxy attendance risk.",
    limitation: "Performance may drop with lighting changes, occlusion, and privacy constraints.",
    gapContribution: "Need a privacy-aware attendance flow with fallback verification and teacher controls.",
    relevance: "high",
    evidenceStatus: "complete",
    tags: ["AI", "Attendance", "Computer Vision"],
  },
  {
    id: "student-engagement-analytics",
    citation: "Learning analytics dashboard for student engagement",
    year: "2023",
    sourceType: "conference",
    topic: "Engagement analytics",
    method: "Dashboard evaluation with instructor feedback",
    datasetOrContext: "Higher education LMS and class activity data",
    keyFinding: "Instructor dashboards improve early identification of low engagement students.",
    limitation: "Dashboards often show metrics without clear intervention workflows.",
    gapContribution: "Combine attendance, engagement signals, and action recommendations in one workspace.",
    relevance: "high",
    evidenceStatus: "partial",
    tags: ["Analytics", "Education", "Dashboard"],
  },
  {
    id: "qr-attendance-system",
    citation: "QR-based attendance management system",
    year: "2022",
    sourceType: "system",
    topic: "QR attendance",
    method: "QR scan workflow with web-based records",
    datasetOrContext: "Classroom attendance records",
    keyFinding: "QR workflows are fast and easy to deploy for small institutions.",
    limitation: "QR codes can still be shared unless location/session checks are added.",
    gapContribution: "Use QR as fallback, not the only verification layer.",
    relevance: "medium",
    evidenceStatus: "complete",
    tags: ["QR", "Web App", "Fallback"],
  },
  {
    id: "privacy-biometric-education",
    citation: "Biometric data privacy in educational systems",
    year: "2021",
    sourceType: "report",
    topic: "Privacy and consent",
    method: "Policy review and risk analysis",
    datasetOrContext: "Educational biometric data handling",
    keyFinding: "Biometric systems require clear consent, limited retention, and safeguards.",
    limitation: "Policy work may not provide implementation-level technical patterns.",
    gapContribution: "Add consent, demo-safe labels, and non-biometric fallback options to project design.",
    relevance: "high",
    evidenceStatus: "partial",
    tags: ["Privacy", "Consent", "Risk"],
  },
  {
    id: "manual-attendance-limitations",
    citation: "Manual attendance process limitations in universities",
    year: "2020",
    sourceType: "thesis",
    topic: "Manual process inefficiency",
    method: "Survey and process observation",
    datasetOrContext: "University departments using paper-based attendance",
    keyFinding: "Manual attendance is time-consuming and prone to entry errors.",
    limitation: "Study context may be limited to one institution.",
    gapContribution: "Validate whether the same issue exists in the target university before final claims.",
    relevance: "medium",
    evidenceStatus: "missing",
    tags: ["Manual Process", "Survey", "Operations"],
  },
];

export function getLiteratureRelevanceClass(relevance: LiteratureRelevance): string {
  switch (relevance) {
    case "high":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function getLiteratureEvidenceClass(status: LiteratureEvidenceStatus): string {
  switch (status) {
    case "complete":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "partial":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-red-500/10 text-red-600 border-red-500/30";
  }
}

export function getLiteratureMatrixReadiness(entries: LiteratureMatrixEntry[] = DEMO_LITERATURE_MATRIX): number {
  if (entries.length === 0) return 0;
  const score = entries.reduce((total, entry) => {
    const relevanceScore = entry.relevance === "high" ? 35 : entry.relevance === "medium" ? 25 : 10;
    const evidenceScore = entry.evidenceStatus === "complete" ? 65 : entry.evidenceStatus === "partial" ? 35 : 0;
    return total + relevanceScore + evidenceScore;
  }, 0);
  return Math.round(score / entries.length);
}

export function getLiteratureMatrixGapCount(entries: LiteratureMatrixEntry[] = DEMO_LITERATURE_MATRIX): number {
  return entries.filter((entry) => entry.gapContribution.trim().length > 0).length;
}
