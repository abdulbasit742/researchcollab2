// Affiliate System Data

export type AffiliateRole = "student" | "researcher" | "partner";
export type AffiliateStatus = "active" | "pending" | "suspended" | "blocked";
export type CommissionStatus = "pending" | "approved" | "released" | "reversed";

export interface Affiliate {
  id: string;
  userId: string;
  userName: string;
  role: AffiliateRole;
  status: AffiliateStatus;
  referralCode: string;
  createdAt: string;
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  pendingCommission: number;
  availableCommission: number;
  withdrawnCommission: number;
  lifetimeEarnings: number;
  customCommissionRate?: number; // Admin override
}

export interface ReferralClick {
  id: string;
  referralCode: string;
  affiliateId: string;
  source: "tool" | "offer" | "general" | "bundle";
  sourceId?: string;
  clickedAt: string;
  ipHash?: string;
  userAgent?: string;
  convertedToSignup: boolean;
  signupUserId?: string;
}

export interface ReferralConversion {
  id: string;
  affiliateId: string;
  referralCode: string;
  referredUserId: string;
  transactionType: "tool_subscription" | "tool_bundle" | "offer_purchase" | "service";
  transactionId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  createdAt: string;
  approvedAt?: string;
  releasedAt?: string;
  reversedAt?: string;
  reversalReason?: string;
}

export interface CommissionRule {
  id: string;
  category: "tools" | "bundles" | "offers" | "services";
  name: string;
  commissionRate: number;
  firstPurchaseBonus: number;
  minPayout: number;
  attributionWindowDays: number;
  isActive: boolean;
}

export interface PromoAsset {
  id: string;
  toolId?: string;
  type: "text" | "banner" | "cta";
  title: string;
  content: string;
  ctaText?: string;
  bannerUrl?: string;
  isActive: boolean;
}

