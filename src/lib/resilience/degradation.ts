/**
 * Graceful Degradation — system load awareness for UI adaptation.
 * Read-only. No business logic mutation.
 */

import { supabase } from "@/integrations/supabase/client";

export type LoadLevel = "normal" | "elevated" | "high" | "critical";

let cachedLoadLevel: LoadLevel = "normal";
let lastCheck = 0;
const CHECK_INTERVAL = 30_000;

export async function getCurrentLoadLevel(): Promise<LoadLevel> {
  if (Date.now() - lastCheck < CHECK_INTERVAL) return cachedLoadLevel;
  try {
    const { data } = await (supabase as any)
      .from("system_load_state")
      .select("current_load_level")
      .order("detected_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    cachedLoadLevel = (data?.current_load_level as LoadLevel) ?? "normal";
    lastCheck = Date.now();
  } catch {
    cachedLoadLevel = "normal";
  }
  return cachedLoadLevel;
}

export function shouldReduceAnimations(level: LoadLevel): boolean {
  return level === "high" || level === "critical";
}

export function shouldDeferAnalytics(level: LoadLevel): boolean {
  return level === "high" || level === "critical";
}

export function shouldReducePolling(level: LoadLevel): boolean {
  return level !== "normal";
}

export function getPollingInterval(level: LoadLevel, baseMs: number): number {
  switch (level) {
    case "normal": return baseMs;
    case "elevated": return baseMs * 2;
    case "high": return baseMs * 4;
    case "critical": return baseMs * 8;
  }
}
