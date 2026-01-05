export interface ToolPlan {
  id: string;
  toolId: string;
  name: string;
  type: "semi-private" | "private" | "byo" | "team";
  monthlyPrice: number;
  durations: { months: number; price: number; discount?: number }[];
  deliveryMethod: "account_provided" | "byo" | "invite_link";
  limits?: string;
  notes: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  toolId: string;
  toolName: string;
  planId: string;
  planName: string;
  duration: number;
  price: number;
  status: "pending_payment" | "paid" | "in_fulfillment" | "delivered" | "active" | "expired" | "cancelled" | "refunded";
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
}

export interface Subscription {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  toolId: string;
  toolName: string;
  planId: string;
  planName: string;
  planType: ToolPlan["type"];
  startDate: string;
  endDate: string;
  nextRenewalDate?: string;
  status: "active" | "expiring" | "expired" | "cancelled";
  autoRenew: boolean;
  cancellationDate?: string;
  deliveryDetails?: DeliveryDetails;
}

export interface DeliveryDetails {
  method: "account_provided" | "byo" | "invite_link";
  email?: string;
  password?: string;
  recoveryInfo?: string;
  inviteUrl?: string;
  inviteExpiry?: string;
  accessGranted?: boolean;
  notes?: string;
  deliveredAt: string;
  deliveredBy: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subscriptionId: string;
  toolName: string;
  problemType: "access_issue" | "password_reset" | "billing" | "other";
  message: string;
  status: "open" | "in_progress" | "resolved";
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  orderId: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}

// Tool Plans
export const toolPlans: ToolPlan[] = [
  // ChatGPT Plans
  {
    id: "chatgpt-semi",
    toolId: "chatgpt",
    name: "Semi-Private",
    type: "semi-private",
    monthlyPrice: 4200,
    durations: [
      { months: 1, price: 4200 },
      { months: 3, price: 11000, discount: 11 },
      { months: 6, price: 21000, discount: 17 },
    ],
    deliveryMethod: "account_provided",
    limits: "Shared with up to 3 users",
    notes: "Access to GPT-4, shared account with usage limits",
  },
  {
    id: "chatgpt-private",
    toolId: "chatgpt",
    name: "Private",
    type: "private",
    monthlyPrice: 8000,
    durations: [
      { months: 1, price: 8000 },
      { months: 3, price: 22000, discount: 8 },
      { months: 6, price: 42000, discount: 14 },
    ],
    deliveryMethod: "account_provided",
    notes: "Dedicated private account, full access to all features",
  },
  {
    id: "chatgpt-byo",
    toolId: "chatgpt",
    name: "BYO Account",
    type: "byo",
    monthlyPrice: 6100,
    durations: [
      { months: 1, price: 6100 },
      { months: 3, price: 16700, discount: 9 },
    ],
    deliveryMethod: "byo",
    notes: "We upgrade your existing account to Plus",
  },
  // Perplexity Plans
  {
    id: "perplexity-semi",
    toolId: "perplexity",
    name: "Semi-Private",
    type: "semi-private",
    monthlyPrice: 3300,
    durations: [
      { months: 1, price: 3300 },
      { months: 3, price: 8900, discount: 11 },
    ],
    deliveryMethod: "account_provided",
    limits: "Shared with up to 2 users",
    notes: "Pro search access, shared account",
  },
  {
    id: "perplexity-private",
    toolId: "perplexity",
    name: "Private",
    type: "private",
    monthlyPrice: 6700,
    durations: [
      { months: 1, price: 6700 },
      { months: 3, price: 18000, discount: 10 },
      { months: 6, price: 33000, discount: 17 },
    ],
    deliveryMethod: "account_provided",
    notes: "Dedicated private account with unlimited searches",
  },
  // Claude Plans
  {
    id: "claude-semi",
    toolId: "claude",
    name: "Semi-Private",
    type: "semi-private",
    monthlyPrice: 4500,
    durations: [
      { months: 1, price: 4500 },
      { months: 3, price: 12200, discount: 8 },
    ],
    deliveryMethod: "account_provided",
    limits: "Shared with up to 3 users",
    notes: "Claude Pro access, shared account",
  },
  {
    id: "claude-private",
    toolId: "claude",
    name: "Private",
    type: "private",
    monthlyPrice: 8900,
    durations: [
      { months: 1, price: 8900 },
      { months: 3, price: 24500, discount: 8 },
      { months: 6, price: 46000, discount: 14 },
    ],
    deliveryMethod: "account_provided",
    notes: "Dedicated Claude Pro account",
  },
  // Gemini Plans
  {
    id: "gemini-private",
    toolId: "gemini",
    name: "Private",
    type: "private",
    monthlyPrice: 9500,
    durations: [
      { months: 1, price: 9500 },
      { months: 3, price: 26500, discount: 7 },
    ],
    deliveryMethod: "invite_link",
    notes: "Google One AI Premium via workspace invite",
  },
  {
    id: "gemini-team",
    toolId: "gemini",
    name: "Team (5 users)",
    type: "team",
    monthlyPrice: 33000,
    durations: [
      { months: 1, price: 33000 },
      { months: 3, price: 92000, discount: 8 },
    ],
    deliveryMethod: "invite_link",
    notes: "Team workspace with 5 seats",
  },
  // Data Analyst Plans
  {
    id: "data-analyst-private",
    toolId: "data-analyst",
    name: "Private",
    type: "private",
    monthlyPrice: 7800,
    durations: [
      { months: 1, price: 7800 },
      { months: 3, price: 21000, discount: 11 },
    ],
    deliveryMethod: "account_provided",
    notes: "Full access to data analysis tools",
  },
  // Research AI Plans
  {
    id: "research-ai-semi",
    toolId: "research-ai",
    name: "Semi-Private",
    type: "semi-private",
    monthlyPrice: 2200,
    durations: [
      { months: 1, price: 2200 },
      { months: 3, price: 6100, discount: 8 },
    ],
    deliveryMethod: "account_provided",
    limits: "Shared with up to 4 users",
    notes: "Basic research tools access",
  },
  {
    id: "research-ai-private",
    toolId: "research-ai",
    name: "Private",
    type: "private",
    monthlyPrice: 4200,
    durations: [
      { months: 1, price: 4200 },
      { months: 3, price: 11000, discount: 11 },
    ],
    deliveryMethod: "account_provided",
    notes: "Dedicated research AI account",
  },
];

