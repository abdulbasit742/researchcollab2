import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CivilizationCycle {
  id: string;
  cycle_version: number;
  knowledge_growth_index: number;
  trust_growth_index: number;
  capital_efficiency_index: number;
  policy_impact_index: number;
  governance_stability_index: number;
  composite_civilization_score: number;
  feedback_loops: Record<string, { strength: number; bottleneck: string }>;
  optimization_suggestions: Array<{ category: string; suggestion: string; expected_impact: number; urgency: string }>;
  cycle_metadata: Record<string, unknown>;
  created_at: string;
}

export interface ShockSimulation {
  id: string;
  shock_type: string;
  shock_magnitude: number;
  pre_shock_score: number;
  post_shock_score: number;
  resilience_index: number;
  capital_loss_projection: number;
  impact_loss_projection: number;
  recovery_timeline_days: number;
  corrective_measures: Array<{ action: string; priority: string; expected_recovery: number }>;
  created_at: string;
}

export function useCivilizationEngine() {
  const [cycles, setCycles] = useState<CivilizationCycle[]>([]);
  const [shocks, setShocks] = useState<ShockSimulation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCycles = useCallback(async () => {
    const { data } = await (supabase as any).from("civilization_cycles").select("*").order("cycle_version", { ascending: false });
    setCycles(data || []);
  }, []);

  const fetchShocks = useCallback(async () => {
    const { data } = await (supabase as any).from("civilization_shock_simulations").select("*").order("created_at", { ascending: false });
    setShocks(data || []);
  }, []);

  const computeCycle = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "civilization_compute" },
      });
      if (error) throw error;
      toast.success(`Civilization Cycle v${data.cycle_version} computed`);
      await fetchCycles();
      return data;
    } catch (e: any) {
      toast.error(e.message || "Computation failed");
    } finally { setLoading(false); }
  }, [fetchCycles]);

  const simulateShock = useCallback(async (shockType: string, magnitude: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("research-intelligence", {
        body: { action: "civilization_shock", shock_type: shockType, magnitude },
      });
      if (error) throw error;
      toast.success("Shock simulation complete");
      await fetchShocks();
      return data;
    } catch (e: any) {
      toast.error(e.message || "Simulation failed");
    } finally { setLoading(false); }
  }, [fetchShocks]);

  const latestCycle = cycles[0] || null;

  return { cycles, shocks, loading, latestCycle, fetchCycles, fetchShocks, computeCycle, simulateShock };
}
