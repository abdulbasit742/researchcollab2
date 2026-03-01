/**
 * useMilestoneActions — Submit and approve milestones with real deal lifecycle transitions.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { transitionDealState } from "@/lib/deals/dealLifecycle";
import { toast } from "sonner";

export function useSubmitMilestone() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      dealId: string;
      milestoneId: string;
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Fetch deal to get current milestones
      const { data: deal, error: fetchError } = await supabase
        .from("deal_rooms")
        .select("milestones, status")
        .eq("id", params.dealId)
        .single();

      if (fetchError || !deal) throw new Error("Deal not found");

      // Update milestone status in JSON array
      const milestones = (deal.milestones as any[]) || [];
      const updatedMilestones = milestones.map((m: any) =>
        m.id === params.milestoneId
          ? { ...m, status: "submitted", submitted_at: new Date().toISOString(), notes: params.notes }
          : m
      );

      const { error: updateError } = await supabase
        .from("deal_rooms")
        .update({
          milestones: updatedMilestones,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.dealId);

      if (updateError) throw updateError;

      // Transition deal state if in_progress
      if (deal.status === "in_progress") {
        await transitionDealState(params.dealId, "milestone_submitted", user.id);
      }

      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dealRoom"] });
      qc.invalidateQueries({ queryKey: ["dealRooms"] });
      qc.invalidateQueries({ queryKey: ["dealDecisions"] });
      toast.success("Milestone submitted for review");
    },
    onError: (err: Error) => {
      toast.error(`Submission failed: ${err.message}`);
    },
  });
}

export function useApproveMilestone() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      dealId: string;
      milestoneId: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Fetch deal
      const { data: deal, error: fetchError } = await supabase
        .from("deal_rooms")
        .select("milestones, status, buyer_id")
        .eq("id", params.dealId)
        .single();

      if (fetchError || !deal) throw new Error("Deal not found");

      // Only buyer (initiator) can approve
      if (deal.buyer_id !== user.id) {
        throw new Error("Only the deal sponsor can approve milestones");
      }

      // Update milestone
      const milestones = (deal.milestones as any[]) || [];
      const updatedMilestones = milestones.map((m: any) =>
        m.id === params.milestoneId
          ? { ...m, status: "approved", approved_at: new Date().toISOString() }
          : m
      );

      const { error: updateError } = await supabase
        .from("deal_rooms")
        .update({
          milestones: updatedMilestones,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.dealId);

      if (updateError) throw updateError;

      // Transition deal state
      if (deal.status === "milestone_submitted") {
        // Check if all milestones are approved
        const allApproved = updatedMilestones.every((m: any) => m.status === "approved");
        if (allApproved) {
          await transitionDealState(params.dealId, "milestone_approved", user.id);
          // Auto-complete if all milestones done
          await transitionDealState(params.dealId, "completed", user.id);
        } else {
          // Back to in_progress for remaining milestones
          await transitionDealState(params.dealId, "milestone_approved", user.id);
          await transitionDealState(params.dealId, "in_progress", user.id);
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dealRoom"] });
      qc.invalidateQueries({ queryKey: ["dealRooms"] });
      qc.invalidateQueries({ queryKey: ["dealDecisions"] });
      toast.success("Milestone approved — funds released");
    },
    onError: (err: Error) => {
      toast.error(`Approval failed: ${err.message}`);
    },
  });
}

export function useRejectMilestone() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      dealId: string;
      milestoneId: string;
      reason?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: deal, error: fetchError } = await supabase
        .from("deal_rooms")
        .select("milestones, status, buyer_id")
        .eq("id", params.dealId)
        .single();

      if (fetchError || !deal) throw new Error("Deal not found");
      if (deal.buyer_id !== user.id) throw new Error("Only the deal sponsor can reject milestones");

      const milestones = (deal.milestones as any[]) || [];
      const updatedMilestones = milestones.map((m: any) =>
        m.id === params.milestoneId
          ? { ...m, status: "rejected", rejection_reason: params.reason }
          : m
      );

      const { error: updateError } = await supabase
        .from("deal_rooms")
        .update({
          milestones: updatedMilestones,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.dealId);

      if (updateError) throw updateError;

      // Back to in_progress
      if (deal.status === "milestone_submitted") {
        await transitionDealState(params.dealId, "in_progress", user.id);
      }

      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dealRoom"] });
      qc.invalidateQueries({ queryKey: ["dealRooms"] });
      toast.success("Milestone rejected — changes requested");
    },
    onError: (err: Error) => {
      toast.error(`Rejection failed: ${err.message}`);
    },
  });
}
