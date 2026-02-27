/**
 * React hooks for the Global Academic Execution Index (GAEI).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  computeMDII, getMDII, indexPaper, searchPapers, createGrant, getUserGrants,
  addLifecycleEvent, getResearchTimeline, getInstitutionalExecutionIndex,
  trackCommercialization, getUserCommercializations, getGlobalInnovationMap,
  getIntegrityFlags, computeResearcherReliability,
  type PaperInput, type GrantInput,
} from "@/lib/professional/academicExecutionIndex";

export function useMDII(userId?: string) {
  return useQuery({
    queryKey: ["mdii", userId],
    queryFn: () => getMDII(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useComputeMDII() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (userId: string) => computeMDII(userId),
    onSuccess: (_, userId) => {
      toast({ title: "MDII computed", description: "Your Multi-Dimensional Impact Index has been updated." });
      qc.invalidateQueries({ queryKey: ["mdii", userId] });
    },
  });
}

export function useIndexPaper() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (params: { userId: string; input: PaperInput }) => indexPaper(params.userId, params.input),
    onSuccess: () => {
      toast({ title: "Paper indexed", description: "Research paper added to your execution index." });
      qc.invalidateQueries({ queryKey: ["papers"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useSearchPapers(filters?: { domain?: string; minFunding?: number; escrowManaged?: boolean; minCitations?: number; keyword?: string; limit?: number }) {
  return useQuery({
    queryKey: ["papers-search", filters],
    queryFn: () => searchPapers(filters ?? {}),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateGrant() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (params: { piId: string; input: GrantInput }) => createGrant(params.piId, params.input),
    onSuccess: () => {
      toast({ title: "Grant created", description: "Grant execution tracking started." });
      qc.invalidateQueries({ queryKey: ["grants"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUserGrants(userId?: string) {
  return useQuery({
    queryKey: ["grants", userId],
    queryFn: () => getUserGrants(userId!),
    enabled: !!userId,
  });
}

export function useResearchTimeline(userId?: string, paperId?: string) {
  return useQuery({
    queryKey: ["research-timeline", userId, paperId],
    queryFn: () => getResearchTimeline(userId!, paperId),
    enabled: !!userId,
  });
}

export function useAddLifecycleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; event: { paperId?: string; grantId?: string; eventType: string; eventTitle: string; eventDescription?: string; eventData?: Record<string, unknown> } }) =>
      addLifecycleEvent(params.userId, params.event),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["research-timeline"] }),
  });
}

export function useInstitutionalExecutionIndex(institutionId?: string) {
  return useQuery({
    queryKey: ["iei", institutionId],
    queryFn: () => getInstitutionalExecutionIndex(institutionId!),
    enabled: !!institutionId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useTrackCommercialization() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (params: { userId: string; input: { paperId?: string; grantId?: string; commercializationType: string; title: string; description?: string; filingDate?: string; industryPartners?: string[] } }) =>
      trackCommercialization(params.userId, params.input),
    onSuccess: () => {
      toast({ title: "Commercialization tracked", description: "Output added to your research impact profile." });
      qc.invalidateQueries({ queryKey: ["commercializations"] });
    },
  });
}

export function useUserCommercializations(userId?: string) {
  return useQuery({
    queryKey: ["commercializations", userId],
    queryFn: () => getUserCommercializations(userId!),
    enabled: !!userId,
  });
}

export function useGlobalInnovationMap(filters?: { countryCode?: string; domain?: string; period?: string }) {
  return useQuery({
    queryKey: ["innovation-map", filters],
    queryFn: () => getGlobalInnovationMap(filters),
    staleTime: 30 * 60 * 1000,
  });
}

export function useIntegrityFlags(paperId?: string, userId?: string) {
  return useQuery({
    queryKey: ["integrity-flags", paperId, userId],
    queryFn: () => getIntegrityFlags(paperId, userId),
    enabled: !!(paperId || userId),
  });
}

export function useResearcherReliability(userId?: string) {
  return useQuery({
    queryKey: ["researcher-reliability", userId],
    queryFn: () => computeResearcherReliability(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}