export interface AffiliateTransaction {
  id: string;
  affiliateId: string;
  type: "commission_tool" | "commission_offer" | "commission_bundle" | "reversal" | "withdrawal" | "bonus";
  amount: number;
  description: string;
  relatedConversionId?: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

// Generate referral code
export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Commission rules (admin-controlled)
export const commissionRules: CommissionRule[] = [
  {
    id: "rule-tools",
    category: "tools",
    name: "Tool Subscriptions",
    commissionRate: 15,
    firstPurchaseBonus: 5,
    minPayout: 10,
    attributionWindowDays: 30,
    isActive: true,
  },
  {
    id: "rule-bundles",
    category: "bundles",
    name: "Tool Bundles",
    commissionRate: 20,
    firstPurchaseBonus: 10,
    minPayout: 10,
    attributionWindowDays: 30,
    isActive: true,
  },
  {
    id: "rule-offers",
    category: "offers",
    name: "Offers / Services",
    commissionRate: 8,
    firstPurchaseBonus: 0,
    minPayout: 20,
    attributionWindowDays: 14,
    isActive: true,
  },
  {
    id: "rule-services",
    category: "services",
    name: "FYP & Research Services",
    commissionRate: 10,
    firstPurchaseBonus: 0,
    minPayout: 25,
    attributionWindowDays: 14,
    isActive: true,
  },
];

// Dummy affiliates
export const dummyAffiliates: Affiliate[] = [
  {
    id: "aff-1",
    userId: "s1",
    userName: "Alex Chen",
    role: "student",
    status: "active",
    referralCode: "ALEX2024",
    createdAt: "2024-01-10",
    totalClicks: 450,
    totalSignups: 45,
    totalConversions: 28,
    pendingCommission: 85.50,
    availableCommission: 324.00,
    withdrawnCommission: 150.00,
    lifetimeEarnings: 559.50,
  },
  {
    id: "aff-2",
    userId: "s2",
    userName: "Maria Santos",
    role: "student",
    status: "active",
    referralCode: "MARIA2024",
    createdAt: "2024-01-15",
    totalClicks: 320,
    totalSignups: 32,
    totalConversions: 18,
    pendingCommission: 42.00,
    availableCommission: 186.00,
    withdrawnCommission: 100.00,
    lifetimeEarnings: 328.00,
  },
  {
    id: "aff-3",
    userId: "r1",
    userName: "Dr. Sarah Chen",
    role: "researcher",
    status: "active",
    referralCode: "DRSARAH",
    createdAt: "2024-01-05",
    totalClicks: 680,
    totalSignups: 68,
    totalConversions: 42,
    pendingCommission: 125.00,
    availableCommission: 520.00,
    withdrawnCommission: 400.00,
    lifetimeEarnings: 1045.00,
    customCommissionRate: 18, // Special rate for top performer
  },
  {
    id: "aff-4",
    userId: "s3",
    userName: "James Park",
    role: "student",
    status: "active",
    referralCode: "JAMES123",
    createdAt: "2024-02-01",
    totalClicks: 180,
    totalSignups: 15,
    totalConversions: 8,
    pendingCommission: 24.00,
    availableCommission: 96.00,
    withdrawnCommission: 0,
    lifetimeEarnings: 120.00,
  },
  {
    id: "aff-5",
    userId: "partner-1",
    userName: "TechEd Academy",
    role: "partner",
    status: "active",
    referralCode: "TECHED",
    createdAt: "2024-01-20",
    totalClicks: 1250,
    totalSignups: 125,
    totalConversions: 85,
    pendingCommission: 340.00,
    availableCommission: 1280.00,
    withdrawnCommission: 800.00,
    lifetimeEarnings: 2420.00,
    customCommissionRate: 22, // Partner rate
  },
  {
    id: "aff-6",
    userId: "s5",
    userName: "Ahmed Hassan",
    role: "student",
    status: "active",
    referralCode: "AHMED2024",
    createdAt: "2024-02-10",
    totalClicks: 95,
    totalSignups: 8,
    totalConversions: 4,
    pendingCommission: 12.00,
    availableCommission: 48.00,
    withdrawnCommission: 0,
    lifetimeEarnings: 60.00,
  },
  {
    id: "aff-7",
    userId: "r5",
    userName: "Dr. Anna Schmidt",
    role: "researcher",
    status: "active",
    referralCode: "DRANNA",
    createdAt: "2024-01-25",
    totalClicks: 420,
    totalSignups: 38,
    totalConversions: 22,
    pendingCommission: 66.00,
    availableCommission: 264.00,
    withdrawnCommission: 150.00,
    lifetimeEarnings: 480.00,
  },
  {
    id: "aff-8",
    userId: "s7",
    userName: "Priya Sharma",
    role: "student",
    status: "pending",
    referralCode: "PRIYA123",
    createdAt: "2024-02-15",
    totalClicks: 45,
    totalSignups: 3,
    totalConversions: 1,
    pendingCommission: 8.50,
    availableCommission: 0,
    withdrawnCommission: 0,
    lifetimeEarnings: 8.50,
  },
  {
    id: "aff-9",
    userId: "partner-2",
    userName: "Research Hub Network",
    role: "partner",
    status: "pending",
    referralCode: "RESHUB",
    createdAt: "2024-02-18",
    totalClicks: 0,
    totalSignups: 0,
    totalConversions: 0,
    pendingCommission: 0,
    availableCommission: 0,
    withdrawnCommission: 0,
    lifetimeEarnings: 0,
  },
  {
    id: "aff-10",
    userId: "s11",
    userName: "David Okonkwo",
    role: "student",
    status: "suspended",
    referralCode: "DAVID2024",
    createdAt: "2024-01-30",
    totalClicks: 850,
    totalSignups: 12,
    totalConversions: 2,
    pendingCommission: 0,
    availableCommission: 24.00,
    withdrawnCommission: 0,
    lifetimeEarnings: 24.00,
  },
];

// Generate clicks across affiliates (200 total)
export const dummyReferralClicks: ReferralClick[] = [
  // Sample clicks - in reality would be 200
  ...Array.from({ length: 50 }, (_, i) => ({
    id: `click-${i + 1}`,
    referralCode: ["ALEX2024", "MARIA2024", "DRSARAH", "TECHED", "JAMES123"][i % 5],
    affiliateId: ["aff-1", "aff-2", "aff-3", "aff-5", "aff-4"][i % 5],
    source: (["tool", "offer", "general", "bundle"] as const)[i % 4],
    sourceId: i % 4 === 0 ? "chatgpt" : i % 4 === 1 ? "offer-1" : undefined,
    clickedAt: new Date(2024, 1, Math.floor(i / 3) + 1, Math.floor(Math.random() * 24)).toISOString(),
    convertedToSignup: i % 5 === 0,
    signupUserId: i % 5 === 0 ? `referred-user-${i}` : undefined,
  })),
];

// Conversions (25 total)
export const dummyConversions: ReferralConversion[] = [
  {
    id: "conv-1",
    affiliateId: "aff-1",
    referralCode: "ALEX2024",
    referredUserId: "user-ref-1",
    transactionType: "tool_subscription",
    transactionId: "order-ref-1",
    grossAmount: 29,
    commissionRate: 15,
    commissionAmount: 4.35,
    status: "released",
    createdAt: "2024-02-01T10:00:00",
    approvedAt: "2024-02-02T10:00:00",
    releasedAt: "2024-02-03T10:00:00",
  },
  {
    id: "conv-2",
    affiliateId: "aff-1",
    referralCode: "ALEX2024",
    referredUserId: "user-ref-2",
    transactionType: "tool_bundle",
    transactionId: "order-ref-2",
    grossAmount: 59,
    commissionRate: 20,
    commissionAmount: 11.80,
    status: "released",
    createdAt: "2024-02-03T14:00:00",
    approvedAt: "2024-02-04T10:00:00",
    releasedAt: "2024-02-05T10:00:00",
  },
  {
    id: "conv-3",
    affiliateId: "aff-3",
    referralCode: "DRSARAH",
    referredUserId: "user-ref-3",
    transactionType: "tool_subscription",
    transactionId: "order-ref-3",
    grossAmount: 34,
    commissionRate: 18,
    commissionAmount: 6.12,
    status: "approved",
    createdAt: "2024-02-05T09:00:00",
    approvedAt: "2024-02-06T10:00:00",
  },
  {
    id: "conv-4",
    affiliateId: "aff-5",
    referralCode: "TECHED",
    referredUserId: "user-ref-4",
    transactionType: "tool_bundle",
    transactionId: "order-ref-4",
    grossAmount: 99,
    commissionRate: 22,
    commissionAmount: 21.78,
    status: "released",
    createdAt: "2024-02-06T11:00:00",
    approvedAt: "2024-02-07T10:00:00",
    releasedAt: "2024-02-08T10:00:00",
  },
  {
    id: "conv-5",
    affiliateId: "aff-2",
    referralCode: "MARIA2024",
    referredUserId: "user-ref-5",
    transactionType: "offer_purchase",
    transactionId: "offer-ref-1",
    grossAmount: 200,
    commissionRate: 8,
    commissionAmount: 16.00,
    status: "pending",
    createdAt: "2024-02-10T15:00:00",
  },
  {
    id: "conv-6",
    affiliateId: "aff-1",
    referralCode: "ALEX2024",
    referredUserId: "user-ref-6",
    transactionType: "tool_subscription",
    transactionId: "order-ref-6",
    grossAmount: 24,
    commissionRate: 15,
    commissionAmount: 3.60,
    status: "reversed",
    createdAt: "2024-02-08T10:00:00",
    approvedAt: "2024-02-09T10:00:00",
    reversedAt: "2024-02-12T10:00:00",
    reversalReason: "Customer refunded",
  },
  {
    id: "conv-7",
    affiliateId: "aff-5",
    referralCode: "TECHED",
    referredUserId: "user-ref-7",
    transactionType: "tool_subscription",
    transactionId: "order-ref-7",
    grossAmount: 32,
    commissionRate: 22,
    commissionAmount: 7.04,
    status: "approved",
    createdAt: "2024-02-11T09:00:00",
    approvedAt: "2024-02-12T10:00:00",
  },
  {
    id: "conv-8",
    affiliateId: "aff-7",
    referralCode: "DRANNA",
    referredUserId: "user-ref-8",
    transactionType: "tool_bundle",
    transactionId: "order-ref-8",
    grossAmount: 65,
    commissionRate: 20,
    commissionAmount: 13.00,
    status: "released",
    createdAt: "2024-02-09T14:00:00",
    approvedAt: "2024-02-10T10:00:00",
    releasedAt: "2024-02-11T10:00:00",
  },
  {
    id: "conv-9",
    affiliateId: "aff-3",
    referralCode: "DRSARAH",
    referredUserId: "user-ref-9",
    transactionType: "service",
    transactionId: "service-ref-1",
    grossAmount: 150,
    commissionRate: 10,
    commissionAmount: 15.00,
    status: "pending",
    createdAt: "2024-02-13T11:00:00",
  },
  {
    id: "conv-10",
    affiliateId: "aff-4",
    referralCode: "JAMES123",
    referredUserId: "user-ref-10",
    transactionType: "tool_subscription",
    transactionId: "order-ref-10",
    grossAmount: 29,
    commissionRate: 15,
    commissionAmount: 4.35,
    status: "released",
    createdAt: "2024-02-07T16:00:00",
    approvedAt: "2024-02-08T10:00:00",
    releasedAt: "2024-02-09T10:00:00",
  },
  {
    id: "conv-11",
    affiliateId: "aff-10",
    referralCode: "DAVID2024",
    referredUserId: "user-ref-11",
    transactionType: "tool_subscription",
    transactionId: "order-ref-11",
    grossAmount: 19,
    commissionRate: 15,
    commissionAmount: 2.85,
    status: "reversed",
    createdAt: "2024-02-04T10:00:00",
    approvedAt: "2024-02-05T10:00:00",
    reversedAt: "2024-02-10T10:00:00",
    reversalReason: "Fraudulent activity detected",
  },
  {
    id: "conv-12",
    affiliateId: "aff-10",
    referralCode: "DAVID2024",
    referredUserId: "user-ref-12",
    transactionType: "tool_subscription",
    transactionId: "order-ref-12",
    grossAmount: 15,
    commissionRate: 15,
    commissionAmount: 2.25,
    status: "reversed",
    createdAt: "2024-02-05T10:00:00",
    approvedAt: "2024-02-06T10:00:00",
    reversedAt: "2024-02-10T10:00:00",
    reversalReason: "Fraudulent activity detected",
  },
  // Add more conversions to reach 25
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `conv-${i + 13}`,
    affiliateId: ["aff-1", "aff-2", "aff-3", "aff-5", "aff-7"][i % 5],
    referralCode: ["ALEX2024", "MARIA2024", "DRSARAH", "TECHED", "DRANNA"][i % 5],
    referredUserId: `user-ref-${i + 13}`,
    transactionType: (["tool_subscription", "tool_bundle", "offer_purchase"] as const)[i % 3],
    transactionId: `order-ref-${i + 13}`,
    grossAmount: [29, 59, 150][i % 3],
    commissionRate: [15, 20, 8][i % 3],
    commissionAmount: [4.35, 11.80, 12.00][i % 3],
    status: (["released", "approved", "pending"] as const)[i % 3],
    createdAt: new Date(2024, 1, Math.floor(i / 2) + 1).toISOString(),
    approvedAt: i % 3 !== 2 ? new Date(2024, 1, Math.floor(i / 2) + 2).toISOString() : undefined,
    releasedAt: i % 3 === 0 ? new Date(2024, 1, Math.floor(i / 2) + 3).toISOString() : undefined,
  })),
];

