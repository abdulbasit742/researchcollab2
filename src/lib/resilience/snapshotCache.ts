/**
 * Snapshot Cache — DB-backed cache for read-heavy derived analytics.
 * Never caches wallet balances or escrow state.
 */

import { supabase } from "@/integrations/supabase/client";

export async function getSnapshot<T>(key: string): Promise<T | null> {
  try {
    const { data } = await (supabase as any)
      .from("cached_snapshots")
      .select("snapshot_data, expires_at")
      .eq("snapshot_key", key)
      .maybeSingle();
    if (!data) return null;
    if (new Date(data.expires_at) < new Date()) return null;
    return data.snapshot_data as T;
  } catch {
    return null;
  }
}

export async function setSnapshot(
  key: string,
  data: Record<string, unknown>,
  ttlMinutes: number = 5,
  entityType?: string,
  entityId?: string
): Promise<void> {
  const expires = new Date(Date.now() + ttlMinutes * 60_000).toISOString();
  try {
    await (supabase as any).from("cached_snapshots").upsert({
      snapshot_key: key,
      snapshot_data: data,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      expires_at: expires,
      generated_at: new Date().toISOString(),
    }, { onConflict: "snapshot_key" });
  } catch { /* silent */ }
}