// Dummy Orders
export const dummyOrders: Order[] = [
  {
    id: "order-1",
    userId: "student-1",
    userName: "Ahmad Hassan",
    userEmail: "ahmad@university.edu",
    toolId: "chatgpt",
    toolName: "ChatGPT 5.3",
    planId: "chatgpt-private",
    planName: "Private",
    duration: 3,
    price: 80,
    status: "active",
    createdAt: "2024-01-15T10:30:00",
    paidAt: "2024-01-15T10:35:00",
    deliveredAt: "2024-01-15T14:20:00",
  },
  {
    id: "order-2",
    userId: "student-2",
    userName: "Fatima Ali",
    userEmail: "fatima@university.edu",
    toolId: "perplexity",
    toolName: "Perplexity Pro",
    planId: "perplexity-semi",
    planName: "Semi-Private",
    duration: 1,
    price: 12,
    status: "active",
    createdAt: "2024-01-20T14:00:00",
    paidAt: "2024-01-20T14:05:00",
    deliveredAt: "2024-01-20T16:30:00",
  },
  {
    id: "order-3",
    userId: "student-3",
    userName: "Zainab Khan",
    userEmail: "zainab@university.edu",
    toolId: "claude",
    toolName: "Claude 4 Opus",
    planId: "claude-private",
    planName: "Private",
    duration: 1,
    price: 32,
    status: "in_fulfillment",
    createdAt: "2024-02-10T09:00:00",
    paidAt: "2024-02-10T09:10:00",
  },
  {
    id: "order-4",
    userId: "student-4",
    userName: "Ali Raza",
    userEmail: "ali@university.edu",
    toolId: "gemini",
    toolName: "Gemini 4 Ultra",
    planId: "gemini-private",
    planName: "Private",
    duration: 1,
    price: 34,
    status: "paid",
    createdAt: "2024-02-12T11:20:00",
    paidAt: "2024-02-12T11:25:00",
  },
  {
    id: "order-5",
    userId: "researcher-1",
    userName: "Dr. Sarah Chen",
    userEmail: "sarah.chen@research.edu",
    toolId: "chatgpt",
    toolName: "ChatGPT 5.3",
    planId: "chatgpt-byo",
    planName: "BYO Account",
    duration: 3,
    price: 60,
    status: "active",
    createdAt: "2024-01-10T08:00:00",
    paidAt: "2024-01-10T08:10:00",
    deliveredAt: "2024-01-11T10:00:00",
  },
  {
    id: "order-6",
    userId: "student-5",
    userName: "Usman Malik",
    userEmail: "usman@university.edu",
    toolId: "data-analyst",
    toolName: "AI Data Analyst Pack",
    planId: "data-analyst-private",
    planName: "Private",
    duration: 1,
    price: 28,
    status: "pending_payment",
    createdAt: "2024-02-14T15:30:00",
  },
  {
    id: "order-7",
    userId: "student-6",
    userName: "Ayesha Siddiqui",
    userEmail: "ayesha@university.edu",
    toolId: "research-ai",
    toolName: "Research AI Pro",
    planId: "research-ai-private",
    planName: "Private",
    duration: 3,
    price: 40,
    status: "active",
    createdAt: "2024-01-25T12:00:00",
    paidAt: "2024-01-25T12:15:00",
    deliveredAt: "2024-01-25T18:00:00",
  },
  {
    id: "order-8",
    userId: "student-7",
    userName: "Hassan Nawaz",
    userEmail: "hassan@university.edu",
    toolId: "perplexity",
    toolName: "Perplexity Pro",
    planId: "perplexity-private",
    planName: "Private",
    duration: 1,
    price: 24,
    status: "expired",
    createdAt: "2023-12-01T10:00:00",
    paidAt: "2023-12-01T10:10:00",
    deliveredAt: "2023-12-01T14:00:00",
  },
  {
    id: "order-9",
    userId: "researcher-2",
    userName: "Prof. James Miller",
    userEmail: "james.miller@research.edu",
    toolId: "gemini",
    toolName: "Gemini 4 Ultra",
    planId: "gemini-team",
    planName: "Team (5 users)",
    duration: 3,
    price: 330,
    status: "active",
    createdAt: "2024-01-05T09:00:00",
    paidAt: "2024-01-05T09:30:00",
    deliveredAt: "2024-01-06T10:00:00",
  },
  {
    id: "order-10",
    userId: "student-8",
    userName: "Sana Akram",
    userEmail: "sana@university.edu",
    toolId: "claude",
    toolName: "Claude 4 Opus",
    planId: "claude-semi",
    planName: "Semi-Private",
    duration: 1,
    price: 16,
    status: "cancelled",
    createdAt: "2024-02-01T14:00:00",
    paidAt: "2024-02-01T14:10:00",
  },
  {
    id: "order-11",
    userId: "student-9",
    userName: "Bilal Ahmed",
    userEmail: "bilal@university.edu",
    toolId: "chatgpt",
    toolName: "ChatGPT 5.3",
    planId: "chatgpt-semi",
    planName: "Semi-Private",
    duration: 1,
    price: 15,
    status: "active",
    createdAt: "2024-02-05T16:00:00",
    paidAt: "2024-02-05T16:10:00",
    deliveredAt: "2024-02-05T20:00:00",
  },
  {
    id: "order-12",
    userId: "student-10",
    userName: "Maria Khan",
    userEmail: "maria@university.edu",
    toolId: "perplexity",
    toolName: "Perplexity Pro",
    planId: "perplexity-private",
    planName: "Private",
    duration: 3,
    price: 65,
    status: "active",
    createdAt: "2024-01-28T11:00:00",
    paidAt: "2024-01-28T11:15:00",
    deliveredAt: "2024-01-28T15:00:00",
  },
  {
    id: "order-13",
    userId: "student-1",
    userName: "Ahmad Hassan",
    userEmail: "ahmad@university.edu",
    toolId: "research-ai",
    toolName: "Research AI Pro",
    planId: "research-ai-semi",
    planName: "Semi-Private",
    duration: 1,
    price: 8,
    status: "refunded",
    createdAt: "2024-01-18T10:00:00",
    paidAt: "2024-01-18T10:10:00",
  },
  {
    id: "order-14",
    userId: "student-2",
    userName: "Fatima Ali",
    userEmail: "fatima@university.edu",
    toolId: "claude",
    toolName: "Claude 4 Opus",
    planId: "claude-private",
    planName: "Private",
    duration: 1,
    price: 32,
    status: "paid",
    createdAt: "2024-02-13T13:00:00",
    paidAt: "2024-02-13T13:15:00",
  },
  {
    id: "order-15",
    userId: "researcher-3",
    userName: "Dr. Emily Watson",
    userEmail: "emily.watson@research.edu",
    toolId: "data-analyst",
    toolName: "AI Data Analyst Pack",
    planId: "data-analyst-private",
    planName: "Private",
    duration: 3,
    price: 75,
    status: "in_fulfillment",
    createdAt: "2024-02-11T08:30:00",
    paidAt: "2024-02-11T08:45:00",
  },
];

