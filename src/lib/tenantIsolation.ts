import { supabase } from "@/integrations/supabase/client";

/**
 * Tenant Isolation — ensures organization data is scoped by org_id.
 *
 * Middleware-like validation for multi-tenant queries.
 * All org-scoped operations must pass through these guards.
 */

export async function validateOrgMembership(
  userId: string,
  orgId: string,
  requiredRole?: string
): Promise<{ authorized: boolean; role?: string; reason?: string }> {
  const { data, error } = await supabase
    .from("organization_members")
    .select("role, status")
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { authorized: false, reason: "Membership check failed" };
  if (!data) return { authorized: false, reason: "Not a member of this organization" };
  if (data.status !== "active") return { authorized: false, reason: "Membership not active" };

  if (requiredRole && data.role !== requiredRole && data.role !== "admin") {
    return { authorized: false, reason: `Requires ${requiredRole} role` };
  }

  return { authorized: true, role: data.role };
}

export async function validateOrgAdmin(userId: string, orgId: string): Promise<boolean> {
  const result = await validateOrgMembership(userId, orgId, "admin");
  return result.authorized;
}

export async function getOrgScopedDeals(orgId: string) {
  // Get all org member IDs
  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("org_id", orgId)
    .eq("status", "active");

  const memberIds = (members ?? []).map(m => m.user_id);
  if (memberIds.length === 0) return [];

  const { data, error } = await supabase
    .from("deal_rooms")
    .select("*")
    .or(memberIds.slice(0, 50).map(id => `buyer_id.eq.${id},seller_id.eq.${id}`).join(","))
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data ?? [];
}

export async function getOrgScopedWallets(orgId: string) {
  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("org_id", orgId)
    .eq("status", "active");

  const memberIds = (members ?? []).map(m => m.user_id);
  if (memberIds.length === 0) return [];

  const { data, error } = await supabase
    .from("wallets")
    .select("user_id, available_balance, escrow_balance, total_earned")
    .in("user_id", memberIds.slice(0, 100));

  if (error) throw error;
  return data ?? [];
}

export async function getOrgScopedMetrics(orgId: string) {
  const [deals, wallets] = await Promise.all([
    getOrgScopedDeals(orgId),
    getOrgScopedWallets(orgId),
  ]);

  const totalDealVolume = deals.reduce((s, d) => s + (d.agreed_amount ?? 0), 0);
  const completedDeals = deals.filter(d => d.status === "completed").length;
  const totalBalance = wallets.reduce((s, w) => s + (w.available_balance ?? 0), 0);
  const totalEscrow = wallets.reduce((s, w) => s + (w.escrow_balance ?? 0), 0);

  return {
    totalDeals: deals.length,
    completedDeals,
    completionRate: deals.length > 0 ? Math.round((completedDeals / deals.length) * 100) : 0,
    totalDealVolume,
    totalBalance,
    totalEscrow,
    memberCount: wallets.length,
  };
}
