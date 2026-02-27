/**
 * React hooks for Global Knowledge Evolution & Historical Intelligence Engine (GKEHIE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  saveLongitudinalData, getLongitudinalData,
  saveDomainLifecycle, getDomainLifecycle,
  saveParadigmShift, getParadigmShifts,
  saveInstitutionalTrajectory, getInstitutionalTrajectory,
  saveGenerationalInfluence, getGenerationalTree,
  saveKnowledgeSurvival, getKnowledgeSurvival,
  saveInnovationWave, getInnovationWaves,
  saveFundingRegime, getFundingRegimes,
  saveSustainability, getSustainabilityScores,
  crossDecadeComparison, generateHistoricalInsights,
} from "@/lib/professional/knowledgeEvolutionEngine";
import type {
  LongitudinalDataInput, DomainLifecycleInput, ParadigmShiftInput,
  InstitutionalTrajectoryInput, GenerationalInfluenceInput,
  KnowledgeSurvivalInput, InnovationWaveInput, FundingRegimeInput,
  SustainabilityScoreInput, InnovationWavePhase,
} from "@/lib/professional/knowledgeEvolutionEngine";

// === Longitudinal Data ===
export function useLongitudinalData(filters: Parameters<typeof getLongitudinalData>[0]) {
  return useQuery({ queryKey: ["longitudinalData", filters], queryFn: () => getLongitudinalData(filters) });
}

export function useSaveLongitudinalData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LongitudinalDataInput) => saveLongitudinalData(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["longitudinalData"] }); toast.success("Longitudinal data recorded"); },
  });
}

// === Domain Lifecycle ===
export function useDomainLifecycle(domain?: string) {
  return useQuery({ queryKey: ["domainLifecycle", domain], queryFn: () => getDomainLifecycle(domain) });
}

export function useSaveDomainLifecycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DomainLifecycleInput) => saveDomainLifecycle(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["domainLifecycle"] }); toast.success("Domain lifecycle phase saved"); },
  });
}

// === Paradigm Shifts ===
export function useParadigmShifts(filters?: Parameters<typeof getParadigmShifts>[0]) {
  return useQuery({ queryKey: ["paradigmShifts", filters], queryFn: () => getParadigmShifts(filters) });
}

export function useSaveParadigmShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ParadigmShiftInput) => saveParadigmShift(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paradigmShifts"] }); toast.success("Paradigm shift recorded"); },
  });
}

// === Institutional Trajectory ===
export function useInstitutionalTrajectory(institutionId?: string, yearFrom?: number, yearTo?: number) {
  return useQuery({
    queryKey: ["institutionalTrajectory", institutionId, yearFrom, yearTo],
    queryFn: () => getInstitutionalTrajectory(institutionId!, yearFrom, yearTo),
    enabled: !!institutionId,
  });
}

export function useSaveInstitutionalTrajectory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InstitutionalTrajectoryInput) => saveInstitutionalTrajectory(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["institutionalTrajectory"] }); toast.success("Institutional trajectory saved"); },
  });
}

// === Generational Influence ===
export function useGenerationalTree(userId?: string) {
  return useQuery({
    queryKey: ["generationalTree", userId],
    queryFn: () => getGenerationalTree(userId!),
    enabled: !!userId,
  });
}

export function useSaveGenerationalInfluence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GenerationalInfluenceInput) => saveGenerationalInfluence(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["generationalTree"] }); toast.success("Generational influence recorded"); },
  });
}

// === Knowledge Survival ===
export function useKnowledgeSurvival(entityType?: string, entityId?: string) {
  return useQuery({ queryKey: ["knowledgeSurvival", entityType, entityId], queryFn: () => getKnowledgeSurvival(entityType, entityId) });
}

export function useSaveKnowledgeSurvival() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: KnowledgeSurvivalInput) => saveKnowledgeSurvival(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledgeSurvival"] }); toast.success("Knowledge survival index saved"); },
  });
}

// === Innovation Waves ===
export function useInnovationWaves(domain?: string, phase?: InnovationWavePhase) {
  return useQuery({ queryKey: ["innovationWaves", domain, phase], queryFn: () => getInnovationWaves(domain, phase) });
}

export function useSaveInnovationWave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InnovationWaveInput) => saveInnovationWave(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["innovationWaves"] }); toast.success("Innovation wave recorded"); },
  });
}

// === Funding Regimes ===
export function useFundingRegimes(countryCode?: string) {
  return useQuery({ queryKey: ["fundingRegimes", countryCode], queryFn: () => getFundingRegimes(countryCode) });
}

export function useSaveFundingRegime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FundingRegimeInput) => saveFundingRegime(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fundingRegimes"] }); toast.success("Funding regime recorded"); },
  });
}

// === Sustainability ===
export function useSustainabilityScores(entityType?: string, entityId?: string) {
  return useQuery({ queryKey: ["sustainability", entityType, entityId], queryFn: () => getSustainabilityScores(entityType, entityId) });
}

export function useSaveSustainability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SustainabilityScoreInput) => saveSustainability(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sustainability"] }); toast.success("Sustainability score saved"); },
  });
}

// === Cross-Decade Comparison ===
export function useCrossDecadeComparison(params?: Parameters<typeof crossDecadeComparison>[0]) {
  return useQuery({
    queryKey: ["crossDecadeComparison", params],
    queryFn: () => crossDecadeComparison(params!),
    enabled: !!params?.entityType && !!params?.entityId,
  });
}

// === Historical Insights ===
export function useHistoricalInsights(data?: Parameters<typeof generateHistoricalInsights>[0]) {
  if (!data) return [];
  return generateHistoricalInsights(data);
}
