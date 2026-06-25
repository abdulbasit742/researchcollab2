export type ResearcherServiceStatus = "draft" | "review" | "published" | "paused";
export type ResearcherVerificationLevel = "unverified" | "basic" | "verified" | "expert";
export type ResearchServiceCategory = "proposal" | "literature" | "methodology" | "analysis" | "editing" | "viva";

export type ResearcherServicePackage = {
  id: string;
  name: string;
  priceLabel: string;
  deliveryLabel: string;
  includes: string[];
};

export type ResearcherServiceProfile = {
  id: string;
  name: string;
  title: string;
  status: ResearcherServiceStatus;
  verification: ResearcherVerificationLevel;
  rating: number;
  completedOrders: number;
  responseTimeLabel: string;
  categories: ResearchServiceCategory[];
  expertise: string[];
  portfolioSignals: string[];
  packages: ResearcherServicePackage[];
  profileReadiness: number;
  reviewNote: string;
};

export const DEMO_RESEARCHER_SERVICE_PROFILE: ResearcherServiceProfile = {
  id: "researcher-demo-profile",
  name: "Dr. Amina Research Studio",
  title: "FYP, proposal, methodology and research documentation support",
  status: "review",
  verification: "verified",
  rating: 4.8,
  completedOrders: 38,
  responseTimeLabel: "Usually replies within 4 hours",
  categories: ["proposal", "literature", "methodology", "editing", "viva"],
  expertise: ["Research proposal structure", "Literature review matrix", "Methodology planning", "Academic editing", "Viva preparation"],
  portfolioSignals: ["12 proposal reviews completed", "8 methodology plans reviewed", "6 viva prep packs delivered", "Verified education profile"],
  profileReadiness: 82,
  reviewNote: "Profile is ready for marketplace preview but pricing, policy labels, and real portfolio files should be reviewed before public launch.",
  packages: [
    {
      id: "basic-review",
      name: "Basic Review",
      priceLabel: "Demo price: PKR 3,000",
      deliveryLabel: "2 days",
      includes: ["Problem statement review", "Scope clarity notes", "One revision checklist"],
    },
    {
      id: "standard-proposal",
      name: "Standard Proposal Support",
      priceLabel: "Demo price: PKR 8,000",
      deliveryLabel: "5 days",
      includes: ["Proposal outline", "Literature gap notes", "Methodology improvement plan", "Two review passes"],
    },
    {
      id: "premium-fyp-pack",
      name: "Premium FYP Prep Pack",
      priceLabel: "Demo price: PKR 15,000",
      deliveryLabel: "7 days",
      includes: ["Report structure review", "Methodology and validation notes", "Viva question prep", "Final readiness checklist"],
    },
  ],
};

export function getResearcherServiceStatusLabel(status: ResearcherServiceStatus): string {
  if (status === "published") return "Published";
  if (status === "review") return "In Review";
  if (status === "paused") return "Paused";
  return "Draft";
}

export function getResearcherServiceStatusClass(status: ResearcherServiceStatus): string {
  if (status === "published") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "paused") return "bg-muted text-muted-foreground border-border";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getResearcherVerificationLabel(level: ResearcherVerificationLevel): string {
  if (level === "expert") return "Expert Verified";
  if (level === "verified") return "Verified";
  if (level === "basic") return "Basic Check";
  return "Unverified";
}

export function getResearcherVerificationClass(level: ResearcherVerificationLevel): string {
  if (level === "expert") return "bg-primary/10 text-primary border-primary/30";
  if (level === "verified") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (level === "basic") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-red-500/10 text-red-600 border-red-500/30";
}

export function getResearchServiceCategoryLabel(category: ResearchServiceCategory): string {
  if (category === "proposal") return "Proposal";
  if (category === "literature") return "Literature Review";
  if (category === "methodology") return "Methodology";
  if (category === "analysis") return "Analysis";
  if (category === "editing") return "Editing";
  return "Viva Prep";
}
