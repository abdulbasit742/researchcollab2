/**
 * Institutional API Trust Gateway — tiered access, rate limiting, abuse detection.
 */

import { supabase } from "@/integrations/supabase/client";
import { getExternalInterface, logIntegrationAccess, type TrustTier } from "./sovereignInterface";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("apiTrustGateway");

const RATE_LIMITS: Record<TrustTier, number> = { basic: 50, verified: 200, trusted: 500, sovereign: 2000 };

export interface GatewayValidation {
  allowed: boolean;
  reason: string;
  remainingRequests: number;
  trustTier: TrustTier;
}

export async function validateApiAccess(interfaceId: string, action: string): Promise<GatewayValidation> {
  const iface = await getExternalInterface(interfaceId);
  if (!iface || !iface.isActive) {
    return { allowed: false, reason: "Interface not found or inactive", remainingRequests: 0, trustTier: "basic" };
  }

  // Check rate limit
  const hourAgo = new Date(Date.now() - 3600000).toISOString();
  const { data: recentLogs } = await (supabase as any).from("external_integration_logs")
    .select("id").eq("interface_id", interfaceId).gte("created_at", hourAgo);

  const limit = RATE_LIMITS[iface.trustTier] ?? 50;
  const used = recentLogs?.length ?? 0;
  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    await logIntegrationAccess(interfaceId, action, "gateway", undefined, true, "Rate limit exceeded");
    log.warn("Rate limit exceeded", { interfaceId, used, limit });
    return { allowed: false, reason: "Rate limit exceeded", remainingRequests: 0, trustTier: iface.trustTier };
  }

  // Abuse detection: burst pattern (>20 requests in 5 min)
  const fiveMinAgo = new Date(Date.now() - 300000).toISOString();
  const { data: burstLogs } = await (supabase as any).from("external_integration_logs")
    .select("id").eq("interface_id", interfaceId).gte("created_at", fiveMinAgo);

  if ((burstLogs?.length ?? 0) > 20 && iface.trustTier === "basic") {
    await logIntegrationAccess(interfaceId, action, "gateway", undefined, true, "Burst abuse detected");
    log.warn("Burst abuse detected", { interfaceId });
    return { allowed: false, reason: "Abuse pattern detected — contact support", remainingRequests: 0, trustTier: iface.trustTier };
  }

  return { allowed: true, reason: "Access granted", remainingRequests: remaining, trustTier: iface.trustTier };
}
