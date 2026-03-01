import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const STALE = 10 * 60 * 1000;

export function useGlobalFederations() {
  return useQuery({
    queryKey: ["global-federations"],
    queryFn: async () => {
      const { data } = await supabase.from("global_federation_registry").select("*").eq("status", "active").order("federation_name");
      return (data ?? []) as any[];
    },
    staleTime: STALE,
  });
}

export function useFederationMembers(federationId?: string) {
  return useQuery({
    queryKey: ["federation-members", federationId],
    queryFn: async () => {
      if (!federationId) return [];
      const { data } = await supabase.from("federation_members").select("*, national_registry(id, country_name, country_code)").eq("federation_id", federationId).eq("membership_status", "active");
      return (data ?? []) as any[];
    },
    enabled: !!federationId,
    staleTime: STALE,
  });
}

export function useGlobalExecutionIndex(federationId?: string) {
  return useQuery({
    queryKey: ["global-execution-index", federationId],
    queryFn: async () => {
      if (!federationId) return null;
      const { data } = await supabase.from("global_execution_index").select("*").eq("federation_id", federationId).order("generated_at", { ascending: false }).limit(1).maybeSingle();
      return data as any | null;
    },
    enabled: !!federationId,
    staleTime: STALE,
  });
}

export function useFederationComplianceIndex(federationId?: string) {
  return useQuery({
    queryKey: ["fed-compliance-index", federationId],
    queryFn: async () => {
      if (!federationId) return null;
      const { data } = await supabase.from("federation_compliance_index").select("*").eq("federation_id", federationId).order("generated_at", { ascending: false }).limit(1).maybeSingle();
      return data as any | null;
    },
    enabled: !!federationId,
    staleTime: STALE,
  });
}

export function useCrossBorderCollaborations() {
  return useQuery({
    queryKey: ["cross-border-collabs"],
    queryFn: async () => {
      const { data } = await supabase.from("cross_border_collaborations").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(50);
      return (data ?? []) as any[];
    },
    staleTime: STALE,
  });
}

export function useFederationInteropStatus(federationId?: string) {
  return useQuery({
    queryKey: ["fed-interop", federationId],
    queryFn: async () => {
      if (!federationId) return [];
      const { data } = await supabase.from("federation_interoperability_status").select("*, national_registry(country_name, country_code)").eq("federation_id", federationId);
      return (data ?? []) as any[];
    },
    enabled: !!federationId,
    staleTime: STALE,
  });
}

export function useGlobalCertVerify(certHash?: string) {
  return useQuery({
    queryKey: ["global-cert-verify", certHash],
    queryFn: async () => {
      if (!certHash) return null;
      const { data } = await supabase.from("national_certification_registry").select("certificate_id, issuing_institution_name, certificate_type, certificate_hash, holder_display_name, issued_at").eq("certificate_hash", certHash).maybeSingle();
      return data as any | null;
    },
    enabled: !!certHash,
    staleTime: STALE,
  });
}
