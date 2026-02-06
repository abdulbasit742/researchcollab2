import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// DEAL ROOM SYSTEM: STRUCTURED TRANSACTION FLOWS
// =====================================================

export interface DealRoom {
  id: string;
  offer_id: string | null;
  title: string;
  status: "negotiating" | "agreed" | "in_progress" | "completed" | "cancelled" | "disputed";
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  // Financial
  agreed_amount: number | null;
  escrow_amount: number | null;
  escrow_status: string | null;
  // Timeline
  completed_at: string | null;
  // Structured data
  milestones: any[];
  terms: Record<string, any> | null;
  metadata: Record<string, any> | null;
  // Derived display fields
  counterparty_name?: string;
  deliverables: string[];
  escrow_locked: number;
  escrow_released: number;
  agreed_deadline: string | null;
  project_title?: string;
  initiator_name?: string;
  decision_log: any[];
  files: any[];
  initiator_id: string;
  counterparty_id: string;
  project_id: string | null;
  actual_completion: string | null;
  scope_description: string | null;
}

export interface DealDecision {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_name?: string;
  decision_type: "proposal" | "counter" | "accept" | "reject" | "milestone" | "dispute" | "complete";
  description: string;
  amount?: number;
  is_binding: boolean;
}

export interface DealFile {
  id: string;
  name: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
  file_type: string;
}

export interface DealMilestone {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  due_date: string | null;
  status: "pending" | "in_progress" | "submitted" | "approved" | "rejected";
  submitted_at: string | null;
  approved_at: string | null;
  order_index: number;
}

export function useDealRooms() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dealRooms", user?.id],
    queryFn: async (): Promise<DealRoom[]> => {
      if (!user) return [];

      // Query the actual deal_rooms table
      const { data: rooms, error } = await supabase
        .from("deal_rooms")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Enrich with profile data
      const dealRooms: DealRoom[] = await Promise.all(
        (rooms || []).map(async (room: any) => {
          const isBuyer = room.buyer_id === user.id;
          const otherParticipantId = isBuyer ? room.seller_id : room.buyer_id;

          // Get other participant's name
          const { data: otherProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", otherParticipantId)
            .maybeSingle();

          // Map DB status to our status type
          const status = (room.status || "negotiating") as DealRoom["status"];

          // Extract deliverables from terms if available
          const terms = room.terms as Record<string, any> | null;
          const deliverables: string[] = terms?.deliverables || [];

          return {
            id: room.id,
            offer_id: room.offer_id,
            title: room.title,
            status,
            buyer_id: room.buyer_id,
            seller_id: room.seller_id,
            created_at: room.created_at,
            updated_at: room.updated_at,
            agreed_amount: room.agreed_amount,
            escrow_amount: room.escrow_amount,
            escrow_status: room.escrow_status,
            completed_at: room.completed_at,
            milestones: (room.milestones as any[]) || [],
            terms: terms,
            metadata: room.metadata as Record<string, any> | null,
            // Derived fields for backward compatibility
            counterparty_name: isBuyer ? (otherProfile?.full_name || "Unknown") : "You",
            initiator_name: isBuyer ? "You" : (otherProfile?.full_name || "Unknown"),
            deliverables,
            escrow_locked: room.escrow_amount || 0,
            escrow_released: room.escrow_status === "released" ? (room.escrow_amount || 0) : 0,
            agreed_deadline: terms?.deadline || null,
            project_title: room.title,
            decision_log: [],
            files: [],
            initiator_id: room.buyer_id,
            counterparty_id: room.seller_id,
            project_id: room.offer_id,
            actual_completion: room.completed_at,
            scope_description: terms?.scope || null,
          } as DealRoom;
        })
      );

      return dealRooms;
    },
    enabled: !!user,
  });
}

export function useDealRoom(roomId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dealRoom", roomId],
    queryFn: async () => {
      if (!user || !roomId) return null;

      const { data, error } = await supabase
        .from("deal_rooms")
        .select("*")
        .eq("id", roomId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!roomId,
  });
}

export function useCreateDealRoom() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      counterparty_id: string;
      project_id?: string;
      title: string;
      scope_description: string;
      proposed_amount: number;
      deliverables: string[];
      deadline?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: record, error } = await supabase
        .from("deal_rooms")
        .insert({
          buyer_id: user.id,
          seller_id: data.counterparty_id,
          offer_id: data.project_id || null,
          title: data.title,
          status: "negotiating",
          agreed_amount: data.proposed_amount,
          terms: {
            scope: data.scope_description,
            deliverables: data.deliverables,
            deadline: data.deadline || null,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      toast.success("Deal room created");
    },
    onError: (error) => {
      toast.error(`Failed to create deal room: ${error.message}`);
    },
  });
}

export function useSubmitProposal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      room_id: string;
      amount: number;
      deliverables: string[];
      deadline?: string;
      message?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("deal_rooms")
        .update({
          agreed_amount: data.amount,
          terms: {
            deliverables: data.deliverables,
            deadline: data.deadline || null,
            message: data.message || null,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.room_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      toast.success("Proposal submitted");
    },
  });
}

export function useAcceptDeal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      room_id: string;
      offer_id: string;
      amount: number;
      deliverables: string[];
      deadline?: string;
      counterparty_id: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Call deal-runtime edge function to atomically lock escrow
      const { data: runtimeResult, error: runtimeError } = await supabase.functions.invoke(
        "deal-runtime",
        {
          body: {
            action: "activate_deal",
            deal_id: data.offer_id,
            user_id: user.id,
          },
        }
      );

      if (runtimeError) throw new Error(`Escrow lock failed: ${runtimeError.message}`);
      if (runtimeResult?.error) throw new Error(runtimeResult.error);

      // Update deal room to reflect locked status
      const { error } = await supabase
        .from("deal_rooms")
        .update({
          agreed_amount: data.amount,
          escrow_amount: data.amount,
          escrow_status: "locked",
          status: "in_progress",
          terms: {
            deliverables: data.deliverables,
            deadline: data.deadline || null,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.room_id);

      if (error) throw error;

      return runtimeResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      const escrowInfo = result?.escrow;
      toast.success(
        escrowInfo
          ? `Deal accepted! PKR ${escrowInfo.locked_amount?.toLocaleString()} locked in escrow.`
          : "Deal accepted and escrow locked"
      );
    },
    onError: (error) => {
      toast.error(`Failed to accept deal: ${error.message}`);
    },
  });
}
