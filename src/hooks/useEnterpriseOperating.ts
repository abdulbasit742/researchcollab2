/**
 * React hooks for Enterprise Operating Ecosystem Engine (EOEE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createEnterpriseProfile, getEnterpriseProfiles, getEnterpriseProfile, updateEnterpriseProfile,
  addPipelineItem, getPipeline, updatePipelineItem,
  saveTrustIndex, getTrustIndex,
  createCollaborationCall, getCollaborationCalls,
  addCrossBorderEntry, getCrossBorderEntries,
  createProcurement, getProcurements,
  addStartupPartnership, getStartupPartnerships,
  saveCompliance, getCompliance,
  saveTalentPipeline, getTalentPipeline,
  saveImpactIndex, getImpactIndex,
  addIndustryCluster, getIndustryClusters,
  addEnterpriseMemory, getEnterpriseMemory,
} from "@/lib/professional/enterpriseOperatingEngine";
import type {
  EnterpriseProfileInput, InnovationPipelineInput, CollaborationCallInput,
  CrossBorderInput, ProcurementInput, StartupPartnershipInput,
  ComplianceInput, TalentPipelineInput, TrustIndexInput,
  ImpactIndexInput, IndustryClusterInput, EnterpriseMemoryInput, EnterpriseSearchFilters,
} from "@/lib/professional/enterpriseOperatingEngine";

// ─── Enterprise Profiles ────────────────────────────────────
export function useEOEEProfiles(filters?: EnterpriseSearchFilters) {
  return useQuery({ queryKey: ["eoee-profiles", filters], queryFn: () => getEnterpriseProfiles(filters) });
}
export function useEOEEProfile(id?: string) {
  return useQuery({ queryKey: ["eoee-profile", id], queryFn: () => getEnterpriseProfile(id!), enabled: !!id });
}
export function useCreateEOEEProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EnterpriseProfileInput) => createEnterpriseProfile(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-profiles"] }); toast.success("Enterprise profile created"); },
  });
}
export function useUpdateEOEEProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; updates: Partial<EnterpriseProfileInput> & Record<string, unknown> }) => updateEnterpriseProfile(p.id, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-profiles"] }); },
  });
}

// ─── Innovation Pipeline ────────────────────────────────────
export function useEOEEPipeline(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-pipeline", enterpriseId], queryFn: () => getPipeline(enterpriseId!), enabled: !!enterpriseId });
}
export function useAddEOEEPipelineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InnovationPipelineInput) => addPipelineItem(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-pipeline"] }); },
  });
}
export function useUpdateEOEEPipelineItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; updates: Partial<InnovationPipelineInput> }) => updatePipelineItem(p.id, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-pipeline"] }); },
  });
}

// ─── Trust Index ────────────────────────────────────────────
export function useEOEETrustIndex(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-trust", enterpriseId], queryFn: () => getTrustIndex(enterpriseId!), enabled: !!enterpriseId });
}
export function useSaveEOEETrustIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrustIndexInput) => saveTrustIndex(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-trust"] }); },
  });
}

// ─── Collaboration Calls ────────────────────────────────────
export function useEOEECollaborationCalls(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-collab", enterpriseId], queryFn: () => getCollaborationCalls(enterpriseId!), enabled: !!enterpriseId });
}
export function useCreateEOEECollaborationCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CollaborationCallInput) => createCollaborationCall(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-collab"] }); toast.success("Collaboration call posted"); },
  });
}

// ─── Cross-Border ───────────────────────────────────────────
export function useEOEECrossBorder(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-xborder", enterpriseId], queryFn: () => getCrossBorderEntries(enterpriseId!), enabled: !!enterpriseId });
}
export function useAddEOEECrossBorder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossBorderInput) => addCrossBorderEntry(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-xborder"] }); },
  });
}

// ─── Procurement ────────────────────────────────────────────
export function useEOEEProcurements(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-procurement", enterpriseId], queryFn: () => getProcurements(enterpriseId!), enabled: !!enterpriseId });
}
export function useCreateEOEEProcurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProcurementInput) => createProcurement(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-procurement"] }); toast.success("RFP posted"); },
  });
}

// ─── Startup Partnerships ───────────────────────────────────
export function useEOEEStartupPartnerships(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-startups", enterpriseId], queryFn: () => getStartupPartnerships(enterpriseId!), enabled: !!enterpriseId });
}
export function useAddEOEEStartupPartnership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartupPartnershipInput) => addStartupPartnership(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-startups"] }); },
  });
}

// ─── Compliance ─────────────────────────────────────────────
export function useEOEECompliance(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-compliance", enterpriseId], queryFn: () => getCompliance(enterpriseId!), enabled: !!enterpriseId });
}
export function useSaveEOEECompliance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ComplianceInput) => saveCompliance(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-compliance"] }); },
  });
}

// ─── Talent Pipeline ────────────────────────────────────────
export function useEOEETalentPipeline(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-talent", enterpriseId], queryFn: () => getTalentPipeline(enterpriseId!), enabled: !!enterpriseId });
}
export function useSaveEOEETalentPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TalentPipelineInput) => saveTalentPipeline(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-talent"] }); },
  });
}

// ─── Impact Index ───────────────────────────────────────────
export function useEOEEImpactIndex(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-impact", enterpriseId], queryFn: () => getImpactIndex(enterpriseId!), enabled: !!enterpriseId });
}
export function useSaveEOEEImpactIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ImpactIndexInput) => saveImpactIndex(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-impact"] }); },
  });
}

// ─── Industry Clusters ──────────────────────────────────────
export function useEOEEIndustryClusters(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-clusters", enterpriseId], queryFn: () => getIndustryClusters(enterpriseId!), enabled: !!enterpriseId });
}
export function useAddEOEEIndustryCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IndustryClusterInput) => addIndustryCluster(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-clusters"] }); },
  });
}

// ─── Enterprise Memory ──────────────────────────────────────
export function useEOEEMemory(enterpriseId?: string) {
  return useQuery({ queryKey: ["eoee-memory", enterpriseId], queryFn: () => getEnterpriseMemory(enterpriseId!), enabled: !!enterpriseId });
}
export function useAddEOEEMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EnterpriseMemoryInput) => addEnterpriseMemory(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["eoee-memory"] }); },
  });
}

// ─── Aggregated Dashboard ──────────────────────────────────
export function useEOEEDashboard(enterpriseId?: string) {
  const profile = useEOEEProfile(enterpriseId);
  const pipeline = useEOEEPipeline(enterpriseId);
  const trust = useEOEETrustIndex(enterpriseId);
  const collabs = useEOEECollaborationCalls(enterpriseId);
  const crossBorder = useEOEECrossBorder(enterpriseId);
  const procurement = useEOEEProcurements(enterpriseId);
  const startups = useEOEEStartupPartnerships(enterpriseId);
  const compliance = useEOEECompliance(enterpriseId);
  const talent = useEOEETalentPipeline(enterpriseId);
  const impact = useEOEEImpactIndex(enterpriseId);
  const clusters = useEOEEIndustryClusters(enterpriseId);
  const memory = useEOEEMemory(enterpriseId);

  return {
    profile: profile.data,
    pipeline: pipeline.data ?? [],
    trustIndex: trust.data,
    collaborationCalls: collabs.data ?? [],
    crossBorder: crossBorder.data ?? [],
    procurements: procurement.data ?? [],
    startupPartnerships: startups.data ?? [],
    compliance: compliance.data,
    talentPipeline: talent.data,
    impactIndex: impact.data,
    industryClusters: clusters.data ?? [],
    memory: memory.data ?? [],
    isLoading: profile.isLoading || pipeline.isLoading,
  };
}
