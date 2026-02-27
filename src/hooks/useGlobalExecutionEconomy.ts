/**
 * React hooks for Global Execution Economy Layer (GEEL).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  saveECS, getECS,
  createProgrammableFunding, getProgrammableFunding,
  saveTrustNetwork, getUserTrustNetwork,
  saveSkillEconomy, getUserSkillEconomy,
  createExecutionCorridor, getExecutionCorridors,
  registerInstitutionalIntegration, getInstitutionalIntegrations,
  saveCapitalFormation, getCapitalFormation,
  saveGovernanceMetric, getGovernanceMetrics,
  saveMacroIntelligence, getMacroIntelligence,
  saveAIOrchestration, getAIOrchestrations, reviewAIOrchestration,
  saveIntergenerationalMemory, getIntergenerationalMemory,
  saveRevenueStream, getRevenueStreams,
  registerAPI, getAPIRegistry,
  saveSafeguard, getSafeguards,
} from "@/lib/professional/globalExecutionEconomyEngine";
import type {
  ECSInput, ProgrammableFundingInput, TrustNetworkInput, SkillEconomyInput,
  ExecutionCorridorInput, InstitutionalIntegrationInput, CapitalFormationInput,
  GovernanceMonitorInput, MacroIntelligenceInput, AIOrchestatorInput,
  IntergenerationalMemoryInput, RevenueStreamInput, APIRegistryInput, ResilienceSafeguardInput,
} from "@/lib/professional/globalExecutionEconomyEngine";

// ─── Execution Credit Score ─────────────────────────────────
export function useGEELECS(userId?: string) {
  return useQuery({ queryKey: ["geel-ecs", userId], queryFn: () => getECS(userId!), enabled: !!userId });
}
export function useSaveGEELECS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ECSInput) => saveECS(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-ecs"] }); toast.success("Execution Credit Score updated"); },
  });
}

// ─── Programmable Funding ───────────────────────────────────
export function useGEELFunding(filters?: { status?: string; funding_type?: string }) {
  return useQuery({ queryKey: ["geel-funding", filters], queryFn: () => getProgrammableFunding(filters) });
}
export function useCreateGEELFunding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProgrammableFundingInput) => createProgrammableFunding(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-funding"] }); toast.success("Programmable funding created"); },
  });
}

// ─── Trust Network ──────────────────────────────────────────
export function useGEELTrustNetwork(userId?: string) {
  return useQuery({ queryKey: ["geel-trust", userId], queryFn: () => getUserTrustNetwork(userId!), enabled: !!userId });
}
export function useSaveGEELTrustNetwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrustNetworkInput) => saveTrustNetwork(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-trust"] }); },
  });
}

// ─── Skill Economy ──────────────────────────────────────────
export function useGEELSkillEconomy(userId?: string) {
  return useQuery({ queryKey: ["geel-skill", userId], queryFn: () => getUserSkillEconomy(userId!), enabled: !!userId });
}
export function useSaveGEELSkillEconomy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SkillEconomyInput) => saveSkillEconomy(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-skill"] }); },
  });
}

// ─── Execution Corridors ────────────────────────────────────
export function useGEELCorridors(status?: string) {
  return useQuery({ queryKey: ["geel-corridors", status], queryFn: () => getExecutionCorridors(status) });
}
export function useCreateGEELCorridor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExecutionCorridorInput) => createExecutionCorridor(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-corridors"] }); toast.success("Execution corridor created"); },
  });
}

// ─── Institutional Integrations ─────────────────────────────
export function useGEELIntegrations(institutionType?: string) {
  return useQuery({ queryKey: ["geel-integrations", institutionType], queryFn: () => getInstitutionalIntegrations(institutionType) });
}
export function useRegisterGEELIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InstitutionalIntegrationInput) => registerInstitutionalIntegration(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-integrations"] }); toast.success("Integration registered"); },
  });
}

// ─── Capital Formation ──────────────────────────────────────
export function useGEELCapitalFormation(userId?: string) {
  return useQuery({ queryKey: ["geel-capital", userId], queryFn: () => getCapitalFormation(userId!), enabled: !!userId });
}
export function useSaveGEELCapitalFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CapitalFormationInput) => saveCapitalFormation(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-capital"] }); },
  });
}

// ─── Governance Monitor ─────────────────────────────────────
export function useGEELGovernance() {
  return useQuery({ queryKey: ["geel-governance"], queryFn: () => getGovernanceMetrics() });
}
export function useSaveGEELGovernance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GovernanceMonitorInput) => saveGovernanceMetric(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-governance"] }); },
  });
}

// ─── Macro Intelligence ─────────────────────────────────────
export function useGEELMacroIntelligence(region?: string) {
  return useQuery({ queryKey: ["geel-macro", region], queryFn: () => getMacroIntelligence(region) });
}
export function useSaveGEELMacroIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MacroIntelligenceInput) => saveMacroIntelligence(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-macro"] }); },
  });
}

// ─── AI Orchestrator ────────────────────────────────────────
export function useGEELAIOrchestrations(insightType?: string) {
  return useQuery({ queryKey: ["geel-ai", insightType], queryFn: () => getAIOrchestrations(insightType) });
}
export function useSaveGEELAIOrchestration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AIOrchestatorInput) => saveAIOrchestration(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-ai"] }); },
  });
}
export function useReviewGEELAIOrchestration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; reviewedBy: string }) => reviewAIOrchestration(p.id, p.reviewedBy),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-ai"] }); },
  });
}

// ─── Intergenerational Memory ───────────────────────────────
export function useGEELMemory(memoryType?: string) {
  return useQuery({ queryKey: ["geel-memory", memoryType], queryFn: () => getIntergenerationalMemory(memoryType) });
}
export function useSaveGEELMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IntergenerationalMemoryInput) => saveIntergenerationalMemory(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-memory"] }); },
  });
}

// ─── Revenue Streams ────────────────────────────────────────
export function useGEELRevenue(streamType?: string) {
  return useQuery({ queryKey: ["geel-revenue", streamType], queryFn: () => getRevenueStreams(streamType) });
}
export function useSaveGEELRevenue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RevenueStreamInput) => saveRevenueStream(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-revenue"] }); },
  });
}

// ─── API Registry ───────────────────────────────────────────
export function useGEELAPIRegistry() {
  return useQuery({ queryKey: ["geel-api"], queryFn: () => getAPIRegistry() });
}
export function useRegisterGEELAPI() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: APIRegistryInput) => registerAPI(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-api"] }); toast.success("API registered"); },
  });
}

// ─── Resilience Safeguards ──────────────────────────────────
export function useGEELSafeguards(threatType?: string) {
  return useQuery({ queryKey: ["geel-safeguards", threatType], queryFn: () => getSafeguards(threatType) });
}
export function useSaveGEELSafeguard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ResilienceSafeguardInput) => saveSafeguard(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["geel-safeguards"] }); },
  });
}

// ─── Aggregated Dashboard ──────────────────────────────────
export function useGEELUserDashboard(userId?: string) {
  const ecs = useGEELECS(userId);
  const trust = useGEELTrustNetwork(userId);
  const skills = useGEELSkillEconomy(userId);
  const capital = useGEELCapitalFormation(userId);

  return {
    executionCreditScore: ecs.data,
    trustNetwork: trust.data ?? [],
    skillEconomy: skills.data ?? [],
    capitalFormation: capital.data,
    isLoading: ecs.isLoading || trust.isLoading || skills.isLoading || capital.isLoading,
  };
}

export function useGEELGlobalDashboard() {
  const governance = useGEELGovernance();
  const macro = useGEELMacroIntelligence();
  const ai = useGEELAIOrchestrations();
  const corridors = useGEELCorridors();
  const revenue = useGEELRevenue();
  const safeguards = useGEELSafeguards();

  return {
    governanceMetrics: governance.data ?? [],
    macroIntelligence: macro.data ?? [],
    aiInsights: ai.data ?? [],
    corridors: corridors.data ?? [],
    revenueStreams: revenue.data ?? [],
    safeguards: safeguards.data ?? [],
    isLoading: governance.isLoading || macro.isLoading,
  };
}
