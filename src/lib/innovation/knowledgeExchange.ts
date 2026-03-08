import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeListing {
  id: string;
  author_id: string;
  institution_id: string | null;
  title: string;
  description: string | null;
  category: string;
  domain: string;
  content_type: string;
  price: number;
  is_open_access: boolean;
  download_count: number;
  rating_avg: number;
  rating_count: number;
  tags: string[];
  status: string;
  created_at: string;
}

export async function fetchKnowledgeListings(category?: string) {
  let query = supabase.from("knowledge_exchange_listings").select("*").eq("status", "published").order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as KnowledgeListing[];
}

export async function createKnowledgeListing(listing: Record<string, any>) {
  const { data, error } = await supabase.from("knowledge_exchange_listings").insert([listing]).select().single();
  if (error) throw error;
  return data;
}

export async function purchaseKnowledge(listingId: string, buyerId: string, amount: number) {
  const { data, error } = await supabase.from("knowledge_exchange_purchases").insert([{
    listing_id: listingId,
    buyer_id: buyerId,
    amount_paid: amount,
  }]).select().single();
  if (error) throw error;
  return data;
}

export function getExchangeAnalytics(listings: KnowledgeListing[]) {
  const totalListings = listings.length;
  const totalDownloads = listings.reduce((s, l) => s + l.download_count, 0);
  const openAccessCount = listings.filter(l => l.is_open_access).length;
  const byCategory = listings.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return { totalListings, totalDownloads, openAccessCount, byCategory };
}