// Promo assets
export const promoAssets: PromoAsset[] = [
  {
    id: "promo-1",
    type: "text",
    title: "ChatGPT 5.3 Promo",
    content: "Unlock the power of AI for your research! Get ChatGPT 5.3 at 40% off with my referral link. Perfect for academic writing, data analysis, and more.",
    ctaText: "Get 40% Off Now",
    isActive: true,
  },
  {
    id: "promo-2",
    toolId: "perplexity",
    type: "text",
    title: "Perplexity Pro Promo",
    content: "Research smarter, not harder! Perplexity Pro gives you AI-powered search with real citations. Save 38% with my exclusive link.",
    ctaText: "Start Researching",
    isActive: true,
  },
  {
    id: "promo-3",
    type: "text",
    title: "Research Starter Bundle",
    content: "Starting your research journey? Get the Research Starter Bundle - 3 essential AI tools at one low price. 34% off with my referral!",
    ctaText: "Get the Bundle",
    isActive: true,
  },
  {
    id: "promo-4",
    type: "cta",
    title: "General Platform CTA",
    content: "Join the #1 platform for research collaboration and AI tools. Sign up with my link for exclusive perks!",
    ctaText: "Join Free",
    isActive: true,
  },
  {
    id: "promo-5",
    toolId: "claude",
    type: "text",
    title: "Claude 4 Opus Promo",
    content: "Need thoughtful analysis for your papers? Claude 4 Opus is the AI assistant researchers trust. 35% off with my link!",
    ctaText: "Try Claude",
    isActive: true,
  },
];

