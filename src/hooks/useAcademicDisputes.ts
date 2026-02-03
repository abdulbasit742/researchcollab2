import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AcademicDispute {
  id: string;
  raised_by_user_id: string;
  dispute_type: "authorship" | "contribution" | "review_bias" | "ethics" | "misconduct" | "supervision" | "other";
  related_entity_type: string | null;
  related_entity_id: string | null;
  title: string;
  description: string;
  confidentiality_level: "private" | "limited" | "institutional";
  status: "submitted" | "under_review" | "mediation" | "escalated" | "resolved" | "dismissed";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
}

interface DisputeParticipant {
  id: string;
  dispute_id: string;
  user_id: string;
  role: "complainant" | "respondent" | "witness" | "mediator";
  notified_at: string | null;
  created_at: string;
}

interface DisputeEvidence {
  id: string;
  dispute_id: string;
  evidence_type: "text" | "file" | "link" | "reference";
  title: string | null;
  content: string;
  file_url: string | null;
  submitted_by: string;
  created_at: string;
}

interface DisputeAction {
  id: string;
  dispute_id: string;
  action_type: "response" | "mediation_note" | "admin_note" | "resolution_decision" | "status_change";
  content: string;
  created_by: string;
  visibility: "internal" | "participants" | "admin_only";
  created_at: string;
}

interface OmbudsAssignment {
  id: string;
  dispute_id: string;
  ombuds_user_id: string;
  role: "mediator" | "reviewer" | "adjudicator";
  assigned_at: string;
  completed_at: string | null;
}

export function useAcademicDisputes() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<AcademicDispute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("academic_disputes")
      .select("*")
      .eq("raised_by_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching disputes:", error);
    } else {
      setDisputes(data as AcademicDispute[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const createDispute = async (dispute: {
    dispute_type: AcademicDispute["dispute_type"];
    title: string;
    description: string;
    related_entity_type?: string;
    related_entity_id?: string;
    confidentiality_level?: AcademicDispute["confidentiality_level"];
    priority?: AcademicDispute["priority"];
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("academic_disputes")
      .insert({
        ...dispute,
        raised_by_user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to submit dispute");
      return { success: false, error };
    }

    // Add self as complainant
    await supabase.from("dispute_participants").insert({
      dispute_id: data.id,
      user_id: user.id,
      role: "complainant",
      notified_at: new Date().toISOString(),
    });

    toast.success("Dispute submitted for review");
    await fetchDisputes();
    return { success: true, data };
  };

  return {
    disputes,
    loading,
    fetchDisputes,
    createDispute,
  };
}

export function useDisputeDetails(disputeId: string | null) {
  const { user } = useAuth();
  const [dispute, setDispute] = useState<AcademicDispute | null>(null);
  const [participants, setParticipants] = useState<DisputeParticipant[]>([]);
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([]);
  const [actions, setActions] = useState<DisputeAction[]>([]);
  const [ombuds, setOmbuds] = useState<OmbudsAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputeDetails = useCallback(async () => {
    if (!disputeId) {
      setLoading(false);
      return;
    }

    // Fetch dispute
    const { data: disputeData, error: disputeError } = await supabase
      .from("academic_disputes")
      .select("*")
      .eq("id", disputeId)
      .single();

    if (disputeError) {
      console.error("Error fetching dispute:", disputeError);
      setLoading(false);
      return;
    }

    setDispute(disputeData as AcademicDispute);

    // Fetch participants
    const { data: participantsData } = await supabase
      .from("dispute_participants")
      .select("*")
      .eq("dispute_id", disputeId);
    setParticipants((participantsData || []) as DisputeParticipant[]);

    // Fetch evidence
    const { data: evidenceData } = await supabase
      .from("dispute_evidence")
      .select("*")
      .eq("dispute_id", disputeId)
      .order("created_at", { ascending: true });
    setEvidence((evidenceData || []) as DisputeEvidence[]);

    // Fetch actions
    const { data: actionsData } = await supabase
      .from("dispute_actions")
      .select("*")
      .eq("dispute_id", disputeId)
      .order("created_at", { ascending: true });
    setActions((actionsData || []) as DisputeAction[]);

    // Fetch ombuds assignments
    const { data: ombudsData } = await supabase
      .from("ombuds_assignments")
      .select("*")
      .eq("dispute_id", disputeId);
    setOmbuds((ombudsData || []) as OmbudsAssignment[]);

    setLoading(false);
  }, [disputeId]);

  useEffect(() => {
    fetchDisputeDetails();
  }, [fetchDisputeDetails]);

  const addEvidence = async (evidenceItem: {
    evidence_type: DisputeEvidence["evidence_type"];
    title?: string;
    content: string;
    file_url?: string;
  }) => {
    if (!user?.id || !disputeId) return { success: false, error: "Invalid state" };

    const { error } = await supabase
      .from("dispute_evidence")
      .insert({
        ...evidenceItem,
        dispute_id: disputeId,
        submitted_by: user.id,
      });

    if (error) {
      toast.error("Failed to add evidence");
      return { success: false, error };
    }

    toast.success("Evidence added");
    await fetchDisputeDetails();
    return { success: true };
  };

  const addAction = async (action: {
    action_type: DisputeAction["action_type"];
    content: string;
    visibility?: DisputeAction["visibility"];
  }) => {
    if (!user?.id || !disputeId) return { success: false, error: "Invalid state" };

    const { error } = await supabase
      .from("dispute_actions")
      .insert({
        ...action,
        dispute_id: disputeId,
        created_by: user.id,
      });

    if (error) {
      toast.error("Failed to add action");
      return { success: false, error };
    }

    toast.success("Action recorded");
    await fetchDisputeDetails();
    return { success: true };
  };

  const addParticipant = async (userId: string, role: DisputeParticipant["role"]) => {
    if (!disputeId) return { success: false, error: "No dispute" };

    const { error } = await supabase
      .from("dispute_participants")
      .insert({
        dispute_id: disputeId,
        user_id: userId,
        role,
      });

    if (error) {
      toast.error("Failed to add participant");
      return { success: false, error };
    }

    toast.success("Participant added");
    await fetchDisputeDetails();
    return { success: true };
  };

  return {
    dispute,
    participants,
    evidence,
    actions,
    ombuds,
    loading,
    fetchDisputeDetails,
    addEvidence,
    addAction,
    addParticipant,
  };
}
