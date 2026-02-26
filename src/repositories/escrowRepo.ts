/**
 * Escrow Repository — pure data access layer.
 * No business logic. No invariant checks. No side effects.
 */

import { supabase } from "@/integrations/supabase/client";

export interface EscrowRecord {
  id: string;
  deal_id: string;
  sponsor_id: string;
  recipient_id: string;
  total_amount: number;
  locked_amount: number;
  released_amount: number;
  refunded_amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const escrowRepo = {
  async findById(escrowId: string): Promise<EscrowRecord | null> {
    const { data, error } = await (supabase as any)
      .from("escrows")
      .select("*")
      .eq("id", escrowId)
      .single();
    if (error) return null;
    return data;
  },

  async findByDealId(dealId: string): Promise<EscrowRecord | null> {
    const { data, error } = await (supabase as any)
      .from("escrows")
      .select("*")
      .eq("deal_id", dealId)
      .single();
    if (error) return null;
    return data;
  },

  async create(record: Omit<EscrowRecord, "id" | "created_at" | "updated_at">): Promise<EscrowRecord> {
    const { data, error } = await (supabase as any)
      .from("escrows")
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAmounts(
    escrowId: string,
    updates: Partial<Pick<EscrowRecord, "locked_amount" | "released_amount" | "refunded_amount" | "status">>
  ): Promise<EscrowRecord> {
    const { data, error } = await (supabase as any)
      .from("escrows")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", escrowId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async findActiveByUserId(userId: string): Promise<EscrowRecord[]> {
    const { data, error } = await (supabase as any)
      .from("escrows")
      .select("*")
      .or(`sponsor_id.eq.${userId},recipient_id.eq.${userId}`)
      .not("status", "in", "(completed,refunded)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};
