// Plan catalog — single source of truth for pricing & feature gates.
// Demo mode: no real payments wired.

export type PlanId = "free" | "student_pro" | "researcher_pro" | "supervisor" | "department" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number; // PKR
  priceYearly: number;
  currency: string;
  popular?: boolean;
  audience: string;
  features: string[];
  limits: {
    projects: number; // -1 = unlimited
    aiCredits: number;
    reportExports: number;
    marketplaceServices: number;
    storageGb: number;
    departmentUsers: number;
  };
  cta: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Start your research journey",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "PKR",
    audience: "Individual students exploring the platform",
    features: [
      "1 active project",
      "Limited AI roadmap (3 runs/mo)",
      "Basic report outline",
      "Limited templates",
      "Community support",
    ],
    limits: { projects: 1, aiCredits: 50, reportExports: 0, marketplaceServices: 0, storageGb: 1, departmentUsers: 0 },
    cta: "Get started",
  },
  {
    id: "student_pro",
    name: "Student Pro",
    tagline: "Everything to finish your FYP",
    priceMonthly: 1500,
    priceYearly: 14400,
    currency: "PKR",
    popular: true,
    audience: "Undergraduate & MS students",
    features: [
      "Unlimited projects",
      "Full AI roadmap & gap finder",
      "Report builder + export",
      "Viva preparation suite",
      "Portfolio publishing (custom URL)",
      "1,500 AI credits/mo",
    ],
    limits: { projects: -1, aiCredits: 1500, reportExports: 20, marketplaceServices: 0, storageGb: 20, departmentUsers: 0 },
    cta: "Upgrade to Pro",
  },
  {
    id: "researcher_pro",
    name: "Researcher Pro",
    tagline: "Monetize your expertise",
    priceMonthly: 3500,
    priceYearly: 33600,
    currency: "PKR",
    audience: "Researchers, PhDs, mentors",
    features: [
      "Publish marketplace services",
      "Profile boost & verified badge",
      "Earnings dashboard + payouts",
      "Skill badges",
      "Advanced analytics",
      "3,000 AI credits/mo",
    ],
    limits: { projects: -1, aiCredits: 3000, reportExports: 50, marketplaceServices: 20, storageGb: 50, departmentUsers: 0 },
    cta: "Start earning",
  },
  {
    id: "supervisor",
    name: "Supervisor",
    tagline: "Manage your cohort",
    priceMonthly: 4500,
    priceYearly: 43200,
    currency: "PKR",
    audience: "FYP supervisors & co-supervisors",
    features: [
      "Review dashboard",
      "Student progress tracking",
      "Rubric scoring",
      "Comment management",
      "Defense scheduling assist",
    ],
    limits: { projects: -1, aiCredits: 2000, reportExports: 30, marketplaceServices: 0, storageGb: 30, departmentUsers: 30 },
    cta: "Get Supervisor",
  },
  {
    id: "department",
    name: "Department",
    tagline: "Run your entire FYP program",
    priceMonthly: 45000,
    priceYearly: 432000,
    currency: "PKR",
    audience: "Universities & departments",
    features: [
      "FYP batch management",
      "Supervisor allocation engine",
      "Defense scheduling",
      "Evaluation exports",
      "Department analytics",
      "Bulk student import",
      "Shared 25,000 AI credit pool",
    ],
    limits: { projects: -1, aiCredits: 25000, reportExports: -1, marketplaceServices: -1, storageGb: 500, departmentUsers: 500 },
    cta: "Request demo",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom for institutions",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "PKR",
    audience: "Multi-campus & ministries",
    features: [
      "White-label portal",
      "Custom workflows",
      "API access",
      "Bulk import & SSO",
      "Advanced compliance",
      "Dedicated CSM",
    ],
    limits: { projects: -1, aiCredits: -1, reportExports: -1, marketplaceServices: -1, storageGb: -1, departmentUsers: -1 },
    cta: "Talk to sales",
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

// Marketplace commission table (researcher pays from gross)
export const COMMISSION_RATE: Record<PlanId, number> = {
  free: 0.15,
  student_pro: 0.12,
  researcher_pro: 0.10,
  supervisor: 0.10,
  department: 0.08,
  enterprise: 0.06,
};

export function calcCommission(gross: number, plan: PlanId = "researcher_pro") {
  const rate = COMMISSION_RATE[plan];
  const fee = Math.round(gross * rate);
  return { gross, fee, rate, net: gross - fee };
}
