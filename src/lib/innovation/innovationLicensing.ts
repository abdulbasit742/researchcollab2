/**
 * Innovation License Marketplace — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getInnovationLicenses(type?: string) {
  let q = (supabase as any).from("innovation_licenses").select("*").eq("status", "active").order("created_at", { ascending: false });
  if (type) q = q.eq("innovation_type", type);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createLicense(input: {
  owner_id: string; title: string; description?: string;
  innovation_type: string; license_model?: string;
  price_amount?: number; royalty_percentage?: number; tags?: string[];
}) {
  const { data, error } = await (supabase as any).from("innovation_licenses")
    .insert({ ...input, status: "active" }).select().single();
  if (error) throw error;
  return data;
}

export async function purchaseLicense(license_id: string, buyer_id: string, amount: number) {
  const commission = amount * 0.10; // 10% platform commission
  const { data, error } = await (supabase as any).from("license_transactions")
    .insert({ license_id, buyer_id, amount_paid: amount, platform_commission: commission }).select().single();
  if (error) throw error;
  return data;
}

export const INNOVATION_TYPES = ["ai_model", "biotech", "hardware", "software", "dataset", "patent"];
export const LICENSE_MODELS = ["per_use", "subscription", "perpetual", "royalty"];
