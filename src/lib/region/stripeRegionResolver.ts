/**
 * Stripe Region Resolver — routes Stripe operations to correct regional account.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("stripeRegionResolver");

export interface RegionalStripeConfig {
  regionId: string;
  regionCode: string;
  stripeAccountId: string | null;
  stripeWebhookSecret: string | null;
  currency: string;
}

export async function resolveStripeConfig(tenantId: string): Promise<RegionalStripeConfig> {
  const { data: tenant } = await (supabase as any)
    .from("tenants")
    .select("region_id")
    .eq("id", tenantId)
    .single();

  if (!tenant?.region_id) {
    log.warn("Tenant has no region, using default Stripe config", { tenantId });
    return { regionId: "", regionCode: "default", stripeAccountId: null, stripeWebhookSecret: null, currency: "USD" };
  }

  const { data: region } = await (supabase as any)
    .from("regions")
    .select("id, code, stripe_account_id, stripe_webhook_secret, currency_default")
    .eq("id", tenant.region_id)
    .single();

  if (!region) {
    throw new Error("Region not found for tenant");
  }

  return {
    regionId: region.id,
    regionCode: region.code,
    stripeAccountId: region.stripe_account_id,
    stripeWebhookSecret: region.stripe_webhook_secret,
    currency: region.currency_default,
  };
}

export function assertNoCorssRegionPayment(payerRegionId: string, recipientRegionId: string): void {
  if (payerRegionId !== recipientRegionId) {
    log.error("Cross-region payment blocked", { payerRegionId, recipientRegionId });
    throw new Error("Cross-region payment routing is not allowed. Both parties must be in the same region.");
  }
}