// Dummy Subscriptions
export const dummySubscriptions: Subscription[] = [
  {
    id: "sub-1",
    orderId: "order-1",
    userId: "student-1",
    userName: "Ahmad Hassan",
    toolId: "chatgpt",
    toolName: "ChatGPT 5.3",
    planId: "chatgpt-private",
    planName: "Private",
    planType: "private",
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    nextRenewalDate: "2024-04-15",
    status: "active",
    autoRenew: false,
    deliveryDetails: {
      method: "account_provided",
      email: "research_pro_001@chatgpt.com",
      password: "Xk9#mP2$vL7!nQ4",
      recoveryInfo: "backup.ahmad@email.com",
      notes: "Premium Plus account, all features enabled",
      deliveredAt: "2024-01-15T14:20:00",
      deliveredBy: "Admin",
    },
  },
  {
    id: "sub-2",
    orderId: "order-2",
    userId: "student-2",
    userName: "Fatima Ali",
    toolId: "perplexity",
    toolName: "Perplexity Pro",
    planId: "perplexity-semi",
    planName: "Semi-Private",
    planType: "semi-private",
    startDate: "2024-01-20",
    endDate: "2024-02-20",
    status: "expiring",
    autoRenew: false,
    deliveryDetails: {
      method: "account_provided",
      email: "shared_perp_05@perplexity.ai",
      password: "Rj8@hN3#kF1!pW9",
      notes: "Shared with 1 other user",
      deliveredAt: "2024-01-20T16:30:00",
      deliveredBy: "Admin",
    },
  },
  {
    id: "sub-3",
    orderId: "order-5",
    userId: "researcher-1",
    userName: "Dr. Sarah Chen",
    toolId: "chatgpt",
    toolName: "ChatGPT 5.3",
    planId: "chatgpt-byo",
    planName: "BYO Account",
    planType: "byo",
    startDate: "2024-01-11",
    endDate: "2024-04-11",
    nextRenewalDate: "2024-04-11",
    status: "active",
    autoRenew: true,
    deliveryDetails: {
      method: "byo",
      email: "sarah.chen@research.edu",
      accessGranted: true,
      notes: "Upgraded existing account to Plus",
      deliveredAt: "2024-01-11T10:00:00",
      deliveredBy: "Admin",
    },
  },
  {
    id: "sub-4",
    orderId: "order-7",
    userId: "student-6",
    userName: "Ayesha Siddiqui",
    toolId: "research-ai",
    toolName: "Research AI Pro",
    planId: "research-ai-private",
    planName: "Private",
    planType: "private",
    startDate: "2024-01-25",
    endDate: "2024-04-25",
    status: "active",
    autoRenew: false,
    deliveryDetails: {
      method: "account_provided",
      email: "ayesha_research@researchai.com",
      password: "Bt5$yK8#mC2!xA7",
      deliveredAt: "2024-01-25T18:00:00",
      deliveredBy: "Admin",
    },
  },
  {
    id: "sub-5",
    orderId: "order-9",
    userId: "researcher-2",
    userName: "Prof. James Miller",
    toolId: "gemini",
    toolName: "Gemini 4 Ultra",
    planId: "gemini-team",
    planName: "Team (5 users)",
    planType: "team",
    startDate: "2024-01-06",
    endDate: "2024-04-06",
    status: "active",
    autoRenew: true,
    deliveryDetails: {
      method: "invite_link",
      inviteUrl: "https://workspace.google.com/invite/abc123xyz",
      inviteExpiry: "2024-01-13",
      notes: "Team workspace created, 5 seats available",
      deliveredAt: "2024-01-06T10:00:00",
      deliveredBy: "Admin",
    },
  },
  {
    id: "sub-6",
    orderId: "order-11",
    userId: "student-9",
    userName: "Bilal Ahmed",
    toolId: "chatgpt",
    toolName: "ChatGPT 5.3",
    planId: "chatgpt-semi",
    planName: "Semi-Private",
    planType: "semi-private",
    startDate: "2024-02-05",
    endDate: "2024-03-05",
    status: "active",
    autoRenew: false,
    deliveryDetails: {
      method: "account_provided",
      email: "shared_gpt_12@chatgpt.com",
      password: "Yw4#nL9@pT6!bH2",
      notes: "Shared with 2 other users",
      deliveredAt: "2024-02-05T20:00:00",
      deliveredBy: "Admin",
    },
  },
  {
    id: "sub-7",
    orderId: "order-12",
    userId: "student-10",
    userName: "Maria Khan",
    toolId: "perplexity",
    toolName: "Perplexity Pro",
    planId: "perplexity-private",
    planName: "Private",
    planType: "private",
    startDate: "2024-01-28",
    endDate: "2024-04-28",
    status: "active",
    autoRenew: false,
    deliveryDetails: {
      method: "account_provided",
      email: "maria_perp@perplexity.ai",
      password: "Qz7@jM1#vX5!cD3",
      deliveredAt: "2024-01-28T15:00:00",
      deliveredBy: "Admin",
    },
  },
  {
    id: "sub-8",
    orderId: "order-8",
    userId: "student-7",
    userName: "Hassan Nawaz",
    toolId: "perplexity",
    toolName: "Perplexity Pro",
    planId: "perplexity-private",
    planName: "Private",
    planType: "private",
    startDate: "2023-12-01",
    endDate: "2024-01-01",
    status: "expired",
    autoRenew: false,
    deliveryDetails: {
      method: "account_provided",
      email: "hassan_perp@perplexity.ai",
      password: "expired_password",
      deliveredAt: "2023-12-01T14:00:00",
      deliveredBy: "Admin",
    },
  },
  {
    id: "sub-9",
    orderId: "order-10",
    userId: "student-8",
    userName: "Sana Akram",
    toolId: "claude",
    toolName: "Claude 4 Opus",
    planId: "claude-semi",
    planName: "Semi-Private",
    planType: "semi-private",
    startDate: "2024-02-01",
    endDate: "2024-03-01",
    status: "cancelled",
    autoRenew: false,
    cancellationDate: "2024-02-08",
  },
  {
    id: "sub-10",
    orderId: "order-2",
    userId: "student-2",
    userName: "Fatima Ali",
    toolId: "claude",
    toolName: "Claude 4 Opus",
    planId: "claude-private",
    planName: "Private",
    planType: "private",
    startDate: "2024-02-15",
    endDate: "2024-02-22",
    status: "expiring",
    autoRenew: false,
    deliveryDetails: {
      method: "account_provided",
      email: "fatima_claude@anthropic.com",
      password: "Fg3#kR8@mN5!vP1",
      deliveredAt: "2024-02-15T10:00:00",
      deliveredBy: "Admin",
    },
  },
];

