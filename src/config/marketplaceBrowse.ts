export type MarketplaceServiceCategory = "proposal" | "literature" | "methodology" | "editing" | "viva" | "analysis";
export type MarketplaceServiceLevel = "basic" | "standard" | "premium";
export type MarketplaceServiceStatus = "available" | "limited" | "review";

export type MarketplaceServiceListing = {
  id: string;
  title: string;
  researcherName: string;
  category: MarketplaceServiceCategory;
  level: MarketplaceServiceLevel;
  status: MarketplaceServiceStatus;
  rating: number;
  completedOrders: number;
  priceLabel: string;
  deliveryLabel: string;
  tags: string[];
  highlights: string[];
  bestFor: string;
};

export const MARKETPLACE_SEARCH_FILTERS = {
  query: "proposal methodology viva",
  category: "All categories",
  sortBy: "Best match",
  priceRange: "Demo pricing only",
};

export const MARKETPLACE_SERVICE_LISTINGS: MarketplaceServiceListing[] = [
  {
    id: "listing-proposal-review",
    title: "FYP Proposal Review and Improvement",
    researcherName: "Dr. Amina Research Studio",
    category: "proposal",
    level: "standard",
    status: "available",
    rating: 4.8,
    completedOrders: 38,
    priceLabel: "PKR 5,000 demo",
    deliveryLabel: "3 days",
    tags: ["proposal", "scope", "research gap"],
    highlights: ["Problem statement review", "Research gap feedback", "Methodology alignment checklist"],
    bestFor: "Students who already have a rough FYP proposal draft and need structured review notes.",
  },
  {
    id: "listing-literature-matrix",
    title: "Literature Review Matrix Builder",
    researcherName: "Academic Methods Lab",
    category: "literature",
    level: "premium",
    status: "limited",
    rating: 4.7,
    completedOrders: 24,
    priceLabel: "PKR 9,000 demo",
    deliveryLabel: "5 days",
    tags: ["literature", "matrix", "themes"],
    highlights: ["Source comparison grid", "Limitations extraction", "Gap candidate notes"],
    bestFor: "Teams that need a clean literature matrix before writing the review chapter.",
  },
  {
    id: "listing-methodology-plan",
    title: "Methodology and Validation Plan",
    researcherName: "Research Workflow Mentor",
    category: "methodology",
    level: "standard",
    status: "available",
    rating: 4.6,
    completedOrders: 19,
    priceLabel: "PKR 7,500 demo",
    deliveryLabel: "4 days",
    tags: ["methodology", "validation", "testing"],
    highlights: ["Objective-method map", "Validation table outline", "Limitations checklist"],
    bestFor: "Projects that need a defensible methodology and test plan before final report writing.",
  },
  {
    id: "listing-viva-prep",
    title: "Viva Question Bank and Practice Notes",
    researcherName: "Final Defense Coach",
    category: "viva",
    level: "basic",
    status: "available",
    rating: 4.5,
    completedOrders: 31,
    priceLabel: "PKR 3,500 demo",
    deliveryLabel: "2 days",
    tags: ["viva", "defense", "questions"],
    highlights: ["Question bank", "Short answer points", "Weak-area flags"],
    bestFor: "Students preparing for final project defense and supervisor questioning.",
  },
  {
    id: "listing-editing-polish",
    title: "Academic Editing and Formatting Polish",
    researcherName: "Documentation Polish Desk",
    category: "editing",
    level: "basic",
    status: "review",
    rating: 4.4,
    completedOrders: 42,
    priceLabel: "PKR 4,000 demo",
    deliveryLabel: "3 days",
    tags: ["editing", "format", "clarity"],
    highlights: ["Language polish", "Section flow review", "Formatting checklist"],
    bestFor: "Teams with complete drafts that need clarity and formatting review.",
  },
];

export function getMarketplaceCategoryLabel(category: MarketplaceServiceCategory): string {
  if (category === "proposal") return "Proposal";
  if (category === "literature") return "Literature";
  if (category === "methodology") return "Methodology";
  if (category === "editing") return "Editing";
  if (category === "viva") return "Viva";
  return "Analysis";
}

export function getMarketplaceLevelClass(level: MarketplaceServiceLevel): string {
  if (level === "premium") return "bg-primary/10 text-primary border-primary/30";
  if (level === "standard") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getMarketplaceStatusLabel(status: MarketplaceServiceStatus): string {
  if (status === "available") return "Available";
  if (status === "limited") return "Limited";
  return "Under Review";
}

export function getMarketplaceStatusClass(status: MarketplaceServiceStatus): string {
  if (status === "available") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "limited") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getMarketplaceCounts(listings: MarketplaceServiceListing[] = MARKETPLACE_SERVICE_LISTINGS) {
  return {
    total: listings.length,
    available: listings.filter((listing) => listing.status === "available").length,
    premium: listings.filter((listing) => listing.level === "premium").length,
    review: listings.filter((listing) => listing.status === "review").length,
  };
}
