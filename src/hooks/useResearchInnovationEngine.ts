/**
 * React hooks for GRCIE + IRDPKE + GIEIRE (Prompts 5-7).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// GRCIE
import {
  createPatent, getPatentsByGrant, getPatentsByInstitution,
  saveCommercializationMetrics, createStartup, getStartupsByInstitution,
  getInnovationClusters, recordInnovationFailure, saveIIS, forecastCommercialization,
} from "@/lib/professional/researchCommercialization";
import type { PatentInput, CommercializationInput, StartupInput, InnovationFailureInput } from "@/lib/professional/researchCommercialization";

// IRDPKE
import {
  searchResearchDiscovery, indexForDiscovery, predictTrajectory, saveTrajectoryPrediction,
  getEmergingDomainSignals, addKnowledgeGraphConnection, getKnowledgeGraphNeighbors,
  getFundingGaps, compareEntities,
} from "@/lib/professional/researchDiscoveryEngine";
import type { DiscoverySearchParams } from "@/lib/professional/researchDiscoveryEngine";

// GIEIRE
import {
  saveInstitutionalRanking, getInstitutionalRankings, getInstitutionRankingHistory,
  detectRankingManipulation, saveManipulationFlags,
} from "@/lib/professional/institutionalRanking";
import type { InstitutionalRankingInput } from "@/lib/professional/institutionalRanking";

// === GRCIE Hooks ===

export function usePatentsByGrant(grantId?: string) {
  return useQuery({ queryKey: ["patents", "grant", grantId], queryFn: () => getPatentsByGrant(grantId!), enabled: !!grantId });
}

export function usePatentsByInstitution(institutionId?: string) {
  return useQuery({ queryKey: ["patents", "institution", institutionId], queryFn: () => getPatentsByInstitution(institutionId!), enabled: !!institutionId });
}

export function useCreatePatent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PatentInput) => createPatent(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patents"] }); toast.success("Patent filed"); },
  });
}

export function useSaveCommercialization() {
  return useMutation({
    mutationFn: (input: CommercializationInput) => saveCommercializationMetrics(input),
    onSuccess: () => toast.success("Commercialization metrics saved"),
  });
}

export function useCreateStartup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartupInput) => createStartup(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["startups"] }); toast.success("Startup registered"); },
  });
}

export function useStartupsByInstitution(institutionId?: string) {
  return useQuery({ queryKey: ["startups", institutionId], queryFn: () => getStartupsByInstitution(institutionId!), enabled: !!institutionId });
}

export function useInnovationClusters(emerging?: boolean) {
  return useQuery({ queryKey: ["innovationClusters", emerging], queryFn: () => getInnovationClusters(emerging) });
}

export function useRecordInnovationFailure() {
  return useMutation({ mutationFn: (input: InnovationFailureInput) => recordInnovationFailure(input) });
}

export function useCommercializationForecast() {
  return useMutation({ mutationFn: (params: Parameters<typeof forecastCommercialization>[0]) => Promise.resolve(forecastCommercialization(params)) });
}

// === IRDPKE Hooks ===

export function useResearchDiscovery(params?: DiscoverySearchParams) {
  return useQuery({
    queryKey: ["researchDiscovery", params],
    queryFn: () => searchResearchDiscovery(params!),
    enabled: !!params?.query,
  });
}

export function useIndexForDiscovery() {
  return useMutation({ mutationFn: (entry: Parameters<typeof indexForDiscovery>[0]) => indexForDiscovery(entry) });
}

export function useEmergingDomainSignals() {
  return useQuery({ queryKey: ["emergingDomainSignals"], queryFn: getEmergingDomainSignals });
}

export function useKnowledgeGraphNeighbors(entityType?: string, entityId?: string) {
  return useQuery({
    queryKey: ["knowledgeGraph", entityType, entityId],
    queryFn: () => getKnowledgeGraphNeighbors(entityType!, entityId!),
    enabled: !!entityType && !!entityId,
  });
}

export function useFundingGaps(domain?: string) {
  return useQuery({ queryKey: ["fundingGaps", domain], queryFn: () => getFundingGaps(domain) });
}

// === GIEIRE Hooks ===

export function useInstitutionalRankings(period?: string) {
  return useQuery({ queryKey: ["institutionalRankings", period], queryFn: () => getInstitutionalRankings(period) });
}

export function useInstitutionRankingHistory(institutionId?: string) {
  return useQuery({
    queryKey: ["institutionRankingHistory", institutionId],
    queryFn: () => getInstitutionRankingHistory(institutionId!),
    enabled: !!institutionId,
  });
}

export function useSaveInstitutionalRanking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InstitutionalRankingInput) => saveInstitutionalRanking(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["institutionalRankings"] }); toast.success("Institutional ranking computed"); },
  });
}

export function useDetectRankingManipulation() {
  return useMutation({
    mutationFn: async (params: { institutionId: string } & Parameters<typeof detectRankingManipulation>[0]) => {
      const flags = detectRankingManipulation(params);
      await saveManipulationFlags(params.institutionId, flags);
      return flags;
    },
  });
}
