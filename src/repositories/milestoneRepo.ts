/**
 * Milestone Repository — pure data access.
 */

import { supabase } from "@/integrations/supabase/client";

export interface MilestoneRecord {
  id: string;
  offer_id: string;
  deal_id: string | null;
  escrow_id: string | null;
  title: string;
  amount: number;
  status: string;
  deliverable_url: string | null;
  approved_at: string | null;
  approved_by: string | null;
  released_at: string | null;
  created_at: string;
  updated_at: string;
}

export const milestoneRepo = {
  async findById(milestoneId: string): Promise<MilestoneRecord | null> {
    const { data, error } = await (supabase as any)
      .from("milestones")
      .select("*")
      .eq("id", milestoneId)
      .single();
    if (error) return null;
    return data;
  },

  async findByDealId(dealId: string): Promise<MilestoneRecord[]> {
    const { data, error } = await (supabase as any)
      .from("milestones")
      .select("*")
      .eq("deal_id", dealId)
      .order("order_index", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async findByEscrowId(escrowId: string): Promise<MilestoneRecord[]> {
    const { data, error } = await (supabase as any)
      .from("milestones")
      .select("*")
      .eq("escrow_id", escrowId)
      .order("order_index", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async updateStatus(
    milestoneId: string,
    status: string,
    extra?: Record<string, unknown>
  ): Promise<MilestoneRecord> {
    const { data, error } = await (supabase as any)
      .from("milestones")
      .update({ status, updated_at: new Date().toISOString(), ...extra })
      .eq("id", milestoneId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async sumByEscrowId(escrowId: string): Promise<number> {
    const milestones = await milestoneRepo.findByEscrowId(escrowId);
    return milestones.reduce((sum, m) => sum + (m.amount ?? 0), 0);
  },
};
