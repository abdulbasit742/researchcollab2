/**
 * React hooks for Execution Economy Creator System.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createEarningChannel, getUserEarningChannels,
  createMarketplaceListing as createListing, browseMarketplaceListings, applyToMarketplaceListing, getListingApplications,
  saveRevenueShare, getUserRevenueShares,
  saveRevenueSplit, getProjectRevenueSplits,
  saveIncomeStability, getIncomeStability,
  addSkillLiquidity, getSkillLiquidityMap,
  createProfessionalSubscription, getCreatorSubscribers, getUserSubscriptions,
} from "@/lib/professional/executionEconomyEngine";
import type {
  EarningChannelInput, MarketplaceListingInput, MarketplaceApplicationInput,
  RevenueShareInput, RevenueSplitInput, IncomeStabilityInput,
  SkillLiquidityInput, ProfessionalSubscriptionInput,
} from "@/lib/professional/executionEconomyEngine";

// === Earning Channels ===
export function useEarningChannels(userId?: string) {
  return useQuery({ queryKey: ["earningChannels", userId], queryFn: () => getUserEarningChannels(userId!), enabled: !!userId });
}
export function useCreateEarningChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EarningChannelInput) => createEarningChannel(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["earningChannels"] }); toast.success("Earning channel created"); },
  });
}

// === Marketplace ===
export function useMarketplaceListings(filters?: { listing_type?: string; status?: string; min_budget?: number }) {
  return useQuery({ queryKey: ["mktListings", filters], queryFn: () => browseMarketplaceListings(filters) });
}
export function useCreateMarketplaceListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MarketplaceListingInput) => createListing(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mktListings"] }); toast.success("Listing created"); },
  });
}
export function useApplyToListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MarketplaceApplicationInput) => applyToMarketplaceListing(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mktApps"] }); toast.success("Application submitted"); },
  });
}
export function useListingApplications(listingId?: string) {
  return useQuery({ queryKey: ["mktApps", listingId], queryFn: () => getListingApplications(listingId!), enabled: !!listingId });
}

// === Revenue Shares ===
export function useRevenueShares(userId?: string) {
  return useQuery({ queryKey: ["revShares", userId], queryFn: () => getUserRevenueShares(userId!), enabled: !!userId });
}
export function useSaveRevenueShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RevenueShareInput) => saveRevenueShare(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["revShares"] }); toast.success("Revenue share saved"); },
  });
}

// === Revenue Splits ===
export function useProjectRevenueSplits(projectId?: string) {
  return useQuery({ queryKey: ["revSplits", projectId], queryFn: () => getProjectRevenueSplits(projectId!), enabled: !!projectId });
}
export function useSaveRevenueSplit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RevenueSplitInput) => saveRevenueSplit(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["revSplits"] }); toast.success("Split recorded"); },
  });
}

// === Income Stability ===
export function useIncomeStability(userId?: string) {
  return useQuery({ queryKey: ["incomeStability", userId], queryFn: () => getIncomeStability(userId!), enabled: !!userId });
}
export function useSaveIncomeStability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IncomeStabilityInput) => saveIncomeStability(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["incomeStability"] }); toast.success("Income metrics saved"); },
  });
}

// === Skill Liquidity ===
export function useSkillLiquidityMap(regionCode?: string) {
  return useQuery({ queryKey: ["skillLiquidity", regionCode], queryFn: () => getSkillLiquidityMap(regionCode) });
}
export function useAddSkillLiquidity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SkillLiquidityInput) => addSkillLiquidity(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["skillLiquidity"] }); toast.success("Skill data added"); },
  });
}

// === Subscriptions ===
export function useCreatorSubscribers(creatorId?: string) {
  return useQuery({ queryKey: ["creatorSubs", creatorId], queryFn: () => getCreatorSubscribers(creatorId!), enabled: !!creatorId });
}
export function useUserSubscriptions(subscriberId?: string) {
  return useQuery({ queryKey: ["userSubs", subscriberId], queryFn: () => getUserSubscriptions(subscriberId!), enabled: !!subscriberId });
}
export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfessionalSubscriptionInput) => createProfessionalSubscription(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["creatorSubs", "userSubs"] }); toast.success("Subscribed"); },
  });
}
