/**
 * React hooks for Capital Mobilization & Escrow Intelligence Engine (CMEIE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCampaign, getCampaigns, getCampaign, updateCampaign,
  createContribution, getContributions,
  saveDonorIntelligence, getDonorIntelligence,
  saveRiskAssessment, getRiskAssessment,
  saveCrossBorderCheckCMEIE, getCrossBorderChecksCMEIE,
  flagCampaignFraud, getCampaignFraudFlags, resolveCampaignFraud,
  savePerformanceIndex, getPerformanceIndex,
  createStartupRound, getStartupRounds, updateStartupRound,
  saveImpactTracking, getImpactTracking,
} from "@/lib/professional/capitalMobilizationEngine";
import type {
  CampaignInput, ContributionInput, DonorIntelligenceInput,
  RiskAssessmentInput, PerformanceIndexInput, StartupRoundInput,
  ImpactTrackingInput, CampaignSearchFilters,
} from "@/lib/professional/capitalMobilizationEngine";

// === Campaigns ===
export function useCMEIECampaigns(filters?: CampaignSearchFilters) {
  return useQuery({ queryKey: ["cmeieCampaigns", filters], queryFn: () => getCampaigns(filters) });
}
export function useCMEIECampaign(id?: string) {
  return useQuery({ queryKey: ["cmeieCampaign", id], queryFn: () => getCampaign(id!), enabled: !!id });
}
export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CampaignInput) => createCampaign(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeieCampaigns"] }); toast.success("Campaign created"); },
  });
}
export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; updates: Parameters<typeof updateCampaign>[1] }) => updateCampaign(p.id, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeieCampaigns"] }); },
  });
}

// === Contributions ===
export function useCMEIEContributions(campaignId?: string) {
  return useQuery({ queryKey: ["cmeieContrib", campaignId], queryFn: () => getContributions(campaignId!), enabled: !!campaignId });
}
export function useCreateContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ContributionInput) => createContribution(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeieContrib"] }); toast.success("Contribution escrowed"); },
  });
}

// === Donor Intelligence ===
export function useDonorIntelligence(campaignId?: string) {
  return useQuery({ queryKey: ["cmeieDonor", campaignId], queryFn: () => getDonorIntelligence(campaignId!), enabled: !!campaignId });
}
export function useSaveDonorIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DonorIntelligenceInput) => saveDonorIntelligence(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeieDonor"] }); },
  });
}

// === Risk Assessment ===
export function useCMEIERisk(campaignId?: string) {
  return useQuery({ queryKey: ["cmeieRisk", campaignId], queryFn: () => getRiskAssessment(campaignId!), enabled: !!campaignId });
}
export function useSaveRiskAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RiskAssessmentInput) => saveRiskAssessment(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeieRisk"] }); },
  });
}

// === Cross-Border ===
export function useCMEIECrossBorder(campaignId?: string) {
  return useQuery({ queryKey: ["cmeieXBorder", campaignId], queryFn: () => getCrossBorderChecksCMEIE(campaignId!), enabled: !!campaignId });
}

// === Fraud ===
export function useCMEIEFraudFlags(campaignId?: string) {
  return useQuery({ queryKey: ["cmeieFraud", campaignId], queryFn: () => getCampaignFraudFlags(campaignId!), enabled: !!campaignId });
}
export function useFlagCampaignFraud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof flagCampaignFraud>[0]) => flagCampaignFraud(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeieFraud"] }); toast.success("Fraud flag submitted"); },
  });
}
export function useResolveCampaignFraud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; reviewerId: string }) => resolveCampaignFraud(p.id, p.reviewerId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeieFraud"] }); },
  });
}

// === Performance ===
export function useCMEIEPerformance(campaignId?: string) {
  return useQuery({ queryKey: ["cmeiePerf", campaignId], queryFn: () => getPerformanceIndex(campaignId!), enabled: !!campaignId });
}
export function useSavePerformanceIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PerformanceIndexInput) => savePerformanceIndex(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeiePerf"] }); },
  });
}

// === Startup Rounds ===
export function useCMEIEStartupRounds(campaignId?: string) {
  return useQuery({ queryKey: ["cmeieStartup", campaignId], queryFn: () => getStartupRounds(campaignId!), enabled: !!campaignId });
}
export function useCreateStartupRound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartupRoundInput) => createStartupRound(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeieStartup"] }); toast.success("Startup round created"); },
  });
}
export function useUpdateStartupRound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; updates: Parameters<typeof updateStartupRound>[1] }) => updateStartupRound(p.id, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeieStartup"] }); },
  });
}

// === Impact Tracking ===
export function useCMEIEImpact(campaignId?: string) {
  return useQuery({ queryKey: ["cmeieImpact", campaignId], queryFn: () => getImpactTracking(campaignId!), enabled: !!campaignId });
}
export function useSaveImpactTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ImpactTrackingInput) => saveImpactTracking(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cmeieImpact"] }); },
  });
}

// === Aggregated Campaign Dashboard ===
export function useCMEIEDashboard(campaignId?: string) {
  const campaign = useCMEIECampaign(campaignId);
  const contributions = useCMEIEContributions(campaignId);
  const donor = useDonorIntelligence(campaignId);
  const risk = useCMEIERisk(campaignId);
  const crossBorder = useCMEIECrossBorder(campaignId);
  const fraud = useCMEIEFraudFlags(campaignId);
  const performance = useCMEIEPerformance(campaignId);
  const startup = useCMEIEStartupRounds(campaignId);
  const impact = useCMEIEImpact(campaignId);

  return {
    campaign: campaign.data, campaignLoading: campaign.isLoading,
    contributions: contributions.data ?? [], contribLoading: contributions.isLoading,
    donorIntelligence: donor.data, donorLoading: donor.isLoading,
    riskAssessment: risk.data, riskLoading: risk.isLoading,
    crossBorder: crossBorder.data ?? [], xbLoading: crossBorder.isLoading,
    fraudFlags: fraud.data ?? [], fraudLoading: fraud.isLoading,
    performance: performance.data, perfLoading: performance.isLoading,
    startupRounds: startup.data ?? [], startupLoading: startup.isLoading,
    impact: impact.data, impactLoading: impact.isLoading,
    isLoading: campaign.isLoading,
  };
}
