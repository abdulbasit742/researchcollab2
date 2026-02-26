/**
 * Region Manager — multi-region routing, failover, and connection resolution.
 *
 * Environment variables (optional):
 *   VITE_REGION_PRIMARY, VITE_REGION_SECONDARY, VITE_REGION_FALLBACK
 *
 * In a single-Supabase setup, this provides the abstraction layer
 * for future multi-region deployment without code changes.
 */

export type Region = "pk-south" | "us-east" | "eu-west" | "ap-southeast" | "me-central";

interface RegionConfig {
  primary: Region;
  secondary: Region;
  fallback: Region;
  current: Region;
}

const DEFAULT_CONFIG: RegionConfig = {
  primary: "pk-south",
  secondary: "us-east",
  fallback: "eu-west",
  current: "pk-south",
};

let cachedConfig: RegionConfig | null = null;

export function getRegionConfig(): RegionConfig {
  if (cachedConfig) return cachedConfig;

  cachedConfig = {
    primary: (import.meta.env.VITE_REGION_PRIMARY as Region) || DEFAULT_CONFIG.primary,
    secondary: (import.meta.env.VITE_REGION_SECONDARY as Region) || DEFAULT_CONFIG.secondary,
    fallback: (import.meta.env.VITE_REGION_FALLBACK as Region) || DEFAULT_CONFIG.fallback,
    current: detectRegion(),
  };

  return cachedConfig;
}

function detectRegion(): Region {
  // Browser timezone-based region detection
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.startsWith("Asia/Karachi") || tz.startsWith("Asia/Kolkata")) return "pk-south";
    if (tz.startsWith("America/")) return "us-east";
    if (tz.startsWith("Europe/")) return "eu-west";
    if (tz.startsWith("Asia/Singapore") || tz.startsWith("Asia/Tokyo") || tz.startsWith("Australia/")) return "ap-southeast";
    if (tz.startsWith("Asia/Dubai") || tz.startsWith("Asia/Riyadh")) return "me-central";
  } catch {
    // fallback
  }
  return DEFAULT_CONFIG.primary;
}

export function getActiveRegion(): Region {
  return getRegionConfig().current;
}

export function getRegionFallbackChain(): Region[] {
  const config = getRegionConfig();
  return [config.primary, config.secondary, config.fallback].filter(
    (r, i, arr) => arr.indexOf(r) === i
  );
}

export function isRegionAvailable(region: Region): boolean {
  // Placeholder — in production, this would ping region health endpoints
  return true;
}

export function resolveRegion(): Region {
  const chain = getRegionFallbackChain();
  for (const region of chain) {
    if (isRegionAvailable(region)) return region;
  }
  return DEFAULT_CONFIG.fallback;
}
