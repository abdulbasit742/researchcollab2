export type AppRole =
  | "student"
  | "researcher"
  | "admin"
  | "government_admin"
  | "compliance_officer"
  | "sponsor_admin"
  | "tenant_admin"
  | "super_admin";

export type RoleCategory = "public" | "academic" | "admin" | "institution" | "sponsor" | "governance";

export type RolePermission =
  | "dashboard:view"
  | "projects:create"
  | "projects:manage_own"
  | "research:use_ai_tools"
  | "marketplace:offer_services"
  | "funding:sponsor_projects"
  | "admin:view"
  | "admin:manage_users"
  | "admin:manage_platform"
  | "governance:view"
  | "governance:manage_compliance"
  | "institution:view"
  | "institution:manage_tenant";

export type RoleConfig = {
  role: AppRole;
  label: string;
  description: string;
  dashboardPath: string;
  category: RoleCategory;
  isPrivileged: boolean;
  permissions: RolePermission[];
};

export type PublicSignupRoleOption = {
  value: string;
  role: AppRole;
  label: string;
  description: string;
  dashboardPath: string;
};

export const DEFAULT_ROLE: AppRole = "student";
export const DEFAULT_DASHBOARD_PATH = "/home";
export const ONBOARDING_PATH = "/onboarding";

export const ROLE_CONFIG: Record<AppRole, RoleConfig> = {
  student: {
    role: "student",
    label: "Student",
    description: "Learns, creates FYP/research projects, joins teams, and tracks academic progress.",
    dashboardPath: "/home",
    category: "academic",
    isPrivileged: false,
    permissions: ["dashboard:view", "projects:create", "projects:manage_own", "research:use_ai_tools"],
  },
  researcher: {
    role: "researcher",
    label: "Researcher",
    description: "Creates research projects, offers academic services, uses AI tools, and manages deliverables.",
    dashboardPath: "/home",
    category: "academic",
    isPrivileged: false,
    permissions: [
      "dashboard:view",
      "projects:create",
      "projects:manage_own",
      "research:use_ai_tools",
      "marketplace:offer_services",
    ],
  },
  admin: {
    role: "admin",
    label: "Admin",
    description: "Manages platform operations, moderation, health checks, and admin dashboards.",
    dashboardPath: "/admin",
    category: "admin",
    isPrivileged: true,
    permissions: ["dashboard:view", "admin:view", "admin:manage_users"],
  },
  government_admin: {
    role: "government_admin",
    label: "Government Admin",
    description: "Reviews national oversight, compliance signals, and public-sector reporting views.",
    dashboardPath: "/national-oversight",
    category: "governance",
    isPrivileged: true,
    permissions: ["dashboard:view", "governance:view"],
  },
  compliance_officer: {
    role: "compliance_officer",
    label: "Compliance Officer",
    description: "Reviews governance, audit, privacy, trust, and compliance workflows.",
    dashboardPath: "/governance",
    category: "governance",
    isPrivileged: true,
    permissions: ["dashboard:view", "governance:view", "governance:manage_compliance"],
  },
  sponsor_admin: {
    role: "sponsor_admin",
    label: "Sponsor Admin",
    description: "Reviews sponsored projects, demo funding flows, and funder impact dashboards.",
    dashboardPath: "/sponsor-dashboard",
    category: "sponsor",
    isPrivileged: true,
    permissions: ["dashboard:view", "funding:sponsor_projects"],
  },
  tenant_admin: {
    role: "tenant_admin",
    label: "Tenant Admin",
    description: "Manages institution-level controls, tenant settings, batches, and pilot operations.",
    dashboardPath: "/institution-control",
    category: "institution",
    isPrivileged: true,
    permissions: ["dashboard:view", "institution:view", "institution:manage_tenant"],
  },
  super_admin: {
    role: "super_admin",
    label: "Super Admin",
    description: "Controls full platform administration, founder dashboards, and platform-wide configuration.",
    dashboardPath: "/admin",
    category: "admin",
    isPrivileged: true,
    permissions: ["dashboard:view", "admin:view", "admin:manage_users", "admin:manage_platform"],
  },
};

export const PUBLIC_SIGNUP_ROLE_MAP: Record<string, AppRole> = {
  student: "student",
  researcher: "researcher",
  professional: "researcher",
};

export const PUBLIC_SIGNUP_ROLE_OPTIONS: PublicSignupRoleOption[] = [
  {
    value: "student",
    role: "student",
    label: ROLE_CONFIG.student.label,
    description: "Learn, collaborate, and earn",
    dashboardPath: ROLE_CONFIG.student.dashboardPath,
  },
  {
    value: "researcher",
    role: "researcher",
    label: ROLE_CONFIG.researcher.label,
    description: "Lead projects and mentor",
    dashboardPath: ROLE_CONFIG.researcher.dashboardPath,
  },
  {
    value: "professional",
    role: "researcher",
    label: "Professional",
    description: "Post projects, hire talent, access tools",
    dashboardPath: ROLE_CONFIG.researcher.dashboardPath,
  },
];

export const PUBLIC_SIGNUP_ROLES: AppRole[] = ["student", "researcher"];
export const PRIVILEGED_ROLES: AppRole[] = Object.values(ROLE_CONFIG)
  .filter((config) => config.isPrivileged)
  .map((config) => config.role);

export const ADMIN_ROLES: AppRole[] = ["admin", "super_admin"];
export const GOVERNANCE_ROLES: AppRole[] = ["government_admin", "compliance_officer"];
export const INSTITUTION_ROLES: AppRole[] = ["tenant_admin"];
export const SPONSOR_ROLES: AppRole[] = ["sponsor_admin"];

export function isAppRole(role?: string | null): role is AppRole {
  return Boolean(role && role in ROLE_CONFIG);
}

export function normalizeRole(role?: string | null): AppRole {
  return isAppRole(role) ? role : DEFAULT_ROLE;
}

export function mapPublicSignupRole(role?: string | null): AppRole {
  if (!role) return DEFAULT_ROLE;
  return PUBLIC_SIGNUP_ROLE_MAP[role] ?? DEFAULT_ROLE;
}

export function getRoleConfig(role?: string | null): RoleConfig {
  return ROLE_CONFIG[normalizeRole(role)];
}

export function getRoleDashboardPath(role?: string | null): string {
  return getRoleConfig(role).dashboardPath || DEFAULT_DASHBOARD_PATH;
}

export function getRoleLabel(role?: string | null): string {
  return getRoleConfig(role).label;
}

export function getPostAuthRedirectPath(role?: string | null, onboardingCompleted?: boolean | null): string {
  if (!onboardingCompleted) return ONBOARDING_PATH;
  return getRoleDashboardPath(role);
}

export function getPublicSignupRoleOptions(): PublicSignupRoleOption[] {
  return PUBLIC_SIGNUP_ROLE_OPTIONS;
}

export function roleHasPermission(role: string | null | undefined, permission: RolePermission): boolean {
  return getRoleConfig(role).permissions.includes(permission);
}

export function isPrivilegedRole(role?: string | null): boolean {
  return getRoleConfig(role).isPrivileged;
}
