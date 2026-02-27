/**
 * React hooks for Regional Professional Intelligence Engine (RPIE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createRegionalHub, getRegionalHubs, getRegionalHub, updateRegionalHub,
  saveSkillMapping, getSkillMapping,
  saveFundingCluster, getFundingClusters,
  saveStartupAnalytics, getStartupAnalytics,
  saveCrossBorderCorridor, getCrossBorderCorridors,
  saveTrustDensity, getTrustDensity,
  saveIndustryIntegrationRPIE, getIndustryIntegrationRPIE,
  savePerformanceIndexRPIE, getPerformanceIndexRPIE,
  saveTalentMobility, getTalentMobility,
  saveRegionalMemory, getRegionalMemory,
  saveCollaborationMatch, getCollaborationMatches, acceptCollaborationMatch,
} from "@/lib/professional/regionalIntelligenceEngine";
import type {
  RegionalHubInput, SkillMappingInput, FundingClusterInput,
  StartupAnalyticsInput, CrossBorderCorridorInput, TrustDensityInput,
  IndustryIntegrationInput, PerformanceIndexInput, TalentMobilityInput,
  RegionalMemoryInput, CollaborationMatchInput, HubSearchFilters,
} from "@/lib/professional/regionalIntelligenceEngine";

// ─── Regional Hubs ──────────────────────────────────────────
export function useRegionalHubs(filters?: HubSearchFilters) {
  return useQuery({ queryKey: ["rpie-hubs", filters], queryFn: () => getRegionalHubs(filters) });
}
export function useRegionalHub(hubId?: string) {
  return useQuery({ queryKey: ["rpie-hub", hubId], queryFn: () => getRegionalHub(hubId!), enabled: !!hubId });
}
export function useCreateRegionalHub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegionalHubInput) => createRegionalHub(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-hubs"] }); toast.success("Regional hub created"); },
  });
}
export function useUpdateRegionalHub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { hubId: string; updates: Partial<RegionalHubInput> & Record<string, unknown> }) => updateRegionalHub(p.hubId, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-hubs"] }); },
  });
}

// ─── Skill Mapping ──────────────────────────────────────────
export function useSkillMapping(hubId?: string) {
  return useQuery({ queryKey: ["rpie-skills", hubId], queryFn: () => getSkillMapping(hubId!), enabled: !!hubId });
}
export function useSaveSkillMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SkillMappingInput) => saveSkillMapping(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-skills"] }); },
  });
}

// ─── Funding Clusters ──────────────────────────────────────
export function useFundingClusters(hubId?: string, period?: string) {
  return useQuery({ queryKey: ["rpie-funding", hubId, period], queryFn: () => getFundingClusters(hubId, period) });
}
export function useSaveFundingCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FundingClusterInput) => saveFundingCluster(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-funding"] }); },
  });
}

// ─── Startup Analytics ─────────────────────────────────────
export function useStartupAnalytics(hubId?: string, period?: string) {
  return useQuery({ queryKey: ["rpie-startups", hubId, period], queryFn: () => getStartupAnalytics(hubId, period) });
}
export function useSaveStartupAnalytics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartupAnalyticsInput) => saveStartupAnalytics(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-startups"] }); },
  });
}

// ─── Cross-Border Corridors ────────────────────────────────
export function useCrossBorderCorridors(hubId?: string) {
  return useQuery({ queryKey: ["rpie-corridors", hubId], queryFn: () => getCrossBorderCorridors(hubId) });
}
export function useSaveCrossBorderCorridor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossBorderCorridorInput) => saveCrossBorderCorridor(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-corridors"] }); },
  });
}

// ─── Trust Density ─────────────────────────────────────────
export function useRPIETrustDensity(hubId?: string, period?: string) {
  return useQuery({ queryKey: ["rpie-trust", hubId, period], queryFn: () => getTrustDensity(hubId!, period), enabled: !!hubId });
}
export function useSaveRPIETrustDensity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrustDensityInput) => saveTrustDensity(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-trust"] }); },
  });
}

// ─── Industry Integration ──────────────────────────────────
export function useRPIEIndustryIntegration(hubId?: string, period?: string) {
  return useQuery({ queryKey: ["rpie-industry", hubId, period], queryFn: () => getIndustryIntegrationRPIE(hubId!, period), enabled: !!hubId });
}
export function useSaveRPIEIndustryIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IndustryIntegrationInput) => saveIndustryIntegrationRPIE(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-industry"] }); },
  });
}

// ─── Performance Index ─────────────────────────────────────
export function useRPIEPerformanceIndex(period?: string) {
  return useQuery({ queryKey: ["rpie-perf", period], queryFn: () => getPerformanceIndexRPIE(period) });
}
export function useSaveRPIEPerformanceIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PerformanceIndexInput) => savePerformanceIndexRPIE(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-perf"] }); },
  });
}

// ─── Talent Mobility ───────────────────────────────────────
export function useRPIETalentMobility(hubId?: string, period?: string) {
  return useQuery({ queryKey: ["rpie-talent", hubId, period], queryFn: () => getTalentMobility(hubId!, period), enabled: !!hubId });
}
export function useSaveRPIETalentMobility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TalentMobilityInput) => saveTalentMobility(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-talent"] }); },
  });
}

// ─── Regional Memory ───────────────────────────────────────
export function useRegionalMemory(hubId?: string, memoryType?: string) {
  return useQuery({ queryKey: ["rpie-memory", hubId, memoryType], queryFn: () => getRegionalMemory(hubId!, memoryType), enabled: !!hubId });
}
export function useSaveRegionalMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegionalMemoryInput) => saveRegionalMemory(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-memory"] }); },
  });
}

// ─── Collaboration Matching ────────────────────────────────
export function useCollaborationMatches(hubId?: string, matchType?: string) {
  return useQuery({ queryKey: ["rpie-matches", hubId, matchType], queryFn: () => getCollaborationMatches(hubId!, matchType), enabled: !!hubId });
}
export function useSaveCollaborationMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CollaborationMatchInput) => saveCollaborationMatch(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-matches"] }); },
  });
}
export function useAcceptCollaborationMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => acceptCollaborationMatch(matchId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["rpie-matches"] }); toast.success("Match accepted"); },
  });
}

// ─── Aggregated Dashboard ──────────────────────────────────
export function useRPIEDashboard(hubId?: string) {
  const hub = useRegionalHub(hubId);
  const skills = useSkillMapping(hubId);
  const funding = useFundingClusters(hubId);
  const startups = useStartupAnalytics(hubId);
  const corridors = useCrossBorderCorridors(hubId);
  const trust = useRPIETrustDensity(hubId);
  const industry = useRPIEIndustryIntegration(hubId);
  const talent = useRPIETalentMobility(hubId);
  const memory = useRegionalMemory(hubId);
  const matches = useCollaborationMatches(hubId);

  return {
    hub: hub.data,
    skills: skills.data ?? [],
    funding: funding.data ?? [],
    startups: startups.data ?? [],
    corridors: corridors.data ?? [],
    trustDensity: trust.data ?? [],
    industry: industry.data ?? [],
    talentMobility: talent.data ?? [],
    memory: memory.data ?? [],
    matches: matches.data ?? [],
    isLoading: hub.isLoading || skills.isLoading || funding.isLoading || startups.isLoading,
  };
}