// Affiliate transactions
export const affiliateTransactions: AffiliateTransaction[] = [
  {
    id: "aff-txn-1",
    affiliateId: "aff-1",
    type: "commission_tool",
    amount: 4.35,
    description: "Commission: ChatGPT 5.3 subscription (user-ref-1)",
    relatedConversionId: "conv-1",
    status: "completed",
    createdAt: "2024-02-03T10:00:00",
  },
  {
    id: "aff-txn-2",
    affiliateId: "aff-1",
    type: "commission_bundle",
    amount: 11.80,
    description: "Commission: Publication Ready Bundle (user-ref-2)",
    relatedConversionId: "conv-2",
    status: "completed",
    createdAt: "2024-02-05T10:00:00",
  },
  {
    id: "aff-txn-3",
    affiliateId: "aff-3",
    type: "commission_tool",
    amount: 6.12,
    description: "Commission: Gemini 4 Ultra subscription (user-ref-3)",
    relatedConversionId: "conv-3",
    status: "pending",
    createdAt: "2024-02-06T10:00:00",
  },
  {
    id: "aff-txn-4",
    affiliateId: "aff-5",
    type: "commission_bundle",
    amount: 21.78,
    description: "Commission: Complete Research Suite (user-ref-4)",
    relatedConversionId: "conv-4",
    status: "completed",
    createdAt: "2024-02-08T10:00:00",
  },
  {
    id: "aff-txn-5",
    affiliateId: "aff-1",
    type: "reversal",
    amount: -3.60,
    description: "Reversal: Customer refunded (order-ref-6)",
    relatedConversionId: "conv-6",
    status: "completed",
    createdAt: "2024-02-12T10:00:00",
  },
  {
    id: "aff-txn-6",
    affiliateId: "aff-1",
    type: "withdrawal",
    amount: -150.00,
    description: "Withdrawal to bank account",
    status: "completed",
    createdAt: "2024-02-15T14:00:00",
  },
  {
    id: "aff-txn-7",
    affiliateId: "aff-3",
    type: "withdrawal",
    amount: -400.00,
    description: "Withdrawal to PayPal",
    status: "completed",
    createdAt: "2024-02-10T09:00:00",
  },
  {
    id: "aff-txn-8",
    affiliateId: "aff-5",
    type: "bonus",
    amount: 50.00,
    description: "Partner signup bonus",
    status: "completed",
    createdAt: "2024-01-20T10:00:00",
  },
];

