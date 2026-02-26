/**
 * Tenant Context — derives tenant from user session, never from client request body.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("tenantContext");

const GLOBAL_TENANT_ID = "00000000-0000-0000-0000-000000000001";

let cachedTenantId: string | null = null;

/**
 * Get the current user's tenant_id from their profile.
 * Falls back to global tenant if unset.
 */
export async function getCurrentTenantId(): Promise<string> {
  if (cachedTenantId) return cachedTenantId;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return GLOBAL_TENANT_ID;

  const { data } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();

  cachedTenantId = (data?.tenant_id as string) ?? GLOBAL_TENANT_ID;
  return cachedTenantId;
}

/**
 * Set current tenant (used on login / tenant switch).
 */
export function setCurrentTenantId(tenantId: string): void {
  cachedTenantId = tenantId;
  log.info("Tenant context set", { tenantId });
}

/**
 * Clear cached tenant (on logout).
 */
export function clearTenantContext(): void {
  cachedTenantId = null;
}

/**
 * Assert that a user belongs to the given tenant.
 */
export async function assertTenantAccess(userId: string, tenantId: string): Promise<void> {
  const { data } = await supabase
    .from("tenant_memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) {
    throw new Error(`Access denied: user ${userId} is not a member of tenant ${tenantId}`);
  }
}

/**
 * Get all tenants a user belongs to.
 */
export async function getUserTenants(userId: string) {
  const { data } = await supabase
    .from("tenant_memberships")
    .select("tenant_id, role, tenants:tenant_id(id, name, type, slug, status)")
    .eq("user_id", userId)
    .eq("is_active", true);

  return data ?? [];
}

export const GLOBAL_TENANT = GLOBAL_TENANT_ID;
