/**
 * React hooks for Professional Asset & Execution Market Engine (PAEME).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createListing, getListings, getListing, updateListing,
  saveListingCredibility, getListingCredibility,
  createTransaction, getTransactions, updateTransactionStatus,
  requestVerification, getVerifications, approveVerification,
  saveCrossBorderCheck, getCrossBorderChecks,
  flagMarketplaceFraud, getMarketplaceFraudFlags, resolveMarketplaceFraud,
  saveLiquidityMetrics, getLiquidityMetrics,
  createProcurement, getProcurements,
  saveAssetPerformance, getAssetPerformance,
} from "@/lib/professional/marketplaceEngine";
import type {
  ListingInput, ListingCredibilityInput, TransactionInput,
  AssetVerificationInput, CrossBorderCheckInput, FraudFlagInput,
  ProcurementInput, AssetPerformanceInput, ListingSearchFilters,
} from "@/lib/professional/marketplaceEngine";

// === Listings ===
export function useListings(filters?: ListingSearchFilters) {
  return useQuery({ queryKey: ["paemeListings", filters], queryFn: () => getListings(filters) });
}
export function useListingDetail(id?: string) {
  return useQuery({ queryKey: ["paemeListing", id], queryFn: () => getListing(id!), enabled: !!id });
}
export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ListingInput) => createListing(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paemeListings"] }); toast.success("Listing created"); },
  });
}
export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; updates: Partial<ListingInput> }) => updateListing(p.id, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paemeListings"] }); },
  });
}

// === Credibility ===
export function useListingCredibility(listingId?: string) {
  return useQuery({ queryKey: ["listCred", listingId], queryFn: () => getListingCredibility(listingId!), enabled: !!listingId });
}
export function useSaveListingCredibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ListingCredibilityInput) => saveListingCredibility(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["listCred"] }); },
  });
}

// === Transactions ===
export function useMarketplaceTransactions(listingId?: string, buyerId?: string) {
  return useQuery({ queryKey: ["paemeTxn", listingId, buyerId], queryFn: () => getTransactions(listingId, buyerId) });
}
export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) => createTransaction(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paemeTxn"] }); toast.success("Transaction initiated"); },
  });
}
export function useUpdateTransactionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; status: string }) => updateTransactionStatus(p.id, p.status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paemeTxn"] }); },
  });
}

// === Verification ===
export function useVerifications(listingId?: string) {
  return useQuery({ queryKey: ["assetVer", listingId], queryFn: () => getVerifications(listingId!), enabled: !!listingId });
}
export function useRequestVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AssetVerificationInput) => requestVerification(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assetVer"] }); toast.success("Verification requested"); },
  });
}
export function useApproveVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; verifierId: string }) => approveVerification(p.id, p.verifierId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assetVer"] }); },
  });
}

// === Cross-Border ===
export function useCrossBorderChecks(listingId?: string, transactionId?: string) {
  return useQuery({ queryKey: ["mktXBorder", listingId, transactionId], queryFn: () => getCrossBorderChecks(listingId, transactionId) });
}
export function useSaveCrossBorderCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossBorderCheckInput) => saveCrossBorderCheck(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mktXBorder"] }); },
  });
}

// === Fraud ===
export function useMarketplaceFraudFlags(listingId?: string) {
  return useQuery({ queryKey: ["mktFraud", listingId], queryFn: () => getMarketplaceFraudFlags(listingId) });
}
export function useFlagMarketplaceFraud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FraudFlagInput) => flagMarketplaceFraud(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mktFraud"] }); toast.success("Fraud flag submitted"); },
  });
}
export function useResolveMarketplaceFraud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; reviewerId: string }) => resolveMarketplaceFraud(p.id, p.reviewerId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mktFraud"] }); },
  });
}

// === Liquidity ===
export function useLiquidityMetrics(category?: string) {
  return useQuery({ queryKey: ["mktLiquidity", category], queryFn: () => getLiquidityMetrics(category) });
}

// === Procurement ===
export function useProcurements(institutionId?: string) {
  return useQuery({ queryKey: ["instProcure", institutionId], queryFn: () => getProcurements(institutionId) });
}
export function useCreateProcurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProcurementInput) => createProcurement(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instProcure"] }); toast.success("RFP created"); },
  });
}

// === Asset Performance ===
export function useAssetPerformance(listingId?: string) {
  return useQuery({ queryKey: ["assetPerf", listingId], queryFn: () => getAssetPerformance(listingId!), enabled: !!listingId });
}
export function useSaveAssetPerformance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AssetPerformanceInput) => saveAssetPerformance(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assetPerf"] }); },
  });
}

// === Aggregated Marketplace Dashboard ===
export function useMarketplaceDashboard(listingId?: string) {
  const listing = useListingDetail(listingId);
  const credibility = useListingCredibility(listingId);
  const transactions = useMarketplaceTransactions(listingId);
  const verifications = useVerifications(listingId);
  const crossBorder = useCrossBorderChecks(listingId);
  const fraud = useMarketplaceFraudFlags(listingId);
  const performance = useAssetPerformance(listingId);

  return {
    listing: listing.data, listingLoading: listing.isLoading,
    credibility: credibility.data, credibilityLoading: credibility.isLoading,
    transactions: transactions.data ?? [], txnLoading: transactions.isLoading,
    verifications: verifications.data ?? [], verLoading: verifications.isLoading,
    crossBorder: crossBorder.data ?? [], xbLoading: crossBorder.isLoading,
    fraudFlags: fraud.data ?? [], fraudLoading: fraud.isLoading,
    performance: performance.data, perfLoading: performance.isLoading,
    isLoading: listing.isLoading || credibility.isLoading,
  };
}
