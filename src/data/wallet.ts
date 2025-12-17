export interface Wallet {
  id: string;
  userId: string;
  userName: string;
  userType: "student" | "researcher" | "project_owner" | "admin";
  availableBalance: number;
  escrowBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  lifetimeSpend: number;
}

export interface Milestone {
  id: string;
  offerId: string;
  title: string;
  description: string;
  amount: number;
  expectedDelivery: string;
  status: "pending" | "submitted" | "approved" | "revision_requested" | "released" | "disputed";
  submittedAt?: string;
  approvedAt?: string;
  releasedAt?: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: "escrow_deposit" | "milestone_release" | "commission_deduction" | "refund" | "withdrawal" | "tool_purchase";
  amount: number;
  description: string;
  relatedOfferId?: string;
  relatedMilestoneId?: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
}

export interface Dispute {
  id: string;
  milestoneId: string;
  offerId: string;
  raisedBy: string;
  reason: string;
  status: "open" | "under_review" | "resolved_provider" | "resolved_client" | "split";
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

// Admin platform wallet
export const adminWallet: Wallet = {
  id: "admin-wallet",
  userId: "admin",
  userName: "Platform",
  userType: "admin",
  availableBalance: 3880,
  escrowBalance: 0,
  pendingBalance: 450,
  lifetimeEarnings: 12500,
  lifetimeSpend: 0,
};

// User wallets
export const dummyWallets: Wallet[] = [
  {
    id: "wallet-student-1",
    userId: "student-1",
    userName: "Ahmad Hassan",
    userType: "student",
    availableBalance: 1250,
    escrowBalance: 800,
    pendingBalance: 350,
    lifetimeEarnings: 4500,
    lifetimeSpend: 120,
  },
  {
    id: "wallet-student-2",
    userId: "student-2",
    userName: "Fatima Ali",
    userType: "student",
    availableBalance: 890,
    escrowBalance: 500,
    pendingBalance: 200,
    lifetimeEarnings: 3200,
    lifetimeSpend: 85,
  },
  {
    id: "wallet-student-3",
    userId: "student-3",
    userName: "Zainab Khan",
    userType: "student",
    availableBalance: 450,
    escrowBalance: 0,
    pendingBalance: 0,
    lifetimeEarnings: 1800,
    lifetimeSpend: 45,
  },
  {
    id: "wallet-researcher-1",
    userId: "researcher-1",
    userName: "Dr. Sarah Chen",
    userType: "researcher",
    availableBalance: 2500,
    escrowBalance: 1800,
    pendingBalance: 0,
    lifetimeEarnings: 850,
    lifetimeSpend: 8500,
  },
  {
    id: "wallet-researcher-2",
    userId: "researcher-2",
    userName: "Prof. James Miller",
    userType: "researcher",
    availableBalance: 1800,
    escrowBalance: 1200,
    pendingBalance: 0,
    lifetimeEarnings: 0,
    lifetimeSpend: 5200,
  },
];

// Milestones for offers
export const dummyMilestones: Milestone[] = [
  // Offer 1 milestones (ML Model)
  {
    id: "milestone-1-1",
    offerId: "offer-1",
    title: "Data Preprocessing & EDA",
    description: "Clean the dataset, handle missing values, and perform exploratory data analysis",
    amount: 300,
    expectedDelivery: "2024-02-05",
    status: "approved",
    submittedAt: "2024-02-03",
    approvedAt: "2024-02-04",
    releasedAt: "2024-02-04",
  },
  {
    id: "milestone-1-2",
    offerId: "offer-1",
    title: "Model Development",
    description: "Build and train the ML model with hyperparameter tuning",
    amount: 350,
    expectedDelivery: "2024-02-10",
    status: "submitted",
    submittedAt: "2024-02-09",
  },
  {
    id: "milestone-1-3",
    offerId: "offer-1",
    title: "Documentation & Delivery",
    description: "Complete documentation and final model delivery",
    amount: 150,
    expectedDelivery: "2024-02-15",
    status: "pending",
  },
  // Offer 3 milestones (React Dashboard)
  {
    id: "milestone-3-1",
    offerId: "offer-3",
    title: "UI/UX Design & Wireframes",
    description: "Design the dashboard layout and create wireframes",
    amount: 300,
    expectedDelivery: "2024-02-10",
    status: "approved",
    submittedAt: "2024-02-08",
    approvedAt: "2024-02-09",
    releasedAt: "2024-02-09",
  },
  {
    id: "milestone-3-2",
    offerId: "offer-3",
    title: "Core Components Development",
    description: "Build React components for charts and data tables",
    amount: 500,
    expectedDelivery: "2024-02-20",
    status: "pending",
  },
  {
    id: "milestone-3-3",
    offerId: "offer-3",
    title: "Integration & Testing",
    description: "Integrate with data sources and perform testing",
    amount: 400,
    expectedDelivery: "2024-03-01",
    status: "pending",
  },
  // Offer 10 milestones (MATLAB Simulation)
  {
    id: "milestone-10-1",
    offerId: "offer-10",
    title: "Signal Processing Analysis",
    description: "Analyze requirements and design signal processing pipeline",
    amount: 200,
    expectedDelivery: "2024-02-08",
    status: "released",
    submittedAt: "2024-02-06",
    approvedAt: "2024-02-07",
    releasedAt: "2024-02-07",
  },
  {
    id: "milestone-10-2",
    offerId: "offer-10",
    title: "MATLAB Implementation",
    description: "Implement the simulation in MATLAB",
    amount: 300,
    expectedDelivery: "2024-02-15",
    status: "revision_requested",
    submittedAt: "2024-02-14",
  },
  // Offer 12 milestones (Neural Network) - has dispute
  {
    id: "milestone-12-1",
    offerId: "offer-12",
    title: "Architecture Design",
    description: "Design the CNN architecture for image classification",
    amount: 250,
    expectedDelivery: "2024-02-10",
    status: "released",
    submittedAt: "2024-02-09",
    approvedAt: "2024-02-10",
    releasedAt: "2024-02-10",
  },
  {
    id: "milestone-12-2",
    offerId: "offer-12",
    title: "Model Training",
    description: "Train the model with provided dataset",
    amount: 300,
    expectedDelivery: "2024-02-20",
    status: "disputed",
    submittedAt: "2024-02-19",
  },
  {
    id: "milestone-12-3",
    offerId: "offer-12",
    title: "Optimization & Deployment",
    description: "Optimize model and prepare for deployment",
    amount: 150,
    expectedDelivery: "2024-02-28",
    status: "pending",
  },
  // Offer 14 milestones (Presentation)
  {
    id: "milestone-14-1",
    offerId: "offer-14",
    title: "Content Outline",
    description: "Create presentation outline and structure",
    amount: 80,
    expectedDelivery: "2024-02-05",
    status: "approved",
    submittedAt: "2024-02-04",
    approvedAt: "2024-02-05",
    releasedAt: "2024-02-05",
  },
  {
    id: "milestone-14-2",
    offerId: "offer-14",
    title: "Final Slides",
    description: "Complete all slides with animations",
    amount: 100,
    expectedDelivery: "2024-02-10",
    status: "submitted",
    submittedAt: "2024-02-09",
  },
];

// Wallet transactions
export const dummyWalletTransactions: WalletTransaction[] = [
  {
    id: "txn-w-1",
    walletId: "wallet-student-1",
    type: "milestone_release",
    amount: 270,
    description: "Milestone 1 released - ML Model Data Preprocessing",
    relatedOfferId: "offer-1",
    relatedMilestoneId: "milestone-1-1",
    status: "completed",
    createdAt: "2024-02-04T10:30:00",
  },
  {
    id: "txn-w-2",
    walletId: "wallet-student-1",
    type: "commission_deduction",
    amount: -30,
    description: "Platform fee (10%) - Milestone 1",
    relatedOfferId: "offer-1",
    relatedMilestoneId: "milestone-1-1",
    status: "completed",
    createdAt: "2024-02-04T10:30:00",
  },
  {
    id: "txn-w-3",
    walletId: "wallet-researcher-1",
    type: "escrow_deposit",
    amount: -800,
    description: "Escrow deposit for ML Model project",
    relatedOfferId: "offer-1",
    status: "completed",
    createdAt: "2024-01-21T14:00:00",
  },
  {
    id: "txn-w-4",
    walletId: "wallet-student-2",
    type: "milestone_release",
    amount: 180,
    description: "Signal Processing Analysis released",
    relatedOfferId: "offer-10",
    relatedMilestoneId: "milestone-10-1",
    status: "completed",
    createdAt: "2024-02-07T16:45:00",
  },
  {
    id: "txn-w-5",
    walletId: "wallet-student-1",
    type: "tool_purchase",
    amount: -29,
    description: "ChatGPT 5.3 subscription",
    status: "completed",
    createdAt: "2024-01-15T09:20:00",
  },
  {
    id: "txn-w-6",
    walletId: "wallet-student-3",
    type: "milestone_release",
    amount: 72,
    description: "Presentation outline completed",
    relatedOfferId: "offer-14",
    relatedMilestoneId: "milestone-14-1",
    status: "completed",
    createdAt: "2024-02-05T11:00:00",
  },
  {
    id: "txn-w-7",
    walletId: "wallet-researcher-2",
    type: "escrow_deposit",
    amount: -1200,
    description: "Escrow deposit for React Dashboard project",
    relatedOfferId: "offer-3",
    status: "completed",
    createdAt: "2024-01-25T08:30:00",
  },
  {
    id: "txn-w-8",
    walletId: "wallet-student-2",
    type: "escrow_deposit",
    amount: 500,
    description: "Funds received in escrow - MATLAB project",
    relatedOfferId: "offer-10",
    status: "completed",
    createdAt: "2024-01-22T13:15:00",
  },
];

// Disputes
export const dummyDisputes: Dispute[] = [
  {
    id: "dispute-1",
    milestoneId: "milestone-12-2",
    offerId: "offer-12",
    raisedBy: "researcher-5",
    reason: "The model accuracy is significantly below the agreed threshold. Needs major revision.",
    status: "under_review",
    createdAt: "2024-02-20T09:00:00",
  },
];

// Helper functions
export function getWalletByUserId(userId: string): Wallet | undefined {
  return dummyWallets.find(w => w.userId === userId);
}

export function getMilestonesByOfferId(offerId: string): Milestone[] {
  return dummyMilestones.filter(m => m.offerId === offerId);
}

export function getTransactionsByWalletId(walletId: string): WalletTransaction[] {
  return dummyWalletTransactions.filter(t => t.walletId === walletId);
}

export function calculateMilestoneProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter(m => 
    m.status === "approved" || m.status === "released"
  ).length;
  return Math.round((completed / milestones.length) * 100);
}

export function calculateEscrowTotal(): number {
  return dummyWallets.reduce((sum, w) => sum + w.escrowBalance, 0);
}

export function calculatePendingDisputes(): number {
  return dummyDisputes.filter(d => 
    d.status === "open" || d.status === "under_review"
  ).length;
}

// Default milestone templates
export const milestoneTemplates = [
  {
    name: "Simple (2 milestones)",
    milestones: [
      { title: "Initial Draft", percentage: 50 },
      { title: "Final Delivery", percentage: 50 },
    ],
  },
  {
    name: "Standard (3 milestones)",
    milestones: [
      { title: "Planning & Setup", percentage: 25 },
      { title: "Main Development", percentage: 50 },
      { title: "Review & Delivery", percentage: 25 },
    ],
  },
  {
    name: "Detailed (4 milestones)",
    milestones: [
      { title: "Requirements & Planning", percentage: 15 },
      { title: "Implementation Phase 1", percentage: 35 },
      { title: "Implementation Phase 2", percentage: 35 },
      { title: "Testing & Delivery", percentage: 15 },
    ],
  },
];
