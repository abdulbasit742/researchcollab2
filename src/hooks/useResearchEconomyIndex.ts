import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ImpactEntity {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  created_at: string;
}

export interface ImpactMetrics {
  id: string;
  impact_entity_id: string;
  knowledge_output_score: number;
  claim_influence_score: number;
  funding_efficiency_score: number;
  execution_reliability_score: number;
  policy_adoption_score: number;
  cross_border_diffusion_score: number;
  trust_density_score: number;
  knowledge_stability_score: number;
  innovation_velocity_score: number;
  composite_index_score: number;
  weights_used: Record<string, number>;
  formula_explanation: string;
  anti_gaming_flags: Array<{ type: string; severity: string; description: string }>;
  computed_at: string;
}

export interface ImpactSnapshot {
  id: string;
  composite_score_at_snapshot: number;
  created_at: string;
}

export function useResearchEconomyIndex() {
  const [entities, setEntities] = useState<ImpactEntity[]>([]);
  const [metrics, setMetrics] = useState<Record<string, ImpactMetrics>>({});
  const [history, setHistory] = useState<ImpactSnapshot[]>([]);
  const [gamingFlags, setGamingFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await (supabase as any).from("impact_entities").select("*").order("created_at", { ascending: false });
      setEntities(data || []);
      // Fetch metrics for all entities
      if (data?.length) {
        const ids = data.map((e: any) => e.id);
        const { data: m } = await (supabase as any).from("impact_metrics").select("*").in("impact_entity_id", ids);
        const map: Record<string, ImpactMetrics> = {};
        (m || []).forEach((metric: any) => { map[metric.impact_entity_id] = metric; });
        setMetrics(map);
      }
    } finally { setLoading(false); }
  }, []);

  const fetchHistory = useCallback(async (entityId: string) => {
    const { data } = await (supabase as any).from("impact_history").select("id, composite_score_at_snapshot, created_at")
      .eq("impact_entity_id", entityId).order("created_at", { ascending: true });
    setHistory(data || []);
  }, []);

  const fetchGamingFlags = useCallback(async () => {
    const { data } = await (supabase as any).from("impact_gaming_flags").select("*").eq("resolved", false).order("created_at", { ascending: false });
    setGamingFlags(data || []);
  }, []);

  const computeIndex = useCallback(async (entityId: string, entityType: string, entityName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "compute_impact_index", entity_id: entityId, entity_type: entityType, entity_name: entityName },
      });
      if (error) throw error;
      toast.success("Research Economy Index computed");
      await fetchEntities();
      return data;
    } catch (e: any) {
      toast.error(e.message || "Computation failed");
    } finally { setLoading(false); }
  }, [fetchEntities]);

  return { entities, metrics, history, gamingFlags, loading, fetchEntities, fetchHistory, fetchGamingFlags, computeIndex };
}
