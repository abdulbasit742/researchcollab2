/**
 * Region-Based Feature Flags — controls feature availability per region.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("regionFeatureFlags");

export async function isFeatureEnabled(regionId: string, featureKey: string): Promise<boolean> {
  const { data } = await (supabase as any)
    .from("region_feature_flags")
    .select("enabled")
    .eq("region_id", regionId)
    .eq("feature_key", featureKey)
    .maybeSingle();

  return data?.enabled ?? false;
}

export async function getRegionFeatures(regionId: string): Promise<Record<string, boolean>> {
  const { data } = await (supabase as any)
    .from("region_feature_flags")
    .select("feature_key, enabled")
    .eq("region_id", regionId);

  const flags: Record<string, boolean> = {};
  for (const f of data ?? []) {
    flags[f.feature_key] = f.enabled;
  }
  return flags;
}

export async function setFeatureFlag(regionId: string, featureKey: string, enabled: boolean, config?: Record<string, unknown>): Promise<void> {
  const { error } = await (supabase as any)
    .from("region_feature_flags")
    .upsert({ region_id: regionId, feature_key: featureKey, enabled, config }, { onConflict: "region_id,feature_key" });

  if (error) throw new Error(`Failed to set feature flag: ${error.message}`);
  log.info("Feature flag updated", { regionId, featureKey, enabled });
}

// Common feature keys
export const FEATURE_KEYS = {
  CAPITAL_POOLS: "capital_pools",
  SUBSCRIPTIONS: "subscriptions",
  ADVANCED_ANALYTICS: "advanced_analytics",
  AI_MATCHING: "ai_matching",
  CROSS_BORDER_DEALS: "cross_border_deals",
  EXPERIMENTAL_UI: "experimental_ui",
} as const;
