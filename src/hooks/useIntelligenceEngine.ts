/**
 * React hooks for AI Intelligence & 20-Year Domination Engine.
 */

import { useQuery } from "@tanstack/react-query";
import {
  predictExecutionRisk,
  getCapitalAllocationRecommendations,
  getTalentDevelopmentInsights,
  getInstitutionalForecast,
  detectFraudSignals,
  getSmartMatches,
  getEscrowHealthAlerts,
  getInnovationIntelligence,
  AI_INTELLIGENCE_TRANSPARENCY,
} from "@/lib/professional/intelligenceEngine";

export function useExecutionRiskPrediction(projectId?: string) {
  return useQuery({
    queryKey: ["execution-risk", projectId],
    queryFn: () => predictExecutionRisk(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCapitalAllocationAI(sponsorId?: string) {
  return useQuery({
    queryKey: ["capital-allocation-ai", sponsorId],
    queryFn: () => getCapitalAllocationRecommendations(sponsorId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useTalentDevelopmentInsights(userId?: string) {
  return useQuery({
    queryKey: ["talent-development", userId],
    queryFn: () => getTalentDevelopmentInsights(userId!),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useInstitutionalForecast(institutionId?: string) {
  return useQuery({
    queryKey: ["institutional-forecast", institutionId],
    queryFn: () => getInstitutionalForecast(institutionId!),
    enabled: !!institutionId,
    staleTime: 15 * 60 * 1000,
  });
}

export function useFraudDetection() {
  return useQuery({
    queryKey: ["fraud-signals"],
    queryFn: detectFraudSignals,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSmartMatches(userId?: string) {
  return useQuery({
    queryKey: ["smart-matches", userId],
    queryFn: () => getSmartMatches(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useEscrowHealthAlerts() {
  return useQuery({
    queryKey: ["escrow-health-alerts"],
    queryFn: getEscrowHealthAlerts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInnovationIntelligence(domain?: string, region?: string) {
  return useQuery({
    queryKey: ["innovation-intelligence", domain, region],
    queryFn: () => getInnovationIntelligence(domain, region),
    staleTime: 30 * 60 * 1000,
  });
}

export function useAITransparency() {
  return AI_INTELLIGENCE_TRANSPARENCY;
}
