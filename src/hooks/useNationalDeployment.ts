import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STALE = 10 * 60 * 1000;

export function useNationalRegistries() {
  return useQuery({
    queryKey: ["national-registries"],
    queryFn: async () => {
      const { data } = await supabase.from("national_registry").select("*").eq("status", "active").order("country_name");
      return (data ?? []) as any[];
    },
    staleTime: STALE,
  });
}

export function useRegionalClusters(registryId?: string) {
  return useQuery({
    queryKey: ["regional-clusters", registryId],
    queryFn: async () => {
      if (!registryId) return [];
      const { data } = await supabase.from("regional_clusters").select("*").eq("national_registry_id", registryId).order("region_name");
      return (data ?? []) as any[];
    },
    enabled: !!registryId,
    staleTime: STALE,
  });
}

export function useNationalComplianceMetrics(registryId?: string) {
  return useQuery({
    queryKey: ["national-compliance", registryId],
    queryFn: async () => {
      if (!registryId) return null;
      const { data } = await supabase.from("national_compliance_metrics").select("*").eq("national_registry_id", registryId).order("generated_at", { ascending: false }).limit(1).maybeSingle();
      return data as any | null;
    },
    enabled: !!registryId,
    staleTime: STALE,
  });
}

export function useNationalExecutionIndex(registryId?: string) {
  return useQuery({
    queryKey: ["national-execution", registryId],
    queryFn: async () => {
      if (!registryId) return null;
      const { data } = await supabase.from("national_execution_index").select("*").eq("national_registry_id", registryId).order("generated_at", { ascending: false }).limit(1).maybeSingle();
      return data as any | null;
    },
    enabled: !!registryId,
    staleTime: STALE,
  });
}

export function useNationalCertVerify(certificateId?: string) {
  return useQuery({
    queryKey: ["national-cert-verify", certificateId],
    queryFn: async () => {
      if (!certificateId) return null;
      const { data } = await supabase.from("national_certification_registry").select("certificate_id, issuing_institution_name, certificate_type, certificate_hash, holder_display_name, issued_at").eq("certificate_id", certificateId).maybeSingle();
      return data as any | null;
    },
    enabled: !!certificateId,
    staleTime: STALE,
  });
}

export function useNationalRegistrySettings(registryId?: string) {
  return useQuery({
    queryKey: ["national-settings", registryId],
    queryFn: async () => {
      if (!registryId) return null;
      const { data } = await supabase.from("national_registry_settings").select("*").eq("national_registry_id", registryId).maybeSingle();
      return data as any | null;
    },
    enabled: !!registryId,
    staleTime: STALE,
  });
}
