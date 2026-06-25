export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "approved"
  | "rejected"
  | "requires_more_info"
  | "expired"
  | "revoked"
  | "disputed";

export type VerificationBadgeType =
  | "student"
  | "researcher"
  | "partner"
  | "institution"
  | "sponsor"
  | "government"
  | "expert"
  | "top_rated"
  | "project_owner";

export type VerificationLevel = "none" | "basic" | "verified" | "trusted" | "elite";

export type VerificationStatusConfig = {
  status: VerificationStatus;
  label: string;
  description: string;
  tone: "muted" | "blue" | "green" | "amber" | "red" | "purple";
  isTrusted: boolean;
  isActionable: boolean;
};

export type VerificationBadgeConfig = {
  type: VerificationBadgeType;
  label: string;
  shortLabel: string;
  description: string;
  minimumLevel: VerificationLevel;
  publicVisible: boolean;
};

export const VERIFICATION_STATUS_CONFIG: Record<VerificationStatus, VerificationStatusConfig> = {
  unverified: {
    status: "unverified",
    label: "Unverified",
    description: "Verification has not been submitted or completed yet.",
    tone: "muted",
    isTrusted: false,
    isActionable: true,
  },
  pending: {
    status: "pending",
    label: "Pending",
    description: "Verification request is under review.",
    tone: "blue",
    isTrusted: false,
    isActionable: false,
  },
  verified: {
    status: "verified",
    label: "Verified",
    description: "Verification is active and visible to users.",
    tone: "green",
    isTrusted: true,
    isActionable: false,
  },
  approved: {
    status: "approved",
    label: "Verified",
    description: "Verification request has been approved.",
    tone: "green",
    isTrusted: true,
    isActionable: false,
  },
  rejected: {
    status: "rejected",
    label: "Rejected",
    description: "Verification request was rejected after review.",
    tone: "red",
    isTrusted: false,
    isActionable: true,
  },
  requires_more_info: {
    status: "requires_more_info",
    label: "More Info Needed",
    description: "Reviewer needs more information before a decision.",
    tone: "amber",
    isTrusted: false,
    isActionable: true,
  },
  expired: {
    status: "expired",
    label: "Expired",
    description: "Verification expired and needs renewal.",
    tone: "amber",
    isTrusted: false,
    isActionable: true,
  },
  revoked: {
    status: "revoked",
    label: "Revoked",
    description: "Verification was revoked and is no longer trusted.",
    tone: "red",
    isTrusted: false,
    isActionable: true,
  },
  disputed: {
    status: "disputed",
    label: "Disputed",
    description: "Verification is under dispute or investigation.",
    tone: "purple",
    isTrusted: false,
    isActionable: true,
  },
};

export const VERIFICATION_BADGE_CONFIG: Record<VerificationBadgeType, VerificationBadgeConfig> = {
  student: {
    type: "student",
    label: "Verified Student",
    shortLabel: "Student",
    description: "User has verified student affiliation or academic identity.",
    minimumLevel: "basic",
    publicVisible: true,
  },
  researcher: {
    type: "researcher",
    label: "Verified Researcher",
    shortLabel: "Researcher",
    description: "User has verified research background, publications, or academic role.",
    minimumLevel: "verified",
    publicVisible: true,
  },
  partner: {
    type: "partner",
    label: "Verified Partner",
    shortLabel: "Partner",
    description: "Organization or partner identity has been reviewed.",
    minimumLevel: "verified",
    publicVisible: true,
  },
  institution: {
    type: "institution",
    label: "Verified Institution",
    shortLabel: "Institution",
    description: "Institutional identity has been reviewed.",
    minimumLevel: "trusted",
    publicVisible: true,
  },
  sponsor: {
    type: "sponsor",
    label: "Verified Sponsor",
    shortLabel: "Sponsor",
    description: "Sponsor profile has passed platform review.",
    minimumLevel: "trusted",
    publicVisible: true,
  },
  government: {
    type: "government",
    label: "Government Verified",
    shortLabel: "Govt",
    description: "Public-sector identity has been reviewed.",
    minimumLevel: "trusted",
    publicVisible: true,
  },
  expert: {
    type: "expert",
    label: "Expert Verified",
    shortLabel: "Expert",
    description: "User has expert-level credibility in a specialist area.",
    minimumLevel: "trusted",
    publicVisible: true,
  },
  top_rated: {
    type: "top_rated",
    label: "Top Rated",
    shortLabel: "Top Rated",
    description: "User has strong completion, quality, or review signals.",
    minimumLevel: "trusted",
    publicVisible: true,
  },
  project_owner: {
    type: "project_owner",
    label: "Verified Project Owner",
    shortLabel: "Owner",
    description: "Project owner identity or institution has been reviewed.",
    minimumLevel: "verified",
    publicVisible: true,
  },
};

export function normalizeVerificationStatus(status?: string | null): VerificationStatus {
  if (!status) return "unverified";
  return status in VERIFICATION_STATUS_CONFIG ? (status as VerificationStatus) : "unverified";
}

export function getVerificationStatusConfig(status?: string | null): VerificationStatusConfig {
  return VERIFICATION_STATUS_CONFIG[normalizeVerificationStatus(status)];
}

export function getVerificationBadgeConfig(type?: string | null): VerificationBadgeConfig | null {
  if (!type || !(type in VERIFICATION_BADGE_CONFIG)) return null;
  return VERIFICATION_BADGE_CONFIG[type as VerificationBadgeType];
}

export function isTrustedVerification(status?: string | null): boolean {
  return getVerificationStatusConfig(status).isTrusted;
}

export function getVerificationToneClass(tone: VerificationStatusConfig["tone"]): string {
  switch (tone) {
    case "green":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "blue":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "amber":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "red":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "purple":
      return "bg-purple-500/10 text-purple-600 border-purple-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
