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
  project_id: string | null;
  title: string;
  status: "negotiating" | "agreed" | "in_progress" | "completed" | "cancelled" | "disputed";
  initiator_id: string;
  counterparty_id: string;
  created_at: string;
  updated_at: string;
  // Scope
  scope_description: string | null;
  deliverables: string[];
  // Financial
  agreed_amount: number | null;
  escrow_locked: number;
  escrow_released: number;
  // Timeline
  agreed_deadline: string | null;
  actual_completion: string | null;
  // Decision log
  decision_log: DealDecision[];
  // Files
  files: DealFile[];
  // Milestones
  milestones: DealMilestone[];
  // Joined data
  initiator_name?: string;
  counterparty_name?: string;
  project_title?: string;
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

      // Fetch accountability records as deal rooms
      const { data: records, error } = await supabase
        .from("accountability_records")
        .select("*")
        .or(`initiator_id.eq.${user.id},executor_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Enrich with profile data
      const dealRooms: DealRoom[] = await Promise.all(
        (records || []).map(async (record: any) => {
          const isInitiator = record.initiator_id === user.id;
          const otherParticipantId = isInitiator ? record.executor_id : record.initiator_id;
          
          // Get other participant's name
          const { data: otherProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", otherParticipantId)
            .maybeSingle();

          // Get project info if exists
          let projectTitle = null;
          if (record.project_id) {
            const { data: project } = await supabase
              .from("earning_projects")
              .select("title")
              .eq("id", record.project_id)
              .maybeSingle();
            projectTitle = project?.title;
          }

          const status = record.outcome_status === "completed" ? "completed" :
            record.outcome_status === "failed" ? "disputed" :
            record.outcome_status === "disputed" ? "disputed" :
            record.escrow_locked_at ? "in_progress" :
            "negotiating";

          return {
            id: record.id,
            project_id: record.project_id,
            title: projectTitle || `Deal with ${otherProfile?.full_name || "Unknown"}`,
            status: status as DealRoom["status"],
            initiator_id: record.initiator_id,
            counterparty_id: otherParticipantId,
            created_at: record.created_at,
            updated_at: record.updated_at,
            scope_description: null,
            deliverables: record.promised_deliverables || [],
            agreed_amount: record.escrow_amount,
            escrow_locked: record.escrow_amount || 0,
            escrow_released: record.total_paid || 0,
            agreed_deadline: record.deadline,
            actual_completion: record.escrow_released_at,
            decision_log: [],
            files: [],
            milestones: [],
            initiator_name: isInitiator ? "You" : otherProfile?.full_name || "Unknown",
            counterparty_name: isInitiator ? (otherProfile?.full_name || "Unknown") : "You",
            project_title: projectTitle,
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

      // This would fetch from a dedicated deal_rooms table when implemented
      // For now, return null
      return null;
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

      // Create accountability record as the deal room
      const { data: record, error } = await supabase
        .from("accountability_records")
        .insert({
          initiator_id: user.id,
          executor_id: data.counterparty_id,
          project_id: data.project_id || null,
          collaboration_type: "deal",
          promised_deliverables: data.deliverables,
          deadline: data.deadline || null,
          escrow_amount: data.proposed_amount,
          outcome_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      queryClient.invalidateQueries({ queryKey: ["accountabilityRecords"] });
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

      // Update the accountability record with new proposal
      const { error } = await supabase
        .from("accountability_records")
        .update({
          escrow_amount: data.amount,
          promised_deliverables: data.deliverables,
          deadline: data.deadline || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.room_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      queryClient.invalidateQueries({ queryKey: ["accountabilityRecords"] });
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
      amount: number;
      deliverables: string[];
      deadline?: string;
      counterparty_id: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Update the existing accountability record to lock escrow
      const { error } = await supabase
        .from("accountability_records")
        .update({
          escrow_amount: data.amount,
          escrow_locked_at: new Date().toISOString(),
          outcome_status: "in_progress",
          promised_deliverables: data.deliverables,
          deadline: data.deadline || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.room_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealRooms"] });
      queryClient.invalidateQueries({ queryKey: ["accountabilityRecords"] });
      toast.success("Deal accepted and escrow locked");
    },
  });
}