// Dummy Support Tickets
export const dummySupportTickets: SupportTicket[] = [
  {
    id: "ticket-1",
    userId: "student-1",
    userName: "Ahmad Hassan",
    subscriptionId: "sub-1",
    toolName: "ChatGPT 5.3",
    problemType: "access_issue",
    message: "I'm getting 'session expired' error when trying to log in. This started happening yesterday.",
    status: "in_progress",
    adminReply: "We're looking into this. Try clearing your browser cache in the meantime.",
    createdAt: "2024-02-10T09:00:00",
    updatedAt: "2024-02-10T11:30:00",
  },
  {
    id: "ticket-2",
    userId: "student-2",
    userName: "Fatima Ali",
    subscriptionId: "sub-2",
    toolName: "Perplexity Pro",
    problemType: "password_reset",
    message: "I accidentally changed the password and now can't log in. Please reset it.",
    status: "resolved",
    adminReply: "Password has been reset. New credentials sent to your email.",
    createdAt: "2024-02-08T14:30:00",
    updatedAt: "2024-02-08T16:00:00",
    resolvedAt: "2024-02-08T16:00:00",
  },
  {
    id: "ticket-3",
    userId: "researcher-2",
    userName: "Prof. James Miller",
    subscriptionId: "sub-5",
    toolName: "Gemini 4 Ultra",
    problemType: "other",
    message: "Need to add 2 more team members. Is there a way to upgrade our team plan?",
    status: "open",
    createdAt: "2024-02-12T10:15:00",
  },
  {
    id: "ticket-4",
    userId: "student-6",
    userName: "Ayesha Siddiqui",
    subscriptionId: "sub-4",
    toolName: "Research AI Pro",
    problemType: "billing",
    message: "I was charged twice for the same subscription. Please refund the extra charge.",
    status: "in_progress",
    adminReply: "We're investigating this with our payment processor. Will update you within 24 hours.",
    createdAt: "2024-02-11T08:45:00",
    updatedAt: "2024-02-11T12:00:00",
  },
  {
    id: "ticket-5",
    userId: "student-9",
    userName: "Bilal Ahmed",
    subscriptionId: "sub-6",
    toolName: "ChatGPT 5.3",
    problemType: "access_issue",
    message: "The shared account seems to be at capacity. Can't access during peak hours.",
    status: "resolved",
    adminReply: "You've been moved to a less crowded shared account. Please try logging in with the new credentials.",
    createdAt: "2024-02-09T17:20:00",
    updatedAt: "2024-02-10T09:00:00",
    resolvedAt: "2024-02-10T09:00:00",
  },
  {
    id: "ticket-6",
    userId: "student-10",
    userName: "Maria Khan",
    subscriptionId: "sub-7",
    toolName: "Perplexity Pro",
    problemType: "other",
    message: "Is it possible to pause my subscription for 2 weeks while I'm on vacation?",
    status: "open",
    createdAt: "2024-02-13T15:00:00",
  },
];

