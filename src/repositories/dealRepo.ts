/**
 * Deal Repository — pure data access for deal_rooms.
 */

import { supabase } from "@/integrations/supabase/client";

export interface DealRecord {
  id: string;
  buyer_id: string;
  seller_id: string;
  title: string;
  status: string;
  agreed_amount: number | null;
  escrow_amount: number | null;
  escrow_status: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export const dealRepo = {
  async findById(dealId: string): Promise<DealRecord | null> {
    const { data, error } = await supabase
      .from("deal_rooms")
      .select("id, buyer_id, seller_id, title, status, agreed_amount, escrow_amount, escrow_status, created_at, updated_at, completed_at")
      .eq("id", dealId)
      .single();
    if (error) return null;
    return data as DealRecord;
  },

  async updateStatus(dealId: string, status: string, extra?: Record<string, unknown>): Promise<DealRecord> {
    const { data, error } = await supabase
      .from("deal_rooms")
      .update({ status, updated_at: new Date().toISOString(), ...extra } as any)
      .eq("id", dealId)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DealRecord;
  },

  async updateEscrowState(dealId: string, escrowStatus: string, escrowAmount: number): Promise<DealRecord> {
    const { data, error } = await supabase
      .from("deal_rooms")
      .update({
        escrow_status: escrowStatus,
        escrow_amount: escrowAmount,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", dealId)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as DealRecord;
  },

  async findByParticipant(userId: string): Promise<DealRecord[]> {
    const { data, error } = await supabase
      .from("deal_rooms")
      .select("id, buyer_id, seller_id, title, status, agreed_amount, escrow_amount, escrow_status, created_at, updated_at, completed_at")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DealRecord[];
  },
};
