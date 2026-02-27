/**
 * React hooks for Global Research Economy & Innovation Intelligence Engine (GREIIE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  saveNIEI, getNIEI, recordCapitalFlow, getCapitalFlows,
  saveDomainDominance, getDomainDominance, saveResearchLaborData, getResearchLaborMarket,
  saveCompetitionIndex, getCompetitionIndex, detectMacroRisks, saveMacroRisks,
  simulateFundingAllocation, saveSimulation, saveNetworkEdge, getNetworkEdges,
} from "@/lib/professional/researchEconomyIntelligence";
import type {
  NIEIInput, CompetitionIndexInput, CapitalFlowInput, SimulationInput,
} from "@/lib/professional/researchEconomyIntelligence";

export function useNIEI(countryCode?: string, period?: string) {
  return useQuery({ queryKey: ["niei", countryCode, period], queryFn: () => getNIEI(countryCode, period) });
}

export function useSaveNIEI() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NIEIInput) => saveNIEI(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["niei"] }); toast.success("National innovation index computed"); },
  });
}

export function useCapitalFlows(filters: Parameters<typeof getCapitalFlows>[0]) {
  return useQuery({ queryKey: ["capitalFlows", filters], queryFn: () => getCapitalFlows(filters) });
}

export function useRecordCapitalFlow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CapitalFlowInput) => recordCapitalFlow(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["capitalFlows"] }); toast.success("Capital flow recorded"); },
  });
}

export function useDomainDominance(domain?: string, countryCode?: string) {
  return useQuery({ queryKey: ["domainDominance", domain, countryCode], queryFn: () => getDomainDominance(domain, countryCode) });
}

export function useSaveDomainDominance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof saveDomainDominance>[0]) => saveDomainDominance(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["domainDominance"] }); toast.success("Domain dominance saved"); },
  });
}

export function useResearchLaborMarket(countryCode?: string, domain?: string) {
  return useQuery({ queryKey: ["laborMarket", countryCode, domain], queryFn: () => getResearchLaborMarket(countryCode, domain) });
}

export function useSaveResearchLaborData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof saveResearchLaborData>[0]) => saveResearchLaborData(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["laborMarket"] }); toast.success("Labor market data saved"); },
  });
}

export function useCompetitionIndex(period?: string) {
  return useQuery({ queryKey: ["competitionIndex", period], queryFn: () => getCompetitionIndex(period) });
}

export function useSaveCompetitionIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CompetitionIndexInput) => saveCompetitionIndex(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["competitionIndex"] }); toast.success("Competition index computed"); },
  });
}

export function useDetectMacroRisks() {
  return useMutation({
    mutationFn: async (p: { entityType: string; entityId: string } & Parameters<typeof detectMacroRisks>[0]) => {
      const risks = detectMacroRisks(p);
      await saveMacroRisks(p.entityType, p.entityId, risks);
      return risks;
    },
  });
}

export function useSimulateFunding() {
  return useMutation({
    mutationFn: async (p: { input: SimulationInput; params: Parameters<typeof simulateFundingAllocation>[0]; userId?: string }) => {
      const result = simulateFundingAllocation(p.params);
      await saveSimulation(p.input, result, p.userId);
      return result;
    },
    onSuccess: () => toast.success("Funding simulation completed"),
  });
}

export function useInnovationNetworkEdges(sourceType?: string, sourceId?: string) {
  return useQuery({ queryKey: ["networkEdges", sourceType, sourceId], queryFn: () => getNetworkEdges(sourceType, sourceId) });
}

export function useSaveNetworkEdge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof saveNetworkEdge>[0]) => saveNetworkEdge(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["networkEdges"] }); toast.success("Network edge saved"); },
  });
}
