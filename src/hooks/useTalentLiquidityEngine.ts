/**
 * React hooks for Global Talent Liquidity & Skill Market Engine (GTL-SME).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  saveTalentLiquidity, getTalentLiquidity, getTopTalent,
  saveOpportunityMatch, getOpportunityMatches,
  createMicroTask, getMicroTasks,
  createCrossBorderContract,
  getSkillSupplyDemand, getSkillDemandSignals,
  flagOpportunityFraud,
  saveStabilityMonitor, getStabilityMonitor,
  saveExecutionResume, getExecutionResume,
} from "@/lib/professional/talentLiquidityEngine";
import type {
  TalentLiquidityInput, OpportunityMatchInput, MicroTaskInput,
  CrossBorderContractInput, StabilityInput, ExecutionResumeInput,
} from "@/lib/professional/talentLiquidityEngine";

// === Talent Liquidity Score ===
export function useTalentLiquidity(userId?: string) {
  return useQuery({ queryKey: ["tls", userId], queryFn: () => getTalentLiquidity(userId!), enabled: !!userId });
}
export function useTopTalent(limit = 20) {
  return useQuery({ queryKey: ["topTalent", limit], queryFn: () => getTopTalent(limit) });
}
export function useSaveTalentLiquidity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TalentLiquidityInput) => saveTalentLiquidity(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tls"] }); toast.success("Talent liquidity updated"); },
  });
}

// === Opportunity Matches ===
export function useOpportunityMatches(userId?: string) {
  return useQuery({ queryKey: ["oppMatches", userId], queryFn: () => getOpportunityMatches(userId!), enabled: !!userId });
}
export function useSaveOpportunityMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OpportunityMatchInput) => saveOpportunityMatch(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["oppMatches"] }); },
  });
}

// === Micro Tasks ===
export function useMicroTasks(filters?: { domain?: string; task_type?: string; status?: string }) {
  return useQuery({ queryKey: ["microTasks", filters], queryFn: () => getMicroTasks(filters) });
}
export function useCreateMicroTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MicroTaskInput) => createMicroTask(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["microTasks"] }); toast.success("Micro task created"); },
  });
}

// === Cross-Border Contracts ===
export function useCreateCrossBorderContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossBorderContractInput) => createCrossBorderContract(input),
    onSuccess: () => { toast.success("Cross-border contract created"); },
  });
}

// === Skill Supply/Demand ===
export function useSkillSupplyDemand(skillName?: string) {
  return useQuery({ queryKey: ["skillSD", skillName], queryFn: () => getSkillSupplyDemand(skillName) });
}
export function useSkillDemandSignals(domain?: string) {
  return useQuery({ queryKey: ["skillSignals", domain], queryFn: () => getSkillDemandSignals(domain) });
}

// === Fraud Flags ===
export function useFlagOpportunityFraud() {
  return useMutation({
    mutationFn: (input: { opportunity_id?: string; flag_type: string; description?: string; evidence?: Record<string, unknown>; severity?: string; flagged_by?: string }) => flagOpportunityFraud(input),
    onSuccess: () => { toast.success("Fraud flag submitted"); },
  });
}

// === Stability Monitor ===
export function useStabilityMonitor(userId?: string) {
  return useQuery({ queryKey: ["stability", userId], queryFn: () => getStabilityMonitor(userId!), enabled: !!userId });
}
export function useSaveStabilityMonitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StabilityInput) => saveStabilityMonitor(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stability"] }); },
  });
}

// === Execution Resume ===
export function useExecutionResume(userId?: string) {
  return useQuery({ queryKey: ["execResume", userId], queryFn: () => getExecutionResume(userId!), enabled: !!userId });
}
export function useSaveExecutionResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExecutionResumeInput) => saveExecutionResume(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["execResume"] }); toast.success("Execution resume updated"); },
  });
}

// === Aggregated dashboard hook ===
export function useTalentDashboard() {
  const { user } = useAuth();
  const tls = useTalentLiquidity(user?.id);
  const matches = useOpportunityMatches(user?.id);
  const stability = useStabilityMonitor(user?.id);
  const resume = useExecutionResume(user?.id);

  return {
    tls: tls.data, tlsLoading: tls.isLoading,
    matches: matches.data ?? [], matchesLoading: matches.isLoading,
    stability: stability.data, stabilityLoading: stability.isLoading,
    resume: resume.data, resumeLoading: resume.isLoading,
    isLoading: tls.isLoading || matches.isLoading || stability.isLoading || resume.isLoading,
  };
}
