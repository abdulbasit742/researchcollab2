import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ── Departments ──
export function useDepartments(institutionId?: string) {
  return useQuery({
    queryKey: ["departments", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("institution_departments")
        .select("*")
        .eq("institution_id", institutionId)
        .order("department_name");
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateDepartment(institutionId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, code }: { name: string; code?: string }) => {
      if (!institutionId) throw new Error("No institution");
      const { error } = await supabase.from("institution_departments").insert([{
        institution_id: institutionId,
        department_name: name,
        department_code: code ?? null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments", institutionId] }),
  });
}

// ── Onboarding Status ──
export function useOnboardingStatus(institutionId?: string) {
  return useQuery({
    queryKey: ["onboarding-status", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("institution_onboarding_status")
        .select("*")
        .eq("institution_id", institutionId)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateOnboardingStatus(institutionId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!institutionId) throw new Error("No institution");
      const { data: existing } = await supabase
        .from("institution_onboarding_status")
        .select("id")
        .eq("institution_id", institutionId)
        .maybeSingle();
      if (existing) {
        await supabase.from("institution_onboarding_status")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("institution_id", institutionId);
      } else {
        await supabase.from("institution_onboarding_status")
          .insert([{ institution_id: institutionId, ...updates }]);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboarding-status", institutionId] }),
  });
}

// ── Adoption Metrics ──
export function useAdoptionMetrics(institutionId?: string) {
  return useQuery({
    queryKey: ["adoption-metrics", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("institution_adoption_metrics")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(12);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Rollout Phases ──
export function useRolloutPhases(institutionId?: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["rollout-phases", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("institution_rollout_phases")
        .select("*")
        .eq("institution_id", institutionId)
        .order("created_at");
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });

  const updatePhase = useMutation({
    mutationFn: async ({ phaseId, status }: { phaseId: string; status: string }) => {
      const updates: Record<string, any> = { phase_status: status };
      if (status === "in_progress") updates.start_date = new Date().toISOString();
      if (status === "completed") updates.completion_date = new Date().toISOString();
      await supabase.from("institution_rollout_phases").update(updates).eq("id", phaseId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rollout-phases", institutionId] }),
  });

  return { ...query, updatePhase: updatePhase.mutate };
}

// ── Expansion Health ──
export function useExpansionHealth(institutionId?: string) {
  return useQuery({
    queryKey: ["expansion-health", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("institution_expansion_health")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Growth Forecast ──
export function useGrowthForecast(institutionId?: string) {
  return useQuery({
    queryKey: ["growth-forecast", institutionId],
    queryFn: async () => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("institution_growth_forecast")
        .select("*")
        .eq("institution_id", institutionId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Bulk Import Jobs ──
export function useBulkImportJobs(institutionId?: string) {
  return useQuery({
    queryKey: ["bulk-import-jobs", institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data } = await supabase
        .from("bulk_user_import_jobs")
        .select("*")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as any[];
    },
    enabled: !!institutionId,
    staleTime: 2 * 60 * 1000,
  });
}
