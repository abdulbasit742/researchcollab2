import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

export interface AccountabilityRecord {
  id: string;
  project_id: string | null;
  initiator_id: string;
  executor_id: string;
  funder_id: string | null;
  collaboration_type: string;
  roles: Record<string, string>;
  promised_deliverables: string[];
  deadline: string | null;
  escrow_amount: number;
  escrow_locked_at: string | null;
  escrow_released_at: string | null;
  total_paid: number;
  outcome_status: string;
  outcome_evidence: Record<string, unknown>;
  outcome_verdict: string | null;
  failure_reason: string | null;
  failure_attributed_to: string | null;
  trust_impact_initiator: number;
  trust_impact_executor: number;
  trust_impact_applied: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_method: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  initiator_name?: string;
  executor_name?: string;
}

export interface TrustEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_source: string | null;
  trust_delta: number;
  trust_before: number;
  trust_after: number;
  tier_before: string | null;
  tier_after: string | null;
  reference_type: string | null;
  reference_id: string | null;
  evidence_summary: string | null;
  evidence_links: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
}

export interface RealityFeedEvent {
  id: string;
  event_type: string;
  primary_actor_id: string;
  primary_actor_type: string;
  secondary_actor_id: string | null;
  title: string;
  summary: string | null;
  amount_involved: number | null;
  currency: string;
  reference_type: string | null;
  reference_id: string | null;
  trust_impact: number | null;
  visibility: string;
  is_verified: boolean;
  verified_by: string | null;
  created_at: string;
  // Joined data
  actor_name?: string;
  secondary_actor_name?: string;
}

export interface ConsequenceLedger {
  id: string;
  user_id: string;
  projects_attempted: number;
  projects_completed: number;
  projects_failed: number;
  projects_abandoned: number;
  total_escrow_handled: number;
  total_escrow_released: number;
  total_escrow_disputed: number;
  completion_rate: number;
  escrow_success_rate: number;
  on_time_rate: number;
  disputes_raised: number;
  disputes_won: number;
  disputes_lost: number;
  trust_score_current: number;
  trust_score_peak: number;
  trust_score_lowest: number;
  trust_trajectory: string;
  institutions_worked_with: string[];
  verified_associations: number;
  last_completed_project_at: string | null;
  last_failure_at: string | null;
  computed_at: string;
}

export interface TrustAccessGate {
  id: string;
  gate_name: string;
  gate_description: string | null;
  feature_type: string;
  min_trust_score: number;
  min_trust_tier: string;
  min_projects_completed: number;
  min_escrow_success_rate: number;
  requires_verification: boolean;
  max_dispute_rate: number;
  is_active: boolean;
  denial_message: string | null;
}

export interface TrustGateResult {
  allowed: boolean;
  gate_name?: string;
  denial_reasons?: string[];
  denial_message?: string;
  requirements?: {
    min_trust_score: number;
    min_projects: number;
    min_success_rate: number;
  };
  current?: {
    trust_score: number;
    projects_completed: number;
    escrow_success_rate: number;
  };
}

// =====================================================
// REALITY FEED (System Events Only)
// =====================================================

