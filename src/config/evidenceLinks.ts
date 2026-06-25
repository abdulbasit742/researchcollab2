export type EvidenceType = "screenshot" | "dataset" | "test_result" | "reference" | "document" | "demo_video";
export type EvidenceArea = "final_report" | "proposal" | "literature_review" | "methodology" | "implementation";
export type EvidenceLinkStatus = "missing" | "linked" | "review_needed" | "approved";

export type EvidenceLink = {
  id: string;
  area: EvidenceArea;
  areaLabel: string;
  sectionTitle: string;
  evidenceType: EvidenceType;
  status: EvidenceLinkStatus;
  claimOrRequirement: string;
  evidenceLabel: string;
  owner: string;
  nextAction: string;
};

export const EVIDENCE_LINKS: EvidenceLink[] = [
  {
    id: "evidence-intro-problem",
    area: "final_report",
    areaLabel: "Final Report",
    sectionTitle: "Introduction",
    evidenceType: "reference",
    status: "review_needed",
    claimOrRequirement: "Manual attendance is time-consuming and prone to proxy attendance.",
    evidenceLabel: "Manual attendance limitations study + local problem notes",
    owner: "Report Lead",
    nextAction: "Verify source quality and link the final citation before submission.",
  },
  {
    id: "evidence-lit-matrix",
    area: "literature_review",
    areaLabel: "Literature Review",
    sectionTitle: "Existing Systems Comparison",
    evidenceType: "document",
    status: "linked",
    claimOrRequirement: "Related systems comparison must support the project gap.",
    evidenceLabel: "Literature matrix comparison table",
    owner: "Research Team",
    nextAction: "Add supervisor-approved comparison criteria and final citation style.",
  },
  {
    id: "evidence-method-architecture",
    area: "methodology",
    areaLabel: "Methodology",
    sectionTitle: "Architecture & Workflow",
    evidenceType: "screenshot",
    status: "missing",
    claimOrRequirement: "System design section needs architecture and workflow diagrams.",
    evidenceLabel: "Architecture diagram screenshot",
    owner: "Technical Lead",
    nextAction: "Upload architecture/workflow evidence and link it to methodology section.",
  },
  {
    id: "evidence-test-results",
    area: "methodology",
    areaLabel: "Methodology",
    sectionTitle: "Testing, Validation & Evaluation",
    evidenceType: "test_result",
    status: "missing",
    claimOrRequirement: "Validation section needs test cases, expected results, and observed results.",
    evidenceLabel: "Validation test table",
    owner: "QA Owner",
    nextAction: "Create test case table and attach screenshots/results for each objective.",
  },
  {
    id: "evidence-demo-output",
    area: "implementation",
    areaLabel: "Implementation",
    sectionTitle: "Prototype Demo Evidence",
    evidenceType: "demo_video",
    status: "review_needed",
    claimOrRequirement: "Final demo should prove the core workflow works end-to-end.",
    evidenceLabel: "Prototype walkthrough video",
    owner: "Student Team",
    nextAction: "Review demo video quality and link it to final report implementation section.",
  },
  {
    id: "evidence-proposal-ethics",
    area: "proposal",
    areaLabel: "Proposal",
    sectionTitle: "Ethics, Data & Risk Plan",
    evidenceType: "document",
    status: "missing",
    claimOrRequirement: "Ethics section needs consent/privacy/data retention notes.",
    evidenceLabel: "Ethics and data handling note",
    owner: "Research Lead",
    nextAction: "Draft ethics evidence note and mark privacy safeguards before review.",
  },
  {
    id: "evidence-tools-setup",
    area: "methodology",
    areaLabel: "Methodology",
    sectionTitle: "Tools, Technology & Setup",
    evidenceType: "document",
    status: "approved",
    claimOrRequirement: "Setup should be reproducible by another team member.",
    evidenceLabel: "Tech stack and setup checklist",
    owner: "Technical Lead",
    nextAction: "Keep setup version notes synced with final report appendix.",
  },
];

export function getEvidenceTypeLabel(type: EvidenceType): string {
  switch (type) {
    case "screenshot":
      return "Screenshot";
    case "dataset":
      return "Dataset";
    case "test_result":
      return "Test Result";
    case "reference":
      return "Reference";
    case "demo_video":
      return "Demo Video";
    default:
      return "Document";
  }
}

export function getEvidenceStatusLabel(status: EvidenceLinkStatus): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "linked":
      return "Linked";
    case "review_needed":
      return "Review Needed";
    default:
      return "Missing";
  }
}

export function getEvidenceStatusClass(status: EvidenceLinkStatus): string {
  switch (status) {
    case "approved":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "linked":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "review_needed":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-red-500/10 text-red-600 border-red-500/30";
  }
}

export function getEvidenceLinkReadiness(links: EvidenceLink[] = EVIDENCE_LINKS): number {
  if (links.length === 0) return 100;
  const score = links.reduce((total, link) => {
    if (link.status === "approved") return total + 100;
    if (link.status === "linked") return total + 75;
    if (link.status === "review_needed") return total + 45;
    return total;
  }, 0);
  return Math.round(score / links.length);
}

export function getEvidenceLinkCounts(links: EvidenceLink[] = EVIDENCE_LINKS) {
  return {
    approved: links.filter((link) => link.status === "approved").length,
    linked: links.filter((link) => link.status === "linked").length,
    reviewNeeded: links.filter((link) => link.status === "review_needed").length,
    missing: links.filter((link) => link.status === "missing").length,
  };
}
