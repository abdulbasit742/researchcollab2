/**
 * React hooks for the Multi-Layer Academic Impact Engine (MAIE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  getMAIEScores, computeMAIE, getImpactEvolution,
  getPolicyImpactRecords, addPolicyImpactRecord,
  getManipulationFlags, detectCitationManipulation,
  type MAIEScores, type CQIInput, type ManipulationSignal,
} from "@/lib/professional/multiLayerImpactEngine";

export function useMAIEScores(userId?: string) {
  return useQuery({
    queryKey: ["maie-scores", userId],
    queryFn: () => getMAIEScores(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useComputeMAIE() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (params: Parameters<typeof computeMAIE>) => computeMAIE(...params),
    onSuccess: () => {
      toast({ title: "MAIE computed", description: "Your Multi-Layer Academic Impact has been updated." });
      qc.invalidateQueries({ queryKey: ["maie-scores"] });
      qc.invalidateQueries({ queryKey: ["impact-evolution"] });
    },
  });
}

export function useImpactEvolution(userId?: string) {
  return useQuery({
    queryKey: ["impact-evolution", userId],
    queryFn: () => getImpactEvolution(userId!),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000,
  });
}

export function usePolicyImpactRecords(userId?: string) {
  return useQuery({
    queryKey: ["policy-impact", userId],
    queryFn: () => getPolicyImpactRecords(userId!),
    enabled: !!userId,
  });
}

export function useAddPolicyImpact() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (params: { userId: string; input: { paperId?: string; impactType: string; policyDocumentTitle?: string; issuingBody?: string; countryCode?: string; impactLevel?: string; evidenceUrl?: string } }) =>
      addPolicyImpactRecord(params.userId, params.input),
    onSuccess: () => {
      toast({ title: "Policy impact recorded", description: "Policy influence added to your profile." });
      qc.invalidateQueries({ queryKey: ["policy-impact"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useManipulationFlags(userId?: string, paperId?: string) {
  return useQuery({
    queryKey: ["manipulation-flags", userId, paperId],
    queryFn: () => getManipulationFlags(userId, paperId),
    enabled: !!(userId || paperId),
  });
}

export function useDetectManipulation() {
  return useMutation({
    mutationFn: (params: Parameters<typeof detectCitationManipulation>[0]) => {
      const signals = detectCitationManipulation(params);
      return Promise.resolve(signals);
    },
  });
}
