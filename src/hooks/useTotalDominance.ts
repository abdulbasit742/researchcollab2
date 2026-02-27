/**
 * React hooks for Total Professional Infrastructure Domination.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  computeUnifiedIdentity,
  getUnifiedIdentity,
  createMarketplaceListing,
  browseMarketplace,
  applyToListing,
  intelligentDiscovery,
  getGrowthAdvisorRecords,
  getLifecycleEvents,
  recordLifecycleEvent,
  CATEGORY_POSITIONING,
  type MarketplaceListingInput,
  type DiscoveryFilters,
  type LifecycleStage,
} from "@/lib/professional/totalDominance";

export function useUnifiedIdentity(userId?: string) {
  return useQuery({
    queryKey: ["unified-identity", userId],
    queryFn: () => getUnifiedIdentity(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useComputeUnifiedIdentity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (userId: string) => computeUnifiedIdentity(userId),
    onSuccess: (_data, userId) => {
      toast({ title: "Identity computed", description: "Your execution identity has been updated." });
      queryClient.invalidateQueries({ queryKey: ["unified-identity", userId] });
    },
  });
}

export function useBrowseMarketplace(filters?: { domain?: string; complexityTier?: string; listingType?: string; limit?: number }) {
  return useQuery({
    queryKey: ["marketplace", filters],
    queryFn: () => browseMarketplace(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateMarketplaceListing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: { creatorId: string; input: MarketplaceListingInput }) =>
      createMarketplaceListing(params.creatorId, params.input),
    onSuccess: () => {
      toast({ title: "Listing created", description: "Your project listing is now live." });
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useApplyToListing() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: {
      applicantId: string;
      listingId: string;
      proposalText?: string;
      proposedBudget?: number;
      proposedTimelineDays?: number;
      relevantPortfolioIds?: string[];
    }) => applyToListing(params.applicantId, params),
    onSuccess: () => {
      toast({ title: "Application submitted", description: "Your proposal has been sent." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useIntelligentDiscovery(filters?: DiscoveryFilters) {
  return useQuery({
    queryKey: ["intelligent-discovery", filters],
    queryFn: () => intelligentDiscovery(filters ?? {}),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGrowthAdvisor(userId?: string) {
  return useQuery({
    queryKey: ["growth-advisor", userId],
    queryFn: () => getGrowthAdvisorRecords(userId!),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000,
  });
}

export function useLifecycleEvents(userId?: string, projectId?: string) {
  return useQuery({
    queryKey: ["lifecycle-events", userId, projectId],
    queryFn: () => getLifecycleEvents(userId!, projectId),
    enabled: !!userId,
  });
}

export function useRecordLifecycleEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { userId: string; event: { projectId?: string; stage: LifecycleStage; stageData?: Record<string, unknown>; outcome?: string } }) =>
      recordLifecycleEvent(params.userId, params.event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lifecycle-events"] });
    },
  });
}

export function useCategoryPositioning() {
  return CATEGORY_POSITIONING;
}
