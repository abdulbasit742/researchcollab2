/**
 * React hooks for Professional Longitudinal Memory System (PLMS).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  saveCareerSnapshot, getCareerSnapshots,
  saveProjectMemory, getProjectMemories,
  recordTrustHistory, getTrustHistory,
  recordFundingMilestone, getFundingProgression,
  recordGlobalMobility, getGlobalMobility,
  upsertSkillCompounding, getSkillCompounding,
  upsertCollaborationEvolution, getCollaborationEvolution,
  recordDisputeRecovery, getDisputeRecovery,
  saveInstitutionalMemory, getInstitutionalMemory,
  createAnniversary, getAnniversaries, markAnniversaryCelebrated,
  createDataExport, getDataExports,
  archiveInitiative, getInitiativeArchives,
} from "@/lib/professional/longitudinalMemoryEngine";
import type {
  CareerSnapshotInput, ProjectMemoryInput, TrustHistoryInput,
  FundingProgressionInput, GlobalMobilityInput, SkillCompoundingInput,
  CollaborationEvolutionInput, DisputeRecoveryInput, InstitutionalMemoryInput,
  AnniversaryInput, DataExportInput, InitiativeArchiveInput,
} from "@/lib/professional/longitudinalMemoryEngine";

// === Career Snapshots ===
export function useCareerSnapshots(userId?: string) {
  return useQuery({ queryKey: ["plmsCareer", userId], queryFn: () => getCareerSnapshots(userId!), enabled: !!userId });
}
export function useSaveCareerSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CareerSnapshotInput) => saveCareerSnapshot(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsCareer"] }); toast.success("Career snapshot saved"); },
  });
}

// === Project Memory ===
export function useProjectMemories(userId?: string) {
  return useQuery({ queryKey: ["plmsProject", userId], queryFn: () => getProjectMemories(userId!), enabled: !!userId });
}
export function useSaveProjectMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProjectMemoryInput) => saveProjectMemory(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsProject"] }); },
  });
}

// === Trust History ===
export function useTrustHistory(userId?: string) {
  return useQuery({ queryKey: ["plmsTrust", userId], queryFn: () => getTrustHistory(userId!), enabled: !!userId });
}
export function useRecordTrustHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrustHistoryInput) => recordTrustHistory(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsTrust"] }); },
  });
}

// === Funding Progression ===
export function useFundingProgression(userId?: string) {
  return useQuery({ queryKey: ["plmsFunding", userId], queryFn: () => getFundingProgression(userId!), enabled: !!userId });
}
export function useRecordFundingMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FundingProgressionInput) => recordFundingMilestone(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsFunding"] }); toast.success("Funding milestone recorded"); },
  });
}

// === Global Mobility ===
export function useGlobalMobility(userId?: string) {
  return useQuery({ queryKey: ["plmsMobility", userId], queryFn: () => getGlobalMobility(userId!), enabled: !!userId });
}
export function useRecordGlobalMobility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GlobalMobilityInput) => recordGlobalMobility(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsMobility"] }); },
  });
}

// === Skill Compounding ===
export function useSkillCompounding(userId?: string) {
  return useQuery({ queryKey: ["plmsSkill", userId], queryFn: () => getSkillCompounding(userId!), enabled: !!userId });
}
export function useUpsertSkillCompounding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SkillCompoundingInput) => upsertSkillCompounding(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsSkill"] }); },
  });
}

// === Collaboration Evolution ===
export function useCollaborationEvolution(userId?: string) {
  return useQuery({ queryKey: ["plmsCollab", userId], queryFn: () => getCollaborationEvolution(userId!), enabled: !!userId });
}
export function useUpsertCollaborationEvolution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CollaborationEvolutionInput) => upsertCollaborationEvolution(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsCollab"] }); },
  });
}

// === Dispute Recovery ===
export function useDisputeRecovery(userId?: string) {
  return useQuery({ queryKey: ["plmsDispute", userId], queryFn: () => getDisputeRecovery(userId!), enabled: !!userId });
}
export function useRecordDisputeRecovery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DisputeRecoveryInput) => recordDisputeRecovery(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsDispute"] }); },
  });
}

// === Institutional Memory ===
export function useInstitutionalMemory(institutionId?: string) {
  return useQuery({ queryKey: ["plmsInst", institutionId], queryFn: () => getInstitutionalMemory(institutionId!), enabled: !!institutionId });
}
export function useSaveInstitutionalMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InstitutionalMemoryInput) => saveInstitutionalMemory(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsInst"] }); toast.success("Institutional memory saved"); },
  });
}

// === Anniversaries ===
export function useAnniversaries(userId?: string) {
  return useQuery({ queryKey: ["plmsAnniv", userId], queryFn: () => getAnniversaries(userId!), enabled: !!userId });
}
export function useCreateAnniversary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AnniversaryInput) => createAnniversary(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsAnniv"] }); },
  });
}
export function useCelebrateAnniversary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAnniversaryCelebrated(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsAnniv"] }); toast.success("Anniversary celebrated! 🎉"); },
  });
}

// === Data Exports ===
export function useDataExports(userId?: string) {
  return useQuery({ queryKey: ["plmsExport", userId], queryFn: () => getDataExports(userId!), enabled: !!userId });
}
export function useCreateDataExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DataExportInput) => createDataExport(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsExport"] }); toast.success("Data export created"); },
  });
}

// === Initiative Archives ===
export function useInitiativeArchives() {
  return useQuery({ queryKey: ["plmsInitiative"], queryFn: () => getInitiativeArchives() });
}
export function useArchiveInitiative() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InitiativeArchiveInput) => archiveInitiative(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plmsInitiative"] }); toast.success("Initiative archived"); },
  });
}

// === Aggregated Memory Dashboard ===
export function usePLMSDashboard(userId?: string) {
  const career = useCareerSnapshots(userId);
  const projects = useProjectMemories(userId);
  const trust = useTrustHistory(userId);
  const funding = useFundingProgression(userId);
  const mobility = useGlobalMobility(userId);
  const skills = useSkillCompounding(userId);
  const collabs = useCollaborationEvolution(userId);
  const disputes = useDisputeRecovery(userId);
  const anniversaries = useAnniversaries(userId);

  return {
    careerSnapshots: career.data ?? [], careerLoading: career.isLoading,
    projectMemories: projects.data ?? [], projectsLoading: projects.isLoading,
    trustHistory: trust.data ?? [], trustLoading: trust.isLoading,
    fundingProgression: funding.data ?? [], fundingLoading: funding.isLoading,
    globalMobility: mobility.data ?? [], mobilityLoading: mobility.isLoading,
    skillCompounding: skills.data ?? [], skillsLoading: skills.isLoading,
    collaborationEvolution: collabs.data ?? [], collabsLoading: collabs.isLoading,
    disputeRecovery: disputes.data ?? [], disputesLoading: disputes.isLoading,
    anniversaries: anniversaries.data ?? [], anniversariesLoading: anniversaries.isLoading,
    isLoading: career.isLoading,
  };
}
