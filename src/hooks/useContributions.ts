import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ContributionRecord {
  id: string;
  contributor_user_id: string;
  target_type: "research_timeline" | "research_entry" | "publication" | "dataset" | "code" | "peer_review";
  target_id: string;
  contribution_type: "idea" | "methodology" | "data_collection" | "analysis" | "writing" | "review" | "supervision" | "funding" | "resources";
  contribution_description: string | null;
  effort_weight: number | null;
  is_locked: boolean;
  created_at: string;
}

interface ContributionValidation {
  id: string;
  contribution_record_id: string;
  validator_user_id: string;
  validation_type: "approved" | "contested";
  comment: string | null;
  created_at: string;
}

interface ContributionDispute {
  id: string;
  contribution_record_id: string;
  raised_by: string;
  reason: string;
  status: "open" | "under_review" | "resolved";
  resolution_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface ContributionGraphSnapshot {
  user_id: string;
  total_contributions: number;
  contribution_diversity_score: number;
  collaboration_depth_score: number;
  validated_contributions: number;
  last_updated_at: string;
}

export function useContributions(targetType?: string, targetId?: string) {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContributions = useCallback(async () => {
    let query = supabase.from("contribution_records").select("*");

    if (targetType && targetId) {
      query = query.eq("target_type", targetType).eq("target_id", targetId);
    } else if (user?.id) {
      query = query.eq("contributor_user_id", user.id);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contributions:", error);
    } else {
      setContributions(data as ContributionRecord[]);
    }
    setLoading(false);
  }, [user?.id, targetType, targetId]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const addContribution = async (contribution: {
    target_type: ContributionRecord["target_type"];
    target_id: string;
    contribution_type: ContributionRecord["contribution_type"];
    contribution_description?: string;
    effort_weight?: number;
  }) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("contribution_records")
      .insert({
        ...contribution,
        contributor_user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to record contribution");
      return { success: false, error };
    }

    toast.success("Contribution recorded");
    await fetchContributions();

    // Update contribution graph snapshot
    await supabase.rpc("update_contribution_snapshot", { p_user_id: user.id });

    return { success: true, data };
  };

  return {
    contributions,
    loading,
    fetchContributions,
    addContribution,
  };
}

export function useContributionValidations(contributionId: string | null) {
  const { user } = useAuth();
  const [validations, setValidations] = useState<ContributionValidation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchValidations = useCallback(async () => {
    if (!contributionId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("contribution_validations")
      .select("*")
      .eq("contribution_record_id", contributionId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching validations:", error);
    } else {
      setValidations(data as ContributionValidation[]);
    }
    setLoading(false);
  }, [contributionId]);

  useEffect(() => {
    fetchValidations();
  }, [fetchValidations]);

  const validateContribution = async (validationType: "approved" | "contested", comment?: string) => {
    if (!user?.id || !contributionId) return { success: false, error: "Invalid state" };

    const { error } = await supabase
      .from("contribution_validations")
      .insert({
        contribution_record_id: contributionId,
        validator_user_id: user.id,
        validation_type: validationType,
        comment,
      });

    if (error) {
      toast.error("Failed to validate contribution");
      return { success: false, error };
    }

    toast.success(validationType === "approved" ? "Contribution approved" : "Contribution contested");
    await fetchValidations();
    return { success: true };
  };

  return {
    validations,
    loading,
    fetchValidations,
    validateContribution,
  };
}

export function useContributionDisputes() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<ContributionDispute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("contribution_disputes")
      .select("*")
      .eq("raised_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching disputes:", error);
    } else {
      setDisputes(data as ContributionDispute[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const raiseDispute = async (contributionId: string, reason: string) => {
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("contribution_disputes")
      .insert({
        contribution_record_id: contributionId,
        raised_by: user.id,
        reason,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to raise dispute");
      return { success: false, error };
    }

    toast.success("Dispute submitted for review");
    await fetchDisputes();
    return { success: true, data };
  };

  return {
    disputes,
    loading,
    fetchDisputes,
    raiseDispute,
  };
}

export function useContributionGraph(userId?: string) {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<ContributionGraphSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchSnapshot = useCallback(async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("contribution_graph_snapshots")
      .select("*")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching contribution graph:", error);
    } else {
      setSnapshot(data as ContributionGraphSnapshot | null);
    }
    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  const refreshSnapshot = async () => {
    if (!targetUserId) return;
    
    await supabase.rpc("update_contribution_snapshot", { p_user_id: targetUserId });
    await fetchSnapshot();
  };

  return {
    snapshot,
    loading,
    fetchSnapshot,
    refreshSnapshot,
  };
}
