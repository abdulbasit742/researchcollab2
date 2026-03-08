/**
 * Dataset Marketplace — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getDatasetListings(category?: string) {
  let q = (supabase as any).from("dataset_listings").select("*").eq("status", "active").order("created_at", { ascending: false });
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createDatasetListing(input: {
  owner_id: string; title: string; description?: string; category: string;
  data_format?: string; record_count?: number; price_amount?: number;
  license_type?: string; tags?: string[];
}) {
  const { data, error } = await (supabase as any).from("dataset_listings")
    .insert({ ...input, status: "active" }).select().single();
  if (error) throw error;
  return data;
}

export async function purchaseDataset(dataset_id: string, buyer_id: string, amount: number) {
  const platformFee = amount * 0.2; // 20% marketplace fee
  const { data, error } = await (supabase as any).from("dataset_purchases")
    .insert({ dataset_id, buyer_id, amount_paid: amount, platform_fee: platformFee }).select().single();
  if (error) throw error;
  return data;
}

export const DATASET_CATEGORIES = [
  "Medical Imaging", "Satellite Agriculture", "Urban Mobility", "Climate Modeling",
  "Genomics", "Financial Markets", "NLP Corpus", "Computer Vision", "IoT Sensors",
];
