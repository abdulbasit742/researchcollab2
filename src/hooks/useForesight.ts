import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types for foresight & trend prediction
export interface TrendModel {
  id: string;
  model_name: string;
  model_type: "emergence" | "saturation" | "collaboration_density" | "funding_efficiency" | "impact_velocity" | "interdisciplinary_flow";
  model_scope: "global" | "national" | "institutional" | "domain";
  scope_id: string | null;
  parameters: Record<string, unknown>;
  version_number: number;
  is_active: boolean;
  created_by: string | null;
  last_run_at: string | null;
  created_at: string;
}

export interface TrendOutput {
  id: string;
  trend_model_id: string;
  domain: string;
  signal_direction: "emerging" | "stable" | "declining" | "volatile" | "uncertain";
  confidence_band: "low" | "medium" | "high";
  signal_strength: number | null;
  explanation: string;
  supporting_data: Record<string, unknown>;
  computed_at: string;
}

export interface ForesightScenario {
  id: string;
  scenario_name: string;
  scenario_scope: "global" | "national" | "institutional" | "domain";
  scope_id: string | null;
  assumptions: Record<string, unknown>;
  projected_outcomes: Record<string, unknown>;
  time_horizon_months: number;
  probability_assessment: string | null;
  risk_factors: string[];
  opportunity_factors: string[];
  created_by: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export interface AnalyticsGuardrail {
  id: string;
  guardrail_type: "bias_detection" | "misuse_prevention" | "overconfidence_flag" | "privacy_risk" | "determinism_warning";
  trigger_condition: Record<string, unknown>;
  description: string;
  severity: "info" | "warning" | "critical";
  triggered_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
}

export interface ResearchTrendAlert {
  id: string;
  trend_output_id: string | null;
  alert_type: "emergence" | "decline" | "funding_gap" | "talent_mismatch" | "opportunity";
  target_audience: "institution" | "funder" | "governance" | "domain_leaders";
  target_id: string | null;
  alert_summary: string;
  urgency: "low" | "normal" | "high";
  acknowledged_at: string | null;
  created_at: string;
}

export function useResearchTrends() {
  const [models, setModels] = useState<TrendModel[]>([]);
  const [outputs, setOutputs] = useState<TrendOutput[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch trend models
  const fetchModels = useCallback(async (filters?: {
    modelType?: string;
    scope?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase.from("trend_models").select("*");
      
      if (filters?.modelType) {
        query = query.eq("model_type", filters.modelType);
      }
      if (filters?.scope) {
        query = query.eq("model_scope", filters.scope);
      }
      
      const { data, error } = await query
        .eq("is_active", true)
        .order("model_name");
      
      if (error) throw error;
      setModels(data as TrendModel[]);
      return data as TrendModel[];
    } catch (err) {
      console.error("Error fetching trend models:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trend outputs
  const fetchOutputs = useCallback(async (modelId?: string, domain?: string) => {
    setLoading(true);
    try {
      let query = supabase.from("trend_outputs").select("*");
      
      if (modelId) {
        query = query.eq("trend_model_id", modelId);
      }
      if (domain) {
        query = query.eq("domain", domain);
      }
      
      const { data, error } = await query.order("computed_at", { ascending: false }).limit(50);
      
      if (error) throw error;
      setOutputs(data as TrendOutput[]);
      return data as TrendOutput[];
    } catch (err) {
      console.error("Error fetching trend outputs:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get emerging trends
  const getEmergingTrends = useCallback(async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from("trend_outputs")
        .select("*")
        .eq("signal_direction", "emerging")
        .in("confidence_band", ["medium", "high"])
        .order("computed_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as TrendOutput[];
    } catch (err) {
      console.error("Error fetching emerging trends:", err);
      return [];
    }
  }, []);

  // Get declining trends
  const getDecliningTrends = useCallback(async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from("trend_outputs")
        .select("*")
        .eq("signal_direction", "declining")
        .in("confidence_band", ["medium", "high"])
        .order("computed_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as TrendOutput[];
    } catch (err) {
      console.error("Error fetching declining trends:", err);
      return [];
    }
  }, []);

  return {
    models,
    outputs,
    loading,
    fetchModels,
    fetchOutputs,
    getEmergingTrends,
    getDecliningTrends,
  };
}

export function useForesightScenarios() {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<ForesightScenario[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch scenarios
  const fetchScenarios = useCallback(async (filters?: {
    scope?: string;
    status?: string;
  }) => {
    setLoading(true);
    try {
      let query = supabase.from("foresight_scenarios").select("*");
      
      if (filters?.scope) {
        query = query.eq("scenario_scope", filters.scope);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      setScenarios(data as ForesightScenario[]);
      return data as ForesightScenario[];
    } catch (err) {
      console.error("Error fetching scenarios:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create scenario
  const createScenario = useCallback(async (
    scenario: Omit<ForesightScenario, "id" | "created_by" | "status" | "created_at" | "updated_at">
  ) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("foresight_scenarios")
      .insert({
        scenario_name: scenario.scenario_name,
        scenario_scope: scenario.scenario_scope,
        scope_id: scenario.scope_id,
        assumptions: scenario.assumptions,
        projected_outcomes: scenario.projected_outcomes,
        time_horizon_months: scenario.time_horizon_months,
        probability_assessment: scenario.probability_assessment,
        risk_factors: scenario.risk_factors,
        opportunity_factors: scenario.opportunity_factors,
        created_by: user.id,
        status: "draft",
      } as any)
      .select()
      .single();
    
    if (error) throw error;
    await fetchScenarios();
    return data as ForesightScenario;
  }, [user, fetchScenarios]);

  // Update scenario
  const updateScenario = useCallback(async (
    scenarioId: string,
    updates: Partial<Omit<ForesightScenario, "id" | "created_by" | "created_at">>
  ) => {
    const updatePayload: Record<string, unknown> = {};
    if (updates.scenario_name) updatePayload.scenario_name = updates.scenario_name;
    if (updates.scenario_scope) updatePayload.scenario_scope = updates.scenario_scope;
    if (updates.assumptions) updatePayload.assumptions = updates.assumptions;
    if (updates.projected_outcomes) updatePayload.projected_outcomes = updates.projected_outcomes;
    if (updates.status) updatePayload.status = updates.status;
    
    const { error } = await supabase
      .from("foresight_scenarios")
      .update(updatePayload)
      .eq("id", scenarioId);
    
    if (error) throw error;
    await fetchScenarios();
  }, [fetchScenarios]);

  // Publish scenario
  const publishScenario = useCallback(async (scenarioId: string) => {
    const { error } = await supabase
      .from("foresight_scenarios")
      .update({ status: "published" })
      .eq("id", scenarioId);
    
    if (error) throw error;
    await fetchScenarios();
  }, [fetchScenarios]);

  return {
    scenarios,
    loading,
    fetchScenarios,
    createScenario,
    updateScenario,
    publishScenario,
  };
}

export function useAnalyticsGuardrails() {
  const [guardrails, setGuardrails] = useState<AnalyticsGuardrail[]>([]);
  const [alerts, setAlerts] = useState<ResearchTrendAlert[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch active guardrails
  const fetchGuardrails = useCallback(async (severity?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("analytics_guardrails")
        .select("*")
        .is("resolved_at", null);
      
      if (severity) {
        query = query.eq("severity", severity);
      }
      
      const { data, error } = await query.order("triggered_at", { ascending: false });
      
      if (error) throw error;
      setGuardrails(data as AnalyticsGuardrail[]);
      return data as AnalyticsGuardrail[];
    } catch (err) {
      console.error("Error fetching guardrails:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch trend alerts
  const fetchAlerts = useCallback(async (targetAudience?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("research_trend_alerts")
        .select("*")
        .is("acknowledged_at", null);
      
      if (targetAudience) {
        query = query.eq("target_audience", targetAudience);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      setAlerts(data as ResearchTrendAlert[]);
      return data as ResearchTrendAlert[];
    } catch (err) {
      console.error("Error fetching alerts:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    const { error } = await supabase
      .from("research_trend_alerts")
      .update({ acknowledged_at: new Date().toISOString() })
      .eq("id", alertId);
    
    if (error) throw error;
    await fetchAlerts();
  }, [fetchAlerts]);

  return {
    guardrails,
    alerts,
    loading,
    fetchGuardrails,
    fetchAlerts,
    acknowledgeAlert,
  };
}
