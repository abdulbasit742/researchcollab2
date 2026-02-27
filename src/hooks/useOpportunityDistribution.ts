/**
 * React hooks for Trust-Weighted Opportunity Distribution Engine (TWODE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createOpportunity, getOpportunities, getOpportunity, updateOpportunity,
  createDistributionMatch, getUserMatches, getOpportunityMatches,
  saveMatchExplanation, getMatchExplanation,
  saveCrossBorderCheck, getCrossBorderChecks,
  saveFairDistribution, getFairDistribution,
  savePerformance, getPerformance,
  flagManipulation, getManipulationFlags, reviewManipulationFlag,
  saveTWODEImpact, getTWODEImpact,
  saveAISuggestion, getAISuggestions, acceptAISuggestion,
  saveUserDashboard, getUserDashboard,
  saveGlobalMapEntry, getGlobalMap,
} from "@/lib/professional/opportunityDistributionEngine";
import type {
  OpportunityInput, DistributionMatchInput, MatchExplanationInput,
  CrossBorderCheckInput, FairDistributionInput, PerformanceInput,
  ManipulationFlagInput, TWODEImpactInput, AISuggestionInput,
  UserDashboardInput, GlobalMapInput, OpportunitySearchFilters,
} from "@/lib/professional/opportunityDistributionEngine";

// ─── Opportunities ──────────────────────────────────────────
export function useTWODEOpportunities(filters?: OpportunitySearchFilters) {
  return useQuery({ queryKey: ["twode-opps", filters], queryFn: () => getOpportunities(filters) });
}
export function useTWODEOpportunity(id?: string) {
  return useQuery({ queryKey: ["twode-opp", id], queryFn: () => getOpportunity(id!), enabled: !!id });
}
export function useCreateTWODEOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OpportunityInput) => createOpportunity(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-opps"] }); toast.success("Opportunity created"); },
  });
}
export function useUpdateTWODEOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; updates: Partial<OpportunityInput> & Record<string, unknown> }) => updateOpportunity(p.id, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-opps"] }); },
  });
}

// ─── Distribution Matches ───────────────────────────────────
export function useTWODEUserMatches(userId?: string) {
  return useQuery({ queryKey: ["twode-user-matches", userId], queryFn: () => getUserMatches(userId!), enabled: !!userId });
}
export function useTWODEOpportunityMatches(opportunityId?: string) {
  return useQuery({ queryKey: ["twode-opp-matches", opportunityId], queryFn: () => getOpportunityMatches(opportunityId!), enabled: !!opportunityId });
}
export function useCreateTWODEMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DistributionMatchInput) => createDistributionMatch(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-user-matches"] }); qc.invalidateQueries({ queryKey: ["twode-opp-matches"] }); },
  });
}

// ─── Match Explanations ────────────────────────────────────
export function useTWODEMatchExplanation(matchId?: string) {
  return useQuery({ queryKey: ["twode-explain", matchId], queryFn: () => getMatchExplanation(matchId!), enabled: !!matchId });
}
export function useSaveTWODEMatchExplanation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MatchExplanationInput) => saveMatchExplanation(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-explain"] }); },
  });
}

// ─── Cross-Border Checks ───────────────────────────────────
export function useTWODECrossBorderChecks(opportunityId?: string) {
  return useQuery({ queryKey: ["twode-xborder", opportunityId], queryFn: () => getCrossBorderChecks(opportunityId!), enabled: !!opportunityId });
}
export function useSaveTWODECrossBorderCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossBorderCheckInput) => saveCrossBorderCheck(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-xborder"] }); },
  });
}

// ─── Fair Distribution ─────────────────────────────────────
export function useTWODEFairDistribution(opportunityId?: string) {
  return useQuery({ queryKey: ["twode-fair", opportunityId], queryFn: () => getFairDistribution(opportunityId!), enabled: !!opportunityId });
}
export function useSaveTWODEFairDistribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FairDistributionInput) => saveFairDistribution(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-fair"] }); },
  });
}

// ─── Performance ────────────────────────────────────────────
export function useTWODEPerformance(opportunityId?: string) {
  return useQuery({ queryKey: ["twode-perf", opportunityId], queryFn: () => getPerformance(opportunityId!), enabled: !!opportunityId });
}
export function useSaveTWODEPerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PerformanceInput) => savePerformance(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-perf"] }); },
  });
}

// ─── Manipulation Flags ────────────────────────────────────
export function useTWODEManipulationFlags(status?: string) {
  return useQuery({ queryKey: ["twode-flags", status], queryFn: () => getManipulationFlags(status) });
}
export function useFlagTWODEManipulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ManipulationFlagInput) => flagManipulation(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-flags"] }); toast.success("Manipulation flagged"); },
  });
}
export function useReviewTWODEManipulationFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { flagId: string; reviewedBy: string }) => reviewManipulationFlag(p.flagId, p.reviewedBy),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-flags"] }); },
  });
}

// ─── Impact Index ───────────────────────────────────────────
export function useTWODEImpact(opportunityId?: string) {
  return useQuery({ queryKey: ["twode-impact", opportunityId], queryFn: () => getTWODEImpact(opportunityId!), enabled: !!opportunityId });
}
export function useSaveTWODEImpact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TWODEImpactInput) => saveTWODEImpact(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-impact"] }); },
  });
}

// ─── AI Suggestions ────────────────────────────────────────
export function useTWODEAISuggestions(opportunityId?: string) {
  return useQuery({ queryKey: ["twode-ai", opportunityId], queryFn: () => getAISuggestions(opportunityId!), enabled: !!opportunityId });
}
export function useSaveTWODEAISuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AISuggestionInput) => saveAISuggestion(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-ai"] }); },
  });
}
export function useAcceptTWODEAISuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptAISuggestion(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-ai"] }); toast.success("Suggestion accepted"); },
  });
}

// ─── User Dashboard ────────────────────────────────────────
export function useTWODEUserDashboard(userId?: string) {
  return useQuery({ queryKey: ["twode-dash", userId], queryFn: () => getUserDashboard(userId!), enabled: !!userId });
}
export function useSaveTWODEUserDashboard() {
  return useMutation({
    mutationFn: (input: UserDashboardInput) => saveUserDashboard(input),
  });
}

// ─── Global Map ─────────────────────────────────────────────
export function useTWODEGlobalMap() {
  return useQuery({ queryKey: ["twode-map"], queryFn: () => getGlobalMap() });
}
export function useSaveTWODEGlobalMapEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GlobalMapInput) => saveGlobalMapEntry(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["twode-map"] }); },
  });
}

// ─── Aggregated Dashboard ──────────────────────────────────
export function useTWODEOpportunityDashboard(opportunityId?: string) {
  const opportunity = useTWODEOpportunity(opportunityId);
  const matches = useTWODEOpportunityMatches(opportunityId);
  const crossBorder = useTWODECrossBorderChecks(opportunityId);
  const fairness = useTWODEFairDistribution(opportunityId);
  const performance = useTWODEPerformance(opportunityId);
  const impact = useTWODEImpact(opportunityId);
  const suggestions = useTWODEAISuggestions(opportunityId);

  return {
    opportunity: opportunity.data,
    matches: matches.data ?? [],
    crossBorderChecks: crossBorder.data ?? [],
    fairDistribution: fairness.data,
    performance: performance.data,
    impact: impact.data,
    aiSuggestions: suggestions.data ?? [],
    isLoading: opportunity.isLoading || matches.isLoading,
  };
}
