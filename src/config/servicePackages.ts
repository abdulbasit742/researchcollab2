export type ServicePackageTier = "basic" | "standard" | "premium";
export type ServicePackageStatus = "draft" | "active" | "review";

export type ServicePackageFeature = {
  id: string;
  label: string;
  included: boolean;
};

export type ServicePackageDefinition = {
  id: string;
  tier: ServicePackageTier;
  status: ServicePackageStatus;
  name: string;
  subtitle: string;
  priceLabel: string;
  deliveryLabel: string;
  revisionLabel: string;
  bestFor: string;
  deliverables: string[];
  buyerRequirements: string[];
  features: ServicePackageFeature[];
};

export const SERVICE_PACKAGE_DEFINITIONS: ServicePackageDefinition[] = [
  {
    id: "package-basic",
    tier: "basic",
    status: "active",
    name: "Basic",
    subtitle: "Quick review for one focused document section",
    priceLabel: "PKR 3,000 demo",
    deliveryLabel: "2 days",
    revisionLabel: "1 light revision",
    bestFor: "Students who need quick feedback on a problem statement, scope note, or short proposal section.",
    deliverables: ["One section review", "Clarity notes", "Scope issue flags", "Short improvement checklist"],
    buyerRequirements: ["Document section", "Project title", "Supervisor instructions if available"],
    features: [
      { id: "basic-section-review", label: "Single section review", included: true },
      { id: "basic-methodology", label: "Methodology map", included: false },
      { id: "basic-viva", label: "Viva practice notes", included: false },
      { id: "basic-final-summary", label: "Final readiness summary", included: false },
    ],
  },
  {
    id: "package-standard",
    tier: "standard",
    status: "active",
    name: "Standard",
    subtitle: "Complete proposal support with method and gap feedback",
    priceLabel: "PKR 8,000 demo",
    deliveryLabel: "5 days",
    revisionLabel: "2 revisions",
    bestFor: "Teams preparing a supervisor-ready proposal with literature gap and methodology alignment notes.",
    deliverables: ["Proposal outline review", "Research gap notes", "Methodology alignment checklist", "Supervisor-ready improvement summary"],
    buyerRequirements: ["Proposal draft", "Research topic", "Any required university format", "Reference list if available"],
    features: [
      { id: "standard-section-review", label: "Multi-section review", included: true },
      { id: "standard-methodology", label: "Methodology map", included: true },
      { id: "standard-viva", label: "Viva practice notes", included: false },
      { id: "standard-final-summary", label: "Final readiness summary", included: true },
    ],
  },
  {
    id: "package-premium",
    tier: "premium",
    status: "review",
    name: "Premium",
    subtitle: "Full FYP preparation pack with report, validation and viva readiness",
    priceLabel: "PKR 15,000 demo",
    deliveryLabel: "7 days",
    revisionLabel: "3 revisions",
    bestFor: "Final-year teams that need structured report support, validation planning, and defense preparation notes.",
    deliverables: ["Report structure review", "Methodology and validation plan", "Citation and evidence checklist", "Viva question bank", "Final readiness scorecard"],
    buyerRequirements: ["Report draft", "Proposal", "Screenshots or proof files", "Supervisor feedback", "Defense date if known"],
    features: [
      { id: "premium-section-review", label: "Full report review", included: true },
      { id: "premium-methodology", label: "Methodology map", included: true },
      { id: "premium-viva", label: "Viva practice notes", included: true },
      { id: "premium-final-summary", label: "Final readiness summary", included: true },
    ],
  },
];

export function getServicePackageTierLabel(tier: ServicePackageTier): string {
  if (tier === "premium") return "Premium";
  if (tier === "standard") return "Standard";
  return "Basic";
}

export function getServicePackageTierClass(tier: ServicePackageTier): string {
  if (tier === "premium") return "bg-primary/10 text-primary border-primary/30";
  if (tier === "standard") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  return "bg-muted text-muted-foreground border-border";
}

export function getServicePackageStatusLabel(status: ServicePackageStatus): string {
  if (status === "active") return "Active";
  if (status === "review") return "Needs Review";
  return "Draft";
}

export function getServicePackageStatusClass(status: ServicePackageStatus): string {
  if (status === "active") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getServicePackageCounts(packages: ServicePackageDefinition[] = SERVICE_PACKAGE_DEFINITIONS) {
  return {
    total: packages.length,
    active: packages.filter((servicePackage) => servicePackage.status === "active").length,
    review: packages.filter((servicePackage) => servicePackage.status === "review").length,
    totalDeliverables: packages.reduce((total, servicePackage) => total + servicePackage.deliverables.length, 0),
  };
}
