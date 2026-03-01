/**
 * useDealDecisions — Fetches real state transition logs for deal decision history.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DealDecision } from "@/hooks/useDealRoom";

export function useDealDecisions(dealId?: string) {
  return useQuery({
    queryKey: ["dealDecisions", dealId],
    queryFn: async (): Promise<DealDecision[]> => {
      if (!dealId) return [];

      const { data, error } = await (supabase as any)
        .from("state_transition_logs")
        .select("*")
        .eq("entity_type", "deal")
        .eq("entity_id", dealId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Enrich with actor names
      const actorIds = [...new Set((data as any[]).map((d: any) => d.triggered_by).filter(Boolean))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", actorIds);

      const nameMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return (data as any[]).map((log: any, index: number) => {
        const decisionType = mapStateToDecisionType(log.from_state, log.to_state);
        return {
          id: log.id || `decision-${index}`,
          timestamp: log.created_at,
          actor_id: log.triggered_by,
          actor_name: nameMap.get(log.triggered_by) || "System",
          decision_type: decisionType,
          description: `${log.from_state} → ${log.to_state}`,
          is_binding: ["escrow_funded", "completed", "cancelled"].includes(log.to_state),
        } as DealDecision;
      });
    },
    enabled: !!dealId,
  });
}

function mapStateToDecisionType(from: string, to: string): DealDecision["decision_type"] {
  if (to === "submitted") return "proposal";
  if (to === "accepted") return "accept";
  if (to === "cancelled") return "reject";
  if (to === "milestone_submitted" || to === "milestone_approved") return "milestone";
  if (to === "disputed") return "dispute";
  if (to === "completed") return "complete";
  return "proposal";
}
