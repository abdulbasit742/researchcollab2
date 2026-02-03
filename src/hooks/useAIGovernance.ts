import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface AIModel {
  id: string;
  model_name: string;
  model_identifier: string;
  provider: string;
  model_version: string | null;
  purpose: string;
  capabilities: string[] | null;
  risk_level: string;
  enabled: boolean;
  requires_human_review: boolean;
  max_tokens_per_request: number | null;
  cost_per_1k_tokens: number | null;
  data_retention_policy: string;
  created_at: string;
}

export interface AIUsageLog {
  id: string;
  user_id: string;
  model_id: string | null;
  feature: string;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  cost_estimate: number | null;
  was_reviewed: boolean;
  was_rejected: boolean;
  created_at: string;
}

export interface AIPolicy {
  id: string;
  policy_name: string;
  scope: string;
  scope_id: string | null;
  rules: Record<string, unknown>;
  allow_generation: boolean;
  allow_analysis: boolean;
  allow_matching: boolean;
  allow_co_authoring: boolean;
  allow_training: boolean;
  human_review_required: boolean;
  max_tokens_per_day: number | null;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface AIKillSwitch {
  id: string;
  switch_type: string;
  switch_target: string | null;
  is_active: boolean;
  reason: string;
  activated_by: string | null;
  activated_at: string | null;
  auto_deactivate_at: string | null;
  created_at: string;
}

export function useAIGovernance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [models, setModels] = useState<AIModel[]>([]);
  const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
  const [policies, setPolicies] = useState<AIPolicy[]>([]);
  const [killSwitches, setKillSwitches] = useState<AIKillSwitch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [modelsRes, logsRes, policiesRes, switchesRes] = await Promise.all([
        supabase.from("ai_models_registry" as any).select("*").order("model_name"),
        supabase.from("ai_usage_logs" as any).select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("ai_policies" as any).select("*").order("priority", { ascending: false }),
        supabase.from("ai_kill_switches" as any).select("*").order("created_at", { ascending: false }),
      ]);

      setModels((modelsRes.data as unknown as AIModel[]) || []);
      setUsageLogs((logsRes.data as unknown as AIUsageLog[]) || []);
      setPolicies((policiesRes.data as unknown as AIPolicy[]) || []);
      setKillSwitches((switchesRes.data as unknown as AIKillSwitch[]) || []);
    } catch (err) {
      console.error("Error fetching AI governance data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const toggleModel = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from("ai_models_registry" as any)
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: enabled ? "Model Enabled" : "Model Disabled" });
    await fetchAll();
    return true;
  };

  const activateKillSwitch = async (switchType: string, switchTarget: string | null, reason: string) => {
    const { error } = await supabase.from("ai_kill_switches" as any).upsert({
      switch_type: switchType,
      switch_target: switchTarget,
      is_active: true,
      reason,
      activated_by: user?.id,
      activated_at: new Date().toISOString(),
    }, { onConflict: "switch_type,switch_target" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Kill Switch Activated", variant: "destructive" });
    await fetchAll();
    return true;
  };

  const deactivateKillSwitch = async (id: string) => {
    const { error } = await supabase
      .from("ai_kill_switches" as any)
      .update({
        is_active: false,
        deactivated_by: user?.id,
        deactivated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Kill Switch Deactivated" });
    await fetchAll();
    return true;
  };

  const createPolicy = async (data: Partial<AIPolicy>) => {
    const { error } = await supabase.from("ai_policies" as any).insert({
      ...data,
      created_by: user?.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Policy Created" });
    await fetchAll();
    return true;
  };

  const activeKillSwitches = killSwitches.filter(s => s.is_active);
  const globalKillActive = activeKillSwitches.some(s => s.switch_type === "global");

  const totalTokensToday = usageLogs
    .filter(l => new Date(l.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, l) => sum + (l.total_tokens || 0), 0);

  const totalCostToday = usageLogs
    .filter(l => new Date(l.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, l) => sum + (l.cost_estimate || 0), 0);

  const stats = {
    totalModels: models.length,
    enabledModels: models.filter(m => m.enabled).length,
    activePolicies: policies.filter(p => p.is_active).length,
    activeKillSwitches: activeKillSwitches.length,
    globalKillActive,
    totalTokensToday,
    totalCostToday,
    usageCount24h: usageLogs.filter(l => 
      new Date(l.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
  };

  return {
    models,
    usageLogs,
    policies,
    killSwitches,
    activeKillSwitches,
    loading,
    stats,
    refetch: fetchAll,
    toggleModel,
    activateKillSwitch,
    deactivateKillSwitch,
    createPolicy,
  };
}