// Helper functions
export function getAffiliateByUserId(userId: string): Affiliate | undefined {
  return dummyAffiliates.find(a => a.userId === userId);
}

export function getAffiliateByCode(code: string): Affiliate | undefined {
  return dummyAffiliates.find(a => a.referralCode === code);
}

export function getConversionsByAffiliateId(affiliateId: string): ReferralConversion[] {
  return dummyConversions.filter(c => c.affiliateId === affiliateId);
}

export function getTransactionsByAffiliateId(affiliateId: string): AffiliateTransaction[] {
  return affiliateTransactions.filter(t => t.affiliateId === affiliateId);
}

export function getCommissionRule(category: string): CommissionRule | undefined {
  return commissionRules.find(r => r.category === category);
}

export function calculateTotalAffiliateRevenue(): number {
  return dummyConversions
    .filter(c => c.status === "released")
    .reduce((sum, c) => sum + c.grossAmount, 0);
}

export function calculateTotalCommissionsPaid(): number {
  return dummyConversions
    .filter(c => c.status === "released")
    .reduce((sum, c) => sum + c.commissionAmount, 0);
}

export function getTopAffiliates(limit: number = 5): Affiliate[] {
  return [...dummyAffiliates]
    .filter(a => a.status === "active")
    .sort((a, b) => b.lifetimeEarnings - a.lifetimeEarnings)
    .slice(0, limit);
}

export function generateReferralLink(code: string, source?: string, sourceId?: string): string {
  const baseUrl = window.location.origin;
  if (source === "tool" && sourceId) {
    return `${baseUrl}/tools/${sourceId}?ref=${code}`;
  }
  if (source === "offer" && sourceId) {
    return `${baseUrl}/offers/${sourceId}?ref=${code}`;
  }
  return `${baseUrl}/ref/${code}`;
}
