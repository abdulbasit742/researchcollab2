import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Feature 26: Crisis Response & Scientific Integrity Hooks

export interface CrisisMode {
  id: string;
  crisis_type: string;
  scope: string;
  activated_at: string;
  deactivated_at?: string;
  ruleset_applied: Record<string, unknown>;
  reason?: string;
}

export interface IntegrityFlag {
  id: string;
  entity_type: string;
  entity_id: string;
  flag_type: string;
  flag_reason: string;
  review_status: string;
  applied_at: string;
}

export function useCrisisResponse() {
  const { user } = useAuth();
  const [activeCrises, setActiveCrises] = useState<CrisisMode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActiveCrises = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("crisis_modes")
        .select("*")
        .is("deactivated_at", null)
        .order("activated_at", { ascending: false });
      if (error) throw error;
      setActiveCrises((data || []) as CrisisMode[]);
    } catch (error) {
      console.error("Error fetching crisis modes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateCrisis = useCallback(async (
    crisisType: string, scope: string, reason: string
  ) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("crisis_modes")
        .insert({ crisis_type: crisisType, scope, reason, activated_by: user.id })
        .select().single();
      if (error) throw error;
      toast.success("Crisis mode activated");
      return data;
    } catch (error) {
      toast.error("Failed to activate crisis mode");
      return null;
    }
  }, [user]);

  return { activeCrises, isLoading, fetchActiveCrises, activateCrisis };
}

export function useScientificIntegrity() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<IntegrityFlag[]>([]);

  const applyIntegrityFlag = useCallback(async (
    entityType: string, entityId: string, flagType: string, reason: string
  ) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from("integrity_flags")
        .insert({ entity_type: entityType, entity_id: entityId, flag_type: flagType, flag_reason: reason, applied_by: user.id })
        .select().single();
      if (error) throw error;
      toast.success("Integrity flag applied");
      return data;
    } catch (error) {
      toast.error("Failed to apply flag");
      return null;
    }
  }, [user]);

  const fetchFlagsForEntity = useCallback(async (entityType: string, entityId: string) => {
    const { data } = await supabase
      .from("integrity_flags")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);
    setFlags((data || []) as IntegrityFlag[]);
  }, []);

  return { flags, applyIntegrityFlag, fetchFlagsForEntity };
}
