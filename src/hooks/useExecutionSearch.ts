/**
 * React hooks for Execution Intelligence Search Engine.
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  searchTalent,
  searchInstitutions,
  suggestMatches,
  SEARCH_TRANSPARENCY,
  type TalentSearchFilters,
  type InstitutionSearchFilters,
  type SearchContext,
} from "@/lib/professional/executionSearch";
import { compareCandidates } from "@/lib/professional/recruiterIntelligence";

export function useExecutionTalentSearch(
  filters: TalentSearchFilters,
  context: SearchContext = "general",
  enabled = true
) {
  return useQuery({
    queryKey: ["execution-talent-search", filters, context],
    queryFn: () => searchTalent(filters, context),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useExecutionInstitutionSearch(
  filters: InstitutionSearchFilters = {},
  enabled = true
) {
  return useQuery({
    queryKey: ["execution-institution-search", filters],
    queryFn: () => searchInstitutions(filters),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMatchSuggestions(
  forType: "sponsor" | "institution" | "student",
  forId?: string
) {
  return useQuery({
    queryKey: ["match-suggestions", forType, forId],
    queryFn: () => suggestMatches(forType, forId!),
    enabled: !!forId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCandidateComparison(userIds: string[]) {
  return useQuery({
    queryKey: ["candidate-comparison", userIds],
    queryFn: () => compareCandidates(userIds),
    enabled: userIds.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchTransparency() {
  return SEARCH_TRANSPARENCY;
}
