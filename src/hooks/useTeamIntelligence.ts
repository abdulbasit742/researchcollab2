/**
 * React hooks for AI Collaboration & Team Intelligence Engine (ACTIE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  saveTeamCompatibility, getTeamCompatibility,
  saveSkillComplementarity, getSkillComplementarity,
  saveExecutionPrediction, getExecutionPredictions,
  saveFundingEligibility, getFundingEligibility,
  saveCrossBorderIntel, getCrossBorderIntel,
  saveInnovationSynergy, getInnovationSynergy,
  saveTeamRisk, getTeamRisk,
  saveRoleAssignment, getRoleAssignments,
  saveTeamFormation, getTeamFormations,
  saveHistoricalPerformance, getHistoricalPerformance,
  recordTeamEvolution, getTeamEvolution,
} from "@/lib/professional/teamIntelligenceEngine";
import type {
  TeamCompatibilityInput, SkillComplementarityInput, ExecutionPredictionInput,
  FundingEligibilityInput, CrossBorderIntelInput, InnovationSynergyInput,
  TeamRiskInput, RoleAssignmentInput, TeamFormationRequest,
  HistoricalPerformanceInput, TeamEvolutionInput,
} from "@/lib/professional/teamIntelligenceEngine";

// === Team Compatibility ===
export function useTeamCompatibility(teamId?: string, projectId?: string) {
  return useQuery({ queryKey: ["teamCompat", teamId, projectId], queryFn: () => getTeamCompatibility(teamId, projectId), enabled: !!teamId || !!projectId });
}
export function useSaveTeamCompatibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TeamCompatibilityInput) => saveTeamCompatibility(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teamCompat"] }); toast.success("Compatibility computed"); },
  });
}

// === Skill Complementarity ===
export function useSkillComplementarity(teamId?: string, projectId?: string) {
  return useQuery({ queryKey: ["skillComp", teamId, projectId], queryFn: () => getSkillComplementarity(teamId, projectId), enabled: !!teamId || !!projectId });
}
export function useSaveSkillComplementarity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SkillComplementarityInput) => saveSkillComplementarity(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["skillComp"] }); },
  });
}

// === Execution Predictions ===
export function useExecutionPredictions(teamId?: string) {
  return useQuery({ queryKey: ["execPred", teamId], queryFn: () => getExecutionPredictions(teamId), enabled: !!teamId });
}
export function useSaveExecutionPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExecutionPredictionInput) => saveExecutionPrediction(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["execPred"] }); toast.success("Prediction saved"); },
  });
}

// === Funding Eligibility ===
export function useFundingEligibility(teamId?: string) {
  return useQuery({ queryKey: ["fundElig", teamId], queryFn: () => getFundingEligibility(teamId), enabled: !!teamId });
}
export function useSaveFundingEligibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FundingEligibilityInput) => saveFundingEligibility(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fundElig"] }); },
  });
}

// === Cross-Border Intel ===
export function useCrossBorderIntel(teamId?: string) {
  return useQuery({ queryKey: ["crossBorder", teamId], queryFn: () => getCrossBorderIntel(teamId), enabled: !!teamId });
}
export function useSaveCrossBorderIntel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossBorderIntelInput) => saveCrossBorderIntel(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crossBorder"] }); },
  });
}

// === Innovation Synergy ===
export function useInnovationSynergy(teamId?: string) {
  return useQuery({ queryKey: ["innovSyn", teamId], queryFn: () => getInnovationSynergy(teamId), enabled: !!teamId });
}
export function useSaveInnovationSynergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InnovationSynergyInput) => saveInnovationSynergy(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["innovSyn"] }); },
  });
}

// === Team Risk ===
export function useTeamRisk(teamId?: string) {
  return useQuery({ queryKey: ["teamRisk", teamId], queryFn: () => getTeamRisk(teamId), enabled: !!teamId });
}
export function useSaveTeamRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TeamRiskInput) => saveTeamRisk(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teamRisk"] }); toast.success("Risk analysis saved"); },
  });
}

// === Role Assignments ===
export function useRoleAssignments(teamId?: string) {
  return useQuery({ queryKey: ["roleAssign", teamId], queryFn: () => getRoleAssignments(teamId!), enabled: !!teamId });
}
export function useSaveRoleAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RoleAssignmentInput) => saveRoleAssignment(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["roleAssign"] }); toast.success("Role assigned"); },
  });
}

// === AI Team Formation ===
export function useTeamFormations(requestedBy?: string) {
  return useQuery({ queryKey: ["teamForm", requestedBy], queryFn: () => getTeamFormations(requestedBy!), enabled: !!requestedBy });
}
export function useSaveTeamFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TeamFormationRequest) => saveTeamFormation(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teamForm"] }); toast.success("Team suggestion created"); },
  });
}

// === Historical Performance ===
export function useHistoricalPerformance(teamId?: string) {
  return useQuery({ queryKey: ["histPerf", teamId], queryFn: () => getHistoricalPerformance(teamId), staleTime: 10 * 60 * 1000 });
}
export function useSaveHistoricalPerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HistoricalPerformanceInput) => saveHistoricalPerformance(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["histPerf"] }); },
  });
}

// === Team Evolution ===
export function useTeamEvolution(teamId?: string) {
  return useQuery({ queryKey: ["teamEvol", teamId], queryFn: () => getTeamEvolution(teamId!), enabled: !!teamId });
}
export function useRecordTeamEvolution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TeamEvolutionInput) => recordTeamEvolution(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teamEvol"] }); toast.success("Evolution event recorded"); },
  });
}

// === Aggregated Team Intelligence Dashboard ===
export function useTeamIntelligenceDashboard(teamId?: string) {
  const compat = useTeamCompatibility(teamId);
  const skills = useSkillComplementarity(teamId);
  const predictions = useExecutionPredictions(teamId);
  const risk = useTeamRisk(teamId);
  const roles = useRoleAssignments(teamId);
  const synergy = useInnovationSynergy(teamId);
  const evolution = useTeamEvolution(teamId);
  const crossBorder = useCrossBorderIntel(teamId);

  return {
    compatibility: compat.data ?? [], compatLoading: compat.isLoading,
    skills: skills.data ?? [], skillsLoading: skills.isLoading,
    predictions: predictions.data ?? [], predictionsLoading: predictions.isLoading,
    risk: risk.data ?? [], riskLoading: risk.isLoading,
    roles: roles.data ?? [], rolesLoading: roles.isLoading,
    synergy: synergy.data ?? [], synergyLoading: synergy.isLoading,
    evolution: evolution.data ?? [], evolutionLoading: evolution.isLoading,
    crossBorder: crossBorder.data ?? [], crossBorderLoading: crossBorder.isLoading,
    isLoading: compat.isLoading || risk.isLoading || predictions.isLoading,
  };
}
