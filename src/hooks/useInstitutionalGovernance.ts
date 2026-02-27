/**
 * React hooks for Institutional & Government Integration Architecture.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  calculateInstitutionalTrustScore,
  buildGovernanceDashboard,
  generateAccreditationReport,
  getGovernmentInnovationSnapshot,
  getGrantFundingRecords,
  getCrossInstitutionAgreements,
  generateComplianceAuditPackage,
  INSTITUTIONAL_GOVERNANCE_TRANSPARENCY,
} from "@/lib/professional/institutionalGovernance";
import { supabase } from "@/integrations/supabase/client";

export function useInstitutionalTrustScore(institutionId?: string) {
  return useQuery({
    queryKey: ["institutional-trust-score", institutionId],
    queryFn: () => calculateInstitutionalTrustScore(institutionId!),
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGovernanceDashboard(institutionId?: string) {
  return useQuery({
    queryKey: ["governance-dashboard", institutionId],
    queryFn: () => buildGovernanceDashboard(institutionId!),
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateAccreditationReport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      institutionId: string;
      periodStart: string;
      periodEnd: string;
    }) => generateAccreditationReport(params.institutionId, params.periodStart, params.periodEnd),
    onSuccess: () => {
      toast({ title: "Report generated", description: "Accreditation report has been created." });
      queryClient.invalidateQueries({ queryKey: ["accreditation-reports"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useAccreditationReports(institutionId?: string) {
  return useQuery({
    queryKey: ["accreditation-reports", institutionId],
    queryFn: async () => {
      let query = supabase.from("accreditation_reports").select("*").order("created_at", { ascending: false });
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return data ?? [];
    },
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGovernmentInnovationSnapshots(region?: string) {
  return useQuery({
    queryKey: ["government-innovation", region],
    queryFn: () => getGovernmentInnovationSnapshot(region),
    staleTime: 10 * 60 * 1000,
  });
}

export function useGrantFundingRecords(institutionId?: string) {
  return useQuery({
    queryKey: ["grant-funding", institutionId],
    queryFn: () => getGrantFundingRecords(institutionId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCrossInstitutionAgreements(institutionId?: string) {
  return useQuery({
    queryKey: ["cross-institution-agreements", institutionId],
    queryFn: () => getCrossInstitutionAgreements(institutionId!),
    enabled: !!institutionId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useComplianceAuditExport() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (institutionId: string) => generateComplianceAuditPackage(institutionId),
    onSuccess: () => {
      toast({ title: "Audit package generated", description: "Compliance audit data has been exported." });
    },
  });
}

export function useInstitutionalTransparencySettings(institutionId?: string) {
  return useQuery({
    queryKey: ["institutional-transparency", institutionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("institutional_transparency")
        .select("*")
        .eq("institution_id", institutionId!)
        .maybeSingle();
      return data;
    },
    enabled: !!institutionId,
  });
}

export function useResearchCommercialization(institutionId?: string) {
  return useQuery({
    queryKey: ["research-commercialization", institutionId],
    queryFn: async () => {
      let query = supabase.from("research_commercialization").select("*").order("created_at", { ascending: false });
      if (institutionId) query = query.eq("institution_id", institutionId);
      const { data } = await query;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGovernanceTransparency() {
  return INSTITUTIONAL_GOVERNANCE_TRANSPARENCY;
}
