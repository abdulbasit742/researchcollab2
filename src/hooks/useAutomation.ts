import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AutomationRule {
  id: string;
  institution_id: string;
  rule_type: string;
  rule_name: string;
  trigger_condition: Record<string, unknown>;
  action_type: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationLogEntry {
  id: string;
  actor_type: string;
  automation_type: string;
  entity_type: string;
  entity_id: string | null;
  action_taken: string;
  institution_id: string | null;
  created_at: string;
}

export interface WorkflowEscalation {
  id: string;
  entity_type: string;
  entity_id: string;
  escalation_type: string;
  institution_id: string | null;
  triggered_at: string;
  resolved: boolean;
  resolved_at: string | null;
}

export interface DerivedProjectStatus {
  id: string;
  project_id: string;
  status_label: string;
  derived_from: Record<string, unknown>;
  generated_at: string;
}

export function useAutomationRules(institutionId?: string) {
  const qc = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["automation-rules", institutionId],
    queryFn: async (): Promise<AutomationRule[]> => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false });
      return (data ?? []) as AutomationRule[];
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });

  const toggleRule = useMutation({
    mutationFn: async ({ ruleId, enabled }: { ruleId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("automation_rules")
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq("id", ruleId);
      if (error) throw error;
      // Log toggle
      await supabase.from("automation_logs").insert({
        actor_type: "user",
        automation_type: "rule_toggle",
        entity_type: "automation_rule",
        entity_id: ruleId,
        action_taken: enabled ? "enabled" : "disabled",
        institution_id: institutionId,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automation-rules"] }),
  });

  const createRule = useMutation({
    mutationFn: async (rule: {
      rule_type: string;
      rule_name: string;
      trigger_condition: Record<string, unknown>;
      action_type: string;
    }) => {
      if (!institutionId) throw new Error("Missing institution");
      const { error } = await supabase.from("automation_rules").insert([{
        institution_id: institutionId,
        rule_type: rule.rule_type,
        rule_name: rule.rule_name,
        trigger_condition: rule.trigger_condition as any,
        action_type: rule.action_type,
      }]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automation-rules"] }),
  });

  return { rules, isLoading, toggleRule: toggleRule.mutate, createRule: createRule.mutate };
}

export function useAutomationLogs(institutionId?: string, limit = 50) {
  return useQuery({
    queryKey: ["automation-logs", institutionId, limit],
    queryFn: async (): Promise<AutomationLogEntry[]> => {
      let query = supabase
        .from("automation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return (data ?? []) as AutomationLogEntry[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useWorkflowEscalations(institutionId?: string) {
  return useQuery({
    queryKey: ["workflow-escalations", institutionId],
    queryFn: async (): Promise<WorkflowEscalation[]> => {
      let query = supabase
        .from("workflow_escalations")
        .select("*")
        .eq("resolved", false)
        .order("triggered_at", { ascending: false })
        .limit(30);
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return (data ?? []) as WorkflowEscalation[];
    },
    enabled: !!institutionId,
    staleTime: 3 * 60 * 1000,
  });
}

export function useDerivedProjectStatuses(projectIds?: string[]) {
  return useQuery({
    queryKey: ["derived-project-status", projectIds],
    queryFn: async (): Promise<DerivedProjectStatus[]> => {
      if (!projectIds?.length) return [];
      const { data } = await supabase
        .from("derived_project_status")
        .select("*")
        .in("project_id", projectIds)
        .order("generated_at", { ascending: false });
      return (data ?? []) as DerivedProjectStatus[];
    },
    enabled: !!projectIds?.length,
    staleTime: 5 * 60 * 1000,
  });
}
