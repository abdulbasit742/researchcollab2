import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserRestriction {
  id: string;
  user_id: string;
  restriction_type: string;
  reason: string;
  applied_by: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminNote {
  id: string;
  entity_type: string;
  entity_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface FlaggedBehavior {
  id: string;
  user_id: string;
  behavior_type: string;
  severity: string;
  description: string | null;
  auto_flagged: boolean;
  ai_confidence: number | null;
  reviewed: boolean;
  reviewed_by: string | null;
  action_taken: string | null;
  created_at: string;
}

export interface FraudDetectionLog {
  id: string;
  user_id: string;
  wallet_id: string;
  detection_type: string;
  severity: string;
  details: Record<string, any>;
  reviewed: boolean;
  action_taken: string | null;
  created_at: string;
}

export function useUserRestrictions(userId?: string) {
  const [restrictions, setRestrictions] = useState<UserRestriction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestrictions();
  }, [userId]);

  const fetchRestrictions = async () => {
    try {
      let query = supabase
        .from("user_restrictions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRestrictions(data as UserRestriction[]);
    } catch (err) {
      console.error("Error fetching restrictions:", err);
    } finally {
      setLoading(false);
    }
  };

  return { restrictions, loading, refetch: fetchRestrictions };
}

export function useAdminNotes(entityType?: string, entityId?: string) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (entityType && entityId) {
      fetchNotes();
    }
  }, [entityType, entityId]);

  const fetchNotes = async () => {
    if (!entityType || !entityId) return;

    try {
      const { data, error } = await supabase
        .from("admin_notes")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data as AdminNote[]);
    } catch (err) {
      console.error("Error fetching admin notes:", err);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (entityType: string, entityId: string, note: string) => {
    try {
      const { error } = await supabase
        .from("admin_notes")
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          note,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      toast({
        title: "Note Added",
        description: "Admin note has been saved.",
      });

      await fetchNotes();
      return { success: true };
    } catch (err: any) {
      console.error("Error adding note:", err);
      return { success: false, error: err.message };
    }
  };

  return { notes, loading, refetch: fetchNotes, addNote };
}

export function useFlaggedBehaviors() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FlaggedBehavior[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from("flagged_behaviors")
        .select("*")
        .eq("reviewed", false)
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setFlags(data as FlaggedBehavior[]);
    } catch (err) {
      console.error("Error fetching flagged behaviors:", err);
    } finally {
      setLoading(false);
    }
  };

  const reviewFlag = async (flagId: string, actionTaken: string) => {
    try {
      const { error } = await supabase
        .from("flagged_behaviors")
        .update({
          reviewed: true,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          action_taken: actionTaken,
        })
        .eq("id", flagId);

      if (error) throw error;

      toast({
        title: "Flag Reviewed",
        description: "The flagged behavior has been marked as reviewed.",
      });

      await fetchFlags();
      return { success: true };
    } catch (err: any) {
      console.error("Error reviewing flag:", err);
      return { success: false, error: err.message };
    }
  };

  return { flags, loading, refetch: fetchFlags, reviewFlag };
}

export function useFraudDetection() {
  const [logs, setLogs] = useState<FraudDetectionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("fraud_detection_logs")
        .select("*")
        .eq("reviewed", false)
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data as FraudDetectionLog[]);
    } catch (err) {
      console.error("Error fetching fraud logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkWalletFraud = async (walletId: string) => {
    try {
      const { data, error } = await supabase
        .rpc("check_fraud_patterns", { p_wallet_id: walletId });

      if (error) throw error;
      await fetchLogs();
      return { success: true, riskScore: data as number };
    } catch (err: any) {
      console.error("Error checking fraud:", err);
      return { success: false, error: err.message };
    }
  };

  return { logs, loading, refetch: fetchLogs, checkWalletFraud };
}

export function useApplyRestriction() {
  const { toast } = useToast();

  const applyRestriction = async (
    userId: string,
    restrictionType: string,
    reason: string,
    expiresAt?: Date
  ) => {
    try {
      const { data, error } = await supabase
        .rpc("apply_user_restriction", {
          p_user_id: userId,
          p_restriction_type: restrictionType,
          p_reason: reason,
          p_expires_at: expiresAt?.toISOString() || null,
        });

      if (error) throw error;

      toast({
        title: "Restriction Applied",
        description: `${restrictionType} restriction has been applied to the user.`,
      });

      return { success: true, restrictionId: data };
    } catch (err: any) {
      console.error("Error applying restriction:", err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const removeRestriction = async (restrictionId: string) => {
    try {
      const { error } = await supabase
        .from("user_restrictions")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", restrictionId);

      if (error) throw error;

      toast({
        title: "Restriction Removed",
        description: "The restriction has been deactivated.",
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error removing restriction:", err);
      return { success: false, error: err.message };
    }
  };

  return { applyRestriction, removeRestriction };
}