// Helper functions
export function getSubscriptionsByUserId(userId: string): Subscription[] {
  return dummySubscriptions.filter(s => s.userId === userId);
}

export function getOrdersByUserId(userId: string): Order[] {
  return dummyOrders.filter(o => o.userId === userId);
}

export function getPlansByToolId(toolId: string): ToolPlan[] {
  return toolPlans.filter(p => p.toolId === toolId);
}

export function getPendingFulfillmentOrders(): Order[] {
  return dummyOrders.filter(o => o.status === "paid" || o.status === "in_fulfillment");
}

export function getExpiringSubscriptions(days: number = 7): Subscription[] {
  const now = new Date();
  const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return dummySubscriptions.filter(s => {
    const endDate = new Date(s.endDate);
    return s.status === "active" && endDate <= threshold && endDate > now;
  });
}

export function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getToolSubscriptionStats() {
  const activeSubscriptions = dummySubscriptions.filter(s => s.status === "active").length;
  const expiringSoon = getExpiringSubscriptions(7).length;
  const totalRevenue = dummyOrders
    .filter(o => o.status === "active" || o.status === "delivered")
    .reduce((sum, o) => sum + o.price, 0);
  
  const planDistribution = dummySubscriptions.reduce((acc, s) => {
    acc[s.planType] = (acc[s.planType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const toolDistribution = dummyOrders
    .filter(o => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((acc, o) => {
      acc[o.toolName] = (acc[o.toolName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return {
    activeSubscriptions,
    expiringSoon,
    totalRevenue,
    planDistribution,
    toolDistribution,
  };
}
