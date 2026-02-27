/**
 * React hooks for Global Professional Orchestration Engine (GPOE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createInitiative, getInitiatives, getInitiative,
  addParticipant, getParticipants,
  saveEcosystemAlignment, getEcosystemAlignment,
  saveMobilizationMetrics, getMobilizationMetrics,
  saveCrossBorderInit, getCrossBorderInit,
  addInitiativeFunding, getInitiativeFunding,
  saveInitiativeGovernance, getInitiativeGovernance,
  addStartupTracking, getStartupTracking,
  saveMovementIndex, getMovementIndex, getMovementRankings,
  addCoordinationMemory, getCoordinationMemory,
} from "@/lib/professional/globalOrchestrationEngine";
import type {
  InitiativeInput, ParticipantInput, EcosystemAlignmentInput,
  MobilizationInput, CrossBorderInitInput, InitiativeFundingInput,
  GovernanceInput, MovementIndexInput, CoordinationMemoryInput,
} from "@/lib/professional/globalOrchestrationEngine";

// === Initiatives ===
export function useInitiatives(status?: string) {
  return useQuery({ queryKey: ["initiatives", status], queryFn: () => getInitiatives(status) });
}
export function useInitiative(id?: string) {
  return useQuery({ queryKey: ["initiative", id], queryFn: () => getInitiative(id!), enabled: !!id });
}
export function useCreateInitiative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InitiativeInput) => createInitiative(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initiatives"] }); toast.success("Initiative created"); },
  });
}

// === Participants ===
export function useParticipants(initiativeId?: string) {
  return useQuery({ queryKey: ["initParts", initiativeId], queryFn: () => getParticipants(initiativeId!), enabled: !!initiativeId });
}
export function useAddParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ParticipantInput) => addParticipant(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initParts"] }); toast.success("Participant added"); },
  });
}

// === Ecosystem Alignment ===
export function useEcosystemAlignment(initiativeId?: string) {
  return useQuery({ queryKey: ["ecoAlign", initiativeId], queryFn: () => getEcosystemAlignment(initiativeId!), enabled: !!initiativeId });
}
export function useSaveEcosystemAlignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EcosystemAlignmentInput) => saveEcosystemAlignment(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecoAlign"] }); },
  });
}

// === Mobilization ===
export function useMobilizationMetrics(initiativeId?: string) {
  return useQuery({ queryKey: ["initMobil", initiativeId], queryFn: () => getMobilizationMetrics(initiativeId!), enabled: !!initiativeId });
}
export function useSaveMobilizationMetrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MobilizationInput) => saveMobilizationMetrics(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initMobil"] }); },
  });
}

// === Cross-Border ===
export function useCrossBorderInit(initiativeId?: string) {
  return useQuery({ queryKey: ["initXBorder", initiativeId], queryFn: () => getCrossBorderInit(initiativeId!), enabled: !!initiativeId });
}
export function useSaveCrossBorderInit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossBorderInitInput) => saveCrossBorderInit(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initXBorder"] }); },
  });
}

// === Funding ===
export function useInitiativeFunding(initiativeId?: string) {
  return useQuery({ queryKey: ["initFund", initiativeId], queryFn: () => getInitiativeFunding(initiativeId!), enabled: !!initiativeId });
}
export function useAddInitiativeFunding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InitiativeFundingInput) => addInitiativeFunding(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initFund"] }); toast.success("Funding added"); },
  });
}

// === Governance ===
export function useInitiativeGovernance(initiativeId?: string) {
  return useQuery({ queryKey: ["initGov", initiativeId], queryFn: () => getInitiativeGovernance(initiativeId!), enabled: !!initiativeId });
}
export function useSaveInitiativeGovernance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GovernanceInput) => saveInitiativeGovernance(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initGov"] }); },
  });
}

// === Startup Tracking ===
export function useStartupTracking(initiativeId?: string) {
  return useQuery({ queryKey: ["initStartup", initiativeId], queryFn: () => getStartupTracking(initiativeId!), enabled: !!initiativeId });
}
export function useAddStartupTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { initiative_id: string; startup_name: string; [k: string]: unknown }) => addStartupTracking(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initStartup"] }); },
  });
}

// === Movement Index ===
export function useMovementIndex(initiativeId?: string) {
  return useQuery({ queryKey: ["initMvmt", initiativeId], queryFn: () => getMovementIndex(initiativeId!), enabled: !!initiativeId });
}
export function useMovementRankings(limit = 20) {
  return useQuery({ queryKey: ["mvmtRankings", limit], queryFn: () => getMovementRankings(limit) });
}
export function useSaveMovementIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MovementIndexInput) => saveMovementIndex(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initMvmt"] }); },
  });
}

// === Coordination Memory ===
export function useCoordinationMemory(initiativeId?: string) {
  return useQuery({ queryKey: ["initMemory", initiativeId], queryFn: () => getCoordinationMemory(initiativeId!), enabled: !!initiativeId });
}
export function useAddCoordinationMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CoordinationMemoryInput) => addCoordinationMemory(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["initMemory"] }); },
  });
}

// === Aggregated Initiative Dashboard ===
export function useInitiativeDashboard(initiativeId?: string) {
  const initiative = useInitiative(initiativeId);
  const participants = useParticipants(initiativeId);
  const alignment = useEcosystemAlignment(initiativeId);
  const mobilization = useMobilizationMetrics(initiativeId);
  const crossBorder = useCrossBorderInit(initiativeId);
  const funding = useInitiativeFunding(initiativeId);
  const governance = useInitiativeGovernance(initiativeId);
  const movement = useMovementIndex(initiativeId);
  const memory = useCoordinationMemory(initiativeId);

  return {
    initiative: initiative.data, initiativeLoading: initiative.isLoading,
    participants: participants.data ?? [], participantsLoading: participants.isLoading,
    alignment: alignment.data ?? [], alignmentLoading: alignment.isLoading,
    mobilization: mobilization.data, mobilizationLoading: mobilization.isLoading,
    crossBorder: crossBorder.data ?? [], crossBorderLoading: crossBorder.isLoading,
    funding: funding.data ?? [], fundingLoading: funding.isLoading,
    governance: governance.data, governanceLoading: governance.isLoading,
    movement: movement.data, movementLoading: movement.isLoading,
    memory: memory.data ?? [], memoryLoading: memory.isLoading,
    isLoading: initiative.isLoading || mobilization.isLoading,
  };
}
