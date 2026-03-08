/**
 * Execution Market Simulator — Service layer
 */
import { supabase } from "@/integrations/supabase/client";

export async function getSimulations(simulationType?: string) {
  let q = supabase.from("market_simulations").select("*").order("created_at", { ascending: false });
  if (simulationType) q = q.eq("simulation_type", simulationType);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function runSimulation(input: {
  simulation_type: string; title: string;
  parameters: Record<string, unknown>;
  domain?: string; region?: string; run_by?: string;
}) {
  // Compute results client-side (advisory only)
  const results = simulateMarket(input.parameters);
  const { data, error } = await supabase.from("market_simulations")
    .insert({ ...input, results, status: "completed" }).select().single();
  if (error) throw error;
  return data;
}

function simulateMarket(params: Record<string, unknown>): Record<string, unknown> {
  const demandGrowth = (Number(params.researchDemand) || 50) * 1.1;
  const talentGap = Math.max(0, (Number(params.talentDemand) || 60) - (Number(params.talentSupply) || 40));
  const fundingBottleneck = (Number(params.fundingNeeded) || 70) - (Number(params.fundingAvailable) || 50);
  return {
    projected_demand: Math.round(demandGrowth),
    talent_gap_severity: Math.round(talentGap),
    funding_bottleneck: Math.round(Math.max(0, fundingBottleneck)),
    recommendation: talentGap > 20 ? "Expand talent pipeline" : fundingBottleneck > 20 ? "Increase funding allocation" : "Stable outlook",
  };
}

export const SIMULATION_TYPES = [
  "research_demand", "talent_shortage", "funding_bottleneck", "institutional_capacity",
];
