/**
 * React hooks for Escrow-Centric Financial Infrastructure.
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  calculateEconomicHealthIndex,
  calculateSponsorCapitalIntelligence,
  detectFinancialRisks,
  getCapitalFlowSummary,
  getInstitutionalFinancialDashboard,
  FINANCIAL_TRANSPARENCY,
} from "@/lib/professional/financialInfrastructure";
import { supabase } from "@/integrations/supabase/client";

export function useEconomicHealthIndex(
  scopeType: "platform" | "institution" = "platform",
  scopeId?: string
) {
  return useQuery({
    queryKey: ["economic-health-index", scopeType, scopeId],
    queryFn: () => calculateEconomicHealthIndex(scopeType, scopeId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSponsorCapitalIntelligence(sponsorId?: string) {
  const { user } = useAuth();
  const targetId = sponsorId || user?.id;

  return useQuery({
    queryKey: ["sponsor-capital-intelligence", targetId],
    queryFn: () => calculateSponsorCapitalIntelligence(targetId!),
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinancialRisks(
  scopeType: "platform" | "institution" = "platform",
  scopeId?: string
) {
  return useQuery({
    queryKey: ["financial-risks", scopeType, scopeId],
    queryFn: () => detectFinancialRisks(scopeType, scopeId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCapitalFlowSummary(periodDays = 30) {
  return useQuery({
    queryKey: ["capital-flow-summary", periodDays],
    queryFn: () => getCapitalFlowSummary(periodDays),
    staleTime: 3 * 60 * 1000,
  });
}

export function useInstitutionalFinancialDashboard(institutionId?: string) {
  return useQuery({
    queryKey: ["institutional-financial-dashboard", institutionId],
    queryFn: () => getInstitutionalFinancialDashboard(institutionId!),
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinancialTransparencyReports() {
  return useQuery({
    queryKey: ["financial-transparency-reports"],
    queryFn: async () => {
      const { data } = await supabase
        .from("financial_transparency_reports")
        .select("*")
        .not("published_at", "is", null)
        .order("period_end", { ascending: false });
      return data ?? [];
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function useFinancialTransparency() {
  return FINANCIAL_TRANSPARENCY;
}
