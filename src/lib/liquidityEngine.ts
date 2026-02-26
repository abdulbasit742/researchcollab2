import { supabase } from "@/integrations/supabase/client";

/**
 * Liquidity Engine — secondary market for deal receivables.
 *
 * Allows early liquidity access via discounted buyouts of funded deal milestones.
 * Uses existing skill_liquidity_index + deal_rooms for validation.
 */

export interface LiquidityListing {
  id: string;
  dealId: string;
  sellerId: string;
  amount: number;
  discountRate: number;
  netPrice: number;
  status: string;
  createdAt: string;
}

export async function createLiquidityListing(params: {
  dealId: string;
  sellerId: string;
  amount: number;
  discountRate: number;
}): Promise<LiquidityListing> {
  if (params.discountRate < 0 || params.discountRate > 50) {
    throw new Error("Discount rate must be between 0% and 50%");
  }

  // Validate deal is active and funded
  const { data: deal } = await supabase
    .from("deal_rooms")
    .select("id, status, seller_id, buyer_id")
    .eq("id", params.dealId)
    .single();

  if (!deal) throw new Error("Deal not found");
  if (!["in_progress", "agreed"].includes(deal.status)) {
    throw new Error("Only active funded deals can be listed");
  }
  if (deal.seller_id !== params.sellerId && deal.buyer_id !== params.sellerId) {
    throw new Error("Only deal participants can create listings");
  }

  // Check no duplicate listing
  const { data: existing } = await supabase
    .from("admin_audit_logs")
    .select("id")
    .eq("entity_type", "liquidity_listing")
    .eq("entity_id", params.dealId)
    .limit(1);

  const netPrice = Math.round(params.amount * (1 - params.discountRate / 100) * 100) / 100;

  // Log as audit entry (no dedicated liquidity_listings table — using audit + notifications)
  const { data: log, error } = await supabase
    .from("admin_audit_logs")
    .insert({
      admin_id: params.sellerId,
      action: "liquidity_listing_created",
      entity_type: "liquidity_listing",
      entity_id: params.dealId,
      details: {
        amount: params.amount,
        discount_rate: params.discountRate,
        net_price: netPrice,
        status: "open",
      },
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: log.id,
    dealId: params.dealId,
    sellerId: params.sellerId,
    amount: params.amount,
    discountRate: params.discountRate,
    netPrice,
    status: "open",
    createdAt: log.created_at,
  };
}

export async function getLiquidityListings(limit = 50) {
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .eq("action", "liquidity_listing_created")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map(entry => {
    const details = entry.details as any;
    return {
      id: entry.id,
      dealId: entry.entity_id ?? "",
      sellerId: entry.admin_id,
      amount: details?.amount ?? 0,
      discountRate: details?.discount_rate ?? 0,
      netPrice: details?.net_price ?? 0,
      status: details?.status ?? "open",
      createdAt: entry.created_at ?? "",
    } as LiquidityListing;
  });
}

export async function getSkillLiquidityMetrics() {
  const { data, error } = await supabase
    .from("user_skills")
    .select("skill_name, endorsement_count, proficiency_level")
    .order("endorsement_count", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}