export function useRealityFeed() {
  const [events, setEvents] = useState<RealityFeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchFeed = useCallback(async (pageNum: number = 0) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reality_feed_events")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      // Enrich with actor names
      const enrichedEvents = await Promise.all(
        (data || []).map(async (event) => {
          let actor_name = "Unknown";
          let secondary_actor_name: string | undefined;

          if (event.primary_actor_type === "user" && event.primary_actor_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", event.primary_actor_id)
              .maybeSingle();
            actor_name = profile?.full_name || "Unknown";
          } else if (event.primary_actor_type === "institution") {
            const { data: org } = await supabase
              .from("organizations")
              .select("name")
              .eq("id", event.primary_actor_id)
              .maybeSingle();
            actor_name = org?.name || "Institution";
          }

          if (event.secondary_actor_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", event.secondary_actor_id)
              .maybeSingle();
            secondary_actor_name = profile?.full_name || undefined;
          }

          return { ...event, actor_name, secondary_actor_name };
        })
      );

      if (pageNum === 0) {
        setEvents(enrichedEvents);
      } else {
        setEvents((prev) => [...prev, ...enrichedEvents]);
      }
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching reality feed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(0);
  }, [fetchFeed]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("reality-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reality_feed_events" },
        (payload) => {
          setEvents((prev) => [payload.new as RealityFeedEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  return {
    events,
    loading,
    hasMore,
    loadMore,
    refetch: () => {
      setPage(0);
      fetchFeed(0);
    },
  };
}

// =====================================================
// TRUST EVENTS (History of trust changes)
// =====================================================

export function useTrustEvents(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["trustEvents", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("trust_events")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as TrustEvent[];
    },
    enabled: !!targetUserId,
  });
}

// =====================================================
// CONSEQUENCE LEDGER (User's permanent record)
// =====================================================

export function useConsequenceLedger(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const query = useQuery({
    queryKey: ["consequenceLedger", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from("consequence_ledgers")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      return data as ConsequenceLedger | null;
    },
    enabled: !!targetUserId,
  });

  const recompute = async () => {
    if (!targetUserId) return;
    try {
      await supabase.rpc("compute_consequence_ledger", { p_user_id: targetUserId });
      query.refetch();
    } catch (error) {
      console.error("Error recomputing consequence ledger:", error);
    }
  };

  return { ...query, recompute };
}

// =====================================================
// ACCOUNTABILITY RECORDS
// =====================================================

export function useAccountabilityRecords(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["accountabilityRecords", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("accountability_records")
        .select("*")
        .or(`initiator_id.eq.${targetUserId},executor_id.eq.${targetUserId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with names
      const enriched = await Promise.all(
        (data || []).map(async (record) => {
          const { data: initiatorProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", record.initiator_id)
            .maybeSingle();
          const { data: executorProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", record.executor_id)
            .maybeSingle();

          return {
            ...record,
            initiator_name: initiatorProfile?.full_name || "Unknown",
            executor_name: executorProfile?.full_name || "Unknown",
          };
        })
      );

      return enriched as AccountabilityRecord[];
    },
    enabled: !!targetUserId,
  });
}

export function useCreateAccountabilityRecord() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      project_id?: string;
      executor_id: string;
      funder_id?: string;
      collaboration_type?: string;
      roles?: Record<string, string>;
      promised_deliverables: string[];
      deadline?: string;
      escrow_amount?: number;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: record, error } = await supabase
        .from("accountability_records")
        .insert({
          ...data,
          initiator_id: user.id,
          escrow_locked_at: data.escrow_amount ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountabilityRecords"] });
      queryClient.invalidateQueries({ queryKey: ["realityFeed"] });
      toast.success("Accountability record created");
    },
    onError: (error) => {
      toast.error(`Failed to create record: ${error.message}`);
    },
  });
}

export function useUpdateAccountabilityOutcome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      outcome_status,
      outcome_verdict,
      failure_reason,
      failure_attributed_to,
      total_paid,
    }: {
      recordId: string;
      outcome_status: "completed" | "failed" | "disputed" | "abandoned";
      outcome_verdict?: string;
      failure_reason?: string;
      failure_attributed_to?: string;
      total_paid?: number;
    }) => {
      const updates: Record<string, unknown> = {
        outcome_status,
        outcome_verdict,
        updated_at: new Date().toISOString(),
      };

      if (outcome_status === "failed") {
        updates.failure_reason = failure_reason;
        updates.failure_attributed_to = failure_attributed_to;
      }

      if (outcome_status === "completed" && total_paid) {
        updates.total_paid = total_paid;
        updates.escrow_released_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("accountability_records")
        .update(updates)
        .eq("id", recordId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountabilityRecords"] });
      queryClient.invalidateQueries({ queryKey: ["trustEvents"] });
      queryClient.invalidateQueries({ queryKey: ["consequenceLedger"] });
      queryClient.invalidateQueries({ queryKey: ["realityFeed"] });
      toast.success("Outcome recorded - trust updated automatically");
    },
  });
}

// =====================================================
// TRUST ACCESS GATES
// =====================================================

export function useTrustGates() {
  return useQuery({
    queryKey: ["trustGates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trust_access_gates")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data as TrustAccessGate[];
    },
  });
}

export function useCheckTrustGate(gateName: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trustGateCheck", user?.id, gateName],
    queryFn: async (): Promise<TrustGateResult> => {
      if (!user?.id) return { allowed: false, denial_reasons: ["Not authenticated"] };

      const { data, error } = await supabase.rpc("check_trust_gate", {
        p_user_id: user.id,
        p_gate_name: gateName,
      });

      if (error) throw error;
      return data as unknown as TrustGateResult;
    },
    enabled: !!user?.id && !!gateName,
  });
}

// =====================================================
// TRUST TRAJECTORY (for graphs)
// =====================================================

export function useTrustTrajectory(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["trustTrajectory", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("trust_events")
        .select("created_at, trust_after, event_type, trust_delta")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Transform for chart display
      return (data || []).map((event) => ({
        date: new Date(event.created_at).toLocaleDateString(),
        score: event.trust_after,
        type: event.event_type,
        delta: event.trust_delta,
      }));
    },
    enabled: !!targetUserId,
  });
}
