export type AccountStatus =
  | "active"
  | "pending_review"
  | "restricted"
  | "suspended"
  | "deactivated";

export type AccountStatusTone = "green" | "blue" | "amber" | "red" | "muted";

export type AccountStatusConfig = {
  status: AccountStatus;
  label: string;
  description: string;
  tone: AccountStatusTone;
  canSignIn: boolean;
  canCreateProjects: boolean;
  canMessage: boolean;
  canUseMarketplace: boolean;
  requiresAdminReview: boolean;
  userAction: string;
};

export const DEFAULT_ACCOUNT_STATUS: AccountStatus = "active";

export const ACCOUNT_STATUS_CONFIG: Record<AccountStatus, AccountStatusConfig> = {
  active: {
    status: "active",
    label: "Active",
    description: "Account is in good standing and can use normal platform workflows.",
    tone: "green",
    canSignIn: true,
    canCreateProjects: true,
    canMessage: true,
    canUseMarketplace: true,
    requiresAdminReview: false,
    userAction: "No action needed.",
  },
  pending_review: {
    status: "pending_review",
    label: "Pending Review",
    description: "Account needs admin review before some workflows are unlocked.",
    tone: "blue",
    canSignIn: true,
    canCreateProjects: false,
    canMessage: true,
    canUseMarketplace: false,
    requiresAdminReview: true,
    userAction: "Wait for review or contact support if this seems incorrect.",
  },
  restricted: {
    status: "restricted",
    label: "Restricted",
    description: "Account can sign in but has limited platform actions.",
    tone: "amber",
    canSignIn: true,
    canCreateProjects: false,
    canMessage: false,
    canUseMarketplace: false,
    requiresAdminReview: true,
    userAction: "Review platform rules and contact support for clarification.",
  },
  suspended: {
    status: "suspended",
    label: "Suspended",
    description: "Account access is suspended pending admin review.",
    tone: "red",
    canSignIn: true,
    canCreateProjects: false,
    canMessage: false,
    canUseMarketplace: false,
    requiresAdminReview: true,
    userAction: "Contact support to request a review.",
  },
  deactivated: {
    status: "deactivated",
    label: "Deactivated",
    description: "Account has been deactivated and should not use active workflows.",
    tone: "muted",
    canSignIn: true,
    canCreateProjects: false,
    canMessage: false,
    canUseMarketplace: false,
    requiresAdminReview: true,
    userAction: "Contact support if you believe this is a mistake.",
  },
};

export function normalizeAccountStatus(status?: string | null): AccountStatus {
  if (!status) return DEFAULT_ACCOUNT_STATUS;
  return status in ACCOUNT_STATUS_CONFIG ? (status as AccountStatus) : DEFAULT_ACCOUNT_STATUS;
}

export function getAccountStatusConfig(status?: string | null): AccountStatusConfig {
  return ACCOUNT_STATUS_CONFIG[normalizeAccountStatus(status)];
}

export function isAccountStatusAllowed(status: string | null | undefined, capability: keyof Pick<AccountStatusConfig, "canCreateProjects" | "canMessage" | "canUseMarketplace">): boolean {
  return getAccountStatusConfig(status)[capability];
}

export function isAccountLimited(status?: string | null): boolean {
  return normalizeAccountStatus(status) !== "active";
}

export function getAccountStatusToneClass(tone: AccountStatusTone): string {
  switch (tone) {
    case "green":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "blue":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "amber":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "red":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
