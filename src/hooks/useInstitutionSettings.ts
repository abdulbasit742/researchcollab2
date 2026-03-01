import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InstitutionSettings {
  id: string;
  institution_id: string;
  branding_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  custom_domain: string | null;
  feature_flags: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export function useInstitutionSettings(institutionId?: string) {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["institution-settings", institutionId],
    queryFn: async (): Promise<InstitutionSettings | null> => {
      if (!institutionId) return null;
      const { data } = await supabase
        .from("institution_settings")
        .select("*")
        .eq("institution_id", institutionId)
        .maybeSingle();
      return data as InstitutionSettings | null;
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<Omit<InstitutionSettings, "id" | "institution_id" | "created_at">>) => {
      if (!institutionId) throw new Error("No institution");
      const { error } = await supabase
        .from("institution_settings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("institution_id", institutionId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institution-settings", institutionId] }),
  });

  const isFeatureEnabled = (flag: string): boolean => {
    return settings?.feature_flags?.[flag] ?? true;
  };

  return { settings, isLoading, updateSettings: updateSettings.mutate, isFeatureEnabled };
}
