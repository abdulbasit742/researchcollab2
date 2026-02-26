import { supabase } from "@/integrations/supabase/client";

/**
 * API Key Service — generate, validate, and revoke partner API keys.
 * Uses existing partner_api_keys table.
 */

function generateSecureKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const prefix = "rcol_";
  let key = prefix;
  const array = new Uint8Array(40);
  crypto.getRandomValues(array);
  for (const byte of array) {
    key += chars[byte % chars.length];
  }
  return key;
}

export async function generateApiKey(
  partnerId: string,
  permissions?: Record<string, boolean>,
  rateLimit = 1000
): Promise<{ key: string; id: string }> {
  const apiKey = generateSecureKey();

  const { data, error } = await supabase
    .from("partner_api_keys")
    .insert({
      partner_id: partnerId,
      api_key: apiKey,
      status: "active",
      rate_limit: rateLimit,
      scope_permissions: permissions ?? { read: true, write: false },
      expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return { key: apiKey, id: data.id };
}

export async function revokeApiKey(keyId: string): Promise<void> {
  const { error } = await supabase
    .from("partner_api_keys")
    .update({ status: "revoked" })
    .eq("id", keyId);
  if (error) throw error;
}

export async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  partnerId?: string;
  permissions?: Record<string, boolean>;
}> {
  const { data, error } = await supabase
    .from("partner_api_keys")
    .select("id, partner_id, status, expiration_date, scope_permissions, rate_limit, total_calls")
    .eq("api_key", apiKey)
    .maybeSingle();

  if (error || !data) return { valid: false };

  if (data.status !== "active") return { valid: false };

  if (data.expiration_date && new Date(data.expiration_date) < new Date()) {
    return { valid: false };
  }

  // Increment call count
  await supabase
    .from("partner_api_keys")
    .update({
      total_calls: (data.total_calls ?? 0) + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  return {
    valid: true,
    partnerId: data.partner_id,
    permissions: (data.scope_permissions as Record<string, boolean>) ?? {},
  };
}

export async function getApiKeys(partnerId: string) {
  const { data, error } = await supabase
    .from("partner_api_keys")
    .select("id, status, created_at, last_used_at, total_calls, rate_limit, expiration_date, scope_permissions")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
