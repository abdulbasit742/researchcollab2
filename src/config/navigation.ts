import {
  ADMIN_ROLES,
  GOVERNANCE_ROLES,
  INSTITUTION_ROLES,
  SPONSOR_ROLES,
  type AppRole,
} from "@/config/roles";

export type NavIconKey =
  | "home"
  | "projects"
  | "opportunities"
  | "messages"
  | "research"
  | "reviews"
  | "search"
  | "discover"
  | "grants"
  | "admin"
  | "institution"
  | "sponsor"
  | "governance"
  | "national"
  | "wallet";

export type RoleNavItem = {
  label: string;
  href: string;
  icon: NavIconKey;
  roles?: AppRole[];
  description?: string;
};

export type RoleNavGroup = {
  label: string;
  items: RoleNavItem[];
};

const STUDENT_RESEARCHER_ROLES: AppRole[] = ["student", "researcher"];

export const ROLE_NAV_ITEMS: RoleNavItem[] = [
  { label: "Dashboard", href: "/home", icon: "home" },
  { label: "Projects", href: "/deals", icon: "projects" },
  { label: "Opportunities", href: "/offers", icon: "opportunities" },
  { label: "Messages", href: "/messages", icon: "messages" },
  { label: "Research", href: "/research", icon: "research", roles: STUDENT_RESEARCHER_ROLES },
  { label: "Grants", href: "/grants", icon: "grants", roles: ["researcher", "sponsor_admin", "tenant_admin"] },
  { label: "Wallet", href: "/wallet", icon: "wallet", roles: ["student", "researcher", "sponsor_admin"] },
  { label: "Admin", href: "/admin", icon: "admin", roles: ADMIN_ROLES },
  { label: "Institution", href: "/institution-control", icon: "institution", roles: INSTITUTION_ROLES },
  { label: "Sponsor", href: "/sponsor-dashboard", icon: "sponsor", roles: SPONSOR_ROLES },
  { label: "Governance", href: "/governance", icon: "governance", roles: GOVERNANCE_ROLES },
  { label: "National", href: "/national-oversight", icon: "national", roles: ["government_admin"] },
];

export const ROLE_NAV_GROUPS: RoleNavGroup[] = [
  {
    label: "Execution",
    items: [
      { label: "Dashboard", href: "/home", icon: "home" },
      { label: "Projects", href: "/deals", icon: "projects" },
      { label: "Opportunities", href: "/offers", icon: "opportunities" },
      { label: "Reviews", href: "/reviews", icon: "reviews" },
    ],
  },
  {
    label: "Collaboration",
    items: [
      { label: "Messages", href: "/messages", icon: "messages" },
      { label: "Search", href: "/search", icon: "search" },
      { label: "Discover", href: "/discover", icon: "discover" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { label: "Research", href: "/research", icon: "research", roles: STUDENT_RESEARCHER_ROLES },
      { label: "Grants", href: "/grants", icon: "grants", roles: ["researcher", "sponsor_admin", "tenant_admin"] },
    ],
  },
  {
    label: "Role Workspace",
    items: [
      { label: "Admin", href: "/admin", icon: "admin", roles: ADMIN_ROLES },
      { label: "Institution", href: "/institution-control", icon: "institution", roles: INSTITUTION_ROLES },
      { label: "Sponsor", href: "/sponsor-dashboard", icon: "sponsor", roles: SPONSOR_ROLES },
      { label: "Governance", href: "/governance", icon: "governance", roles: GOVERNANCE_ROLES },
      { label: "National", href: "/national-oversight", icon: "national", roles: ["government_admin"] },
    ],
  },
];

export function canViewNavItem(item: RoleNavItem, role?: AppRole | null): boolean {
  if (!item.roles?.length) return true;
  if (!role) return false;
  return item.roles.includes(role);
}

export function getRoleNavItems(role?: AppRole | null): RoleNavItem[] {
  return ROLE_NAV_ITEMS.filter((item) => canViewNavItem(item, role));
}

export function getPrimaryRoleNavItems(role?: AppRole | null, limit = 5): RoleNavItem[] {
  return getRoleNavItems(role).slice(0, limit);
}

export function getRoleNavGroups(role?: AppRole | null): RoleNavGroup[] {
  return ROLE_NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canViewNavItem(item, role)),
    }))
    .filter((group) => group.items.length > 0);
}
