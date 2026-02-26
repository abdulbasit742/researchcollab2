/**
 * Governance Role Enforcement — checks governance-specific roles.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("governanceRoles");

export type GovernanceRole = "government_admin" | "compliance_officer" | "tenant_admin" | "sponsor_admin" | "admin";

export async function assertGovernanceRole(userId: string, requiredRole: GovernanceRole): Promise<void> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (!data) throw new Error("No role assigned");

  const role = data.role as string;
  if (role !== requiredRole && role !== "admin") {
    log.warn("Governance role check failed", { userId, required: requiredRole, actual: role });
    throw new Error(`Governance access denied: requires ${requiredRole} role`);
  }
}

export async function assertGovernmentAdmin(userId: string): Promise<void> {
  await assertGovernanceRole(userId, "government_admin");
}

export async function hasGovernanceRole(userId: string, role: GovernanceRole): Promise<boolean> {
  try {
    await assertGovernanceRole(userId, role);
    return true;
  } catch {
    return false;
  }
}
