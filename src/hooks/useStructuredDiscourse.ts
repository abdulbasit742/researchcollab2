/**
 * React hooks for Structured Discourse & Debate Engine (SDDE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createThread, getThreads, getThread, updateThread,
  addContribution, getContributions, flagContribution,
  addEvidence, getEvidence, verifyEvidence,
  saveAISummary, getAISummary,
  createDispute, getDisputes, resolveDispute,
  flagToxicity, getToxicityFlags, reviewToxicityFlag,
  extractKnowledge, getKnowledgeExtracts,
  saveImpactIndex, getImpactIndex,
  archiveThread, getArchive,
  saveToneAssist, getToneAssists,
} from "@/lib/professional/structuredDiscourseEngine";
import type {
  ThreadInput, ContributionInput, EvidenceInput, SDDEAISummaryInput,
  DisputeInput, ToxicityFlagInput, KnowledgeExtractInput,
  ImpactIndexInput, ArchiveInput, ToneAssistInput, ThreadSearchFilters,
} from "@/lib/professional/structuredDiscourseEngine";

// ─── Threads ────────────────────────────────────────────────
export function useSDDEThreads(filters?: ThreadSearchFilters) {
  return useQuery({ queryKey: ["sdde-threads", filters], queryFn: () => getThreads(filters) });
}
export function useSDDEThread(threadId?: string) {
  return useQuery({ queryKey: ["sdde-thread", threadId], queryFn: () => getThread(threadId!), enabled: !!threadId });
}
export function useCreateSDDEThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ThreadInput) => createThread(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-threads"] }); toast.success("Discussion created"); },
  });
}
export function useUpdateSDDEThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { threadId: string; updates: Partial<ThreadInput> & Record<string, unknown> }) => updateThread(p.threadId, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-threads"] }); },
  });
}

// ─── Contributions ──────────────────────────────────────────
export function useSDDEContributions(threadId?: string) {
  return useQuery({ queryKey: ["sdde-contribs", threadId], queryFn: () => getContributions(threadId!), enabled: !!threadId });
}
export function useAddSDDEContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ContributionInput) => addContribution(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-contribs"] }); },
  });
}
export function useFlagSDDEContribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; reason: string }) => flagContribution(p.id, p.reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-contribs"] }); },
  });
}

// ─── Evidence ───────────────────────────────────────────────
export function useSDDEEvidence(contributionId?: string) {
  return useQuery({ queryKey: ["sdde-evidence", contributionId], queryFn: () => getEvidence(contributionId!), enabled: !!contributionId });
}
export function useAddSDDEEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EvidenceInput) => addEvidence(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-evidence"] }); },
  });
}
export function useVerifySDDEEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; verifiedBy: string }) => verifyEvidence(p.id, p.verifiedBy),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-evidence"] }); toast.success("Evidence verified"); },
  });
}

// ─── AI Summaries ───────────────────────────────────────────
export function useSDDEAISummary(threadId?: string) {
  return useQuery({ queryKey: ["sdde-summary", threadId], queryFn: () => getAISummary(threadId!), enabled: !!threadId });
}
export function useSaveSDDEAISummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SDDEAISummaryInput) => saveAISummary(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-summary"] }); },
  });
}

// ─── Disputes ───────────────────────────────────────────────
export function useSDDEDisputes(threadId?: string) {
  return useQuery({ queryKey: ["sdde-disputes", threadId], queryFn: () => getDisputes(threadId!), enabled: !!threadId });
}
export function useCreateSDDEDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DisputeInput) => createDispute(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-disputes"] }); },
  });
}
export function useResolveSDDEDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; outcome: string; summary: string }) => resolveDispute(p.id, p.outcome, p.summary),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-disputes"] }); toast.success("Dispute resolved"); },
  });
}

// ─── Toxicity Flags ─────────────────────────────────────────
export function useSDDEToxicityFlags(contributionId?: string) {
  return useQuery({ queryKey: ["sdde-toxicity", contributionId], queryFn: () => getToxicityFlags(contributionId!), enabled: !!contributionId });
}
export function useFlagSDDEToxicity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ToxicityFlagInput) => flagToxicity(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-toxicity"] }); },
  });
}
export function useReviewSDDEToxicityFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { flagId: string; reviewedBy: string; action: string }) => reviewToxicityFlag(p.flagId, p.reviewedBy, p.action),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-toxicity"] }); },
  });
}

// ─── Knowledge Extracts ────────────────────────────────────
export function useSDDEKnowledgeExtracts(threadId?: string) {
  return useQuery({ queryKey: ["sdde-knowledge", threadId], queryFn: () => getKnowledgeExtracts(threadId!), enabled: !!threadId });
}
export function useExtractSDDEKnowledge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: KnowledgeExtractInput) => extractKnowledge(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-knowledge"] }); toast.success("Knowledge extracted"); },
  });
}

// ─── Impact Index ───────────────────────────────────────────
export function useSDDEImpactIndex(threadId?: string) {
  return useQuery({ queryKey: ["sdde-impact", threadId], queryFn: () => getImpactIndex(threadId!), enabled: !!threadId });
}
export function useSaveSDDEImpactIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ImpactIndexInput) => saveImpactIndex(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-impact"] }); },
  });
}

// ─── Archives ───────────────────────────────────────────────
export function useSDDEArchive(threadId?: string) {
  return useQuery({ queryKey: ["sdde-archive", threadId], queryFn: () => getArchive(threadId!), enabled: !!threadId });
}
export function useArchiveSDDEThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ArchiveInput) => archiveThread(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sdde-archive"] }); toast.success("Thread archived"); },
  });
}

// ─── Tone Assists ───────────────────────────────────────────
export function useSDDEToneAssists(userId?: string) {
  return useQuery({ queryKey: ["sdde-tone", userId], queryFn: () => getToneAssists(userId!), enabled: !!userId });
}
export function useSaveSDDEToneAssist() {
  return useMutation({
    mutationFn: (input: ToneAssistInput) => saveToneAssist(input),
  });
}

// ─── Aggregated Dashboard ──────────────────────────────────
export function useSDDEThreadDashboard(threadId?: string) {
  const thread = useSDDEThread(threadId);
  const contributions = useSDDEContributions(threadId);
  const disputes = useSDDEDisputes(threadId);
  const summary = useSDDEAISummary(threadId);
  const impact = useSDDEImpactIndex(threadId);
  const knowledge = useSDDEKnowledgeExtracts(threadId);

  return {
    thread: thread.data,
    contributions: contributions.data ?? [],
    disputes: disputes.data ?? [],
    aiSummary: summary.data,
    impact: impact.data,
    knowledgeExtracts: knowledge.data ?? [],
    isLoading: thread.isLoading || contributions.isLoading,
  };
}
