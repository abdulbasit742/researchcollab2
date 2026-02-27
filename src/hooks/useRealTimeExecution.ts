/**
 * React hooks for Real-Time Execution & Innovation Engine (REIE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSession, getSessions, getSession, updateSession, startSession, endSession,
  addParticipant, getParticipants,
  createActionItem, getActionItems, updateActionItemStatus,
  logDecision, getDecisions,
  saveEscrowPanel, getEscrowPanel, updateEscrowPanel,
  saveCrossBorderContext, getCrossBorderContext,
  createLiveDocument, getLiveDocuments, updateLiveDocument,
  saveImpactIndex, getImpactIndex,
  saveAISummary, getAISummary,
  archiveSession, getArchive, searchArchives,
  flagRisk, getRiskFlags, resolveRiskFlag,
} from "@/lib/professional/realTimeExecutionEngine";
import type {
  SessionInput, ParticipantInput, ActionItemInput, DecisionInput,
  EscrowPanelInput, CrossBorderInput, LiveDocumentInput,
  ImpactIndexInput, AISummaryInput, ArchiveInput, RiskFlagInput, SessionSearchFilters,
} from "@/lib/professional/realTimeExecutionEngine";

// ─── Sessions ───────────────────────────────────────────────
export function useREIESessions(filters?: SessionSearchFilters) {
  return useQuery({ queryKey: ["reie-sessions", filters], queryFn: () => getSessions(filters) });
}
export function useREIESession(sessionId?: string) {
  return useQuery({ queryKey: ["reie-session", sessionId], queryFn: () => getSession(sessionId!), enabled: !!sessionId });
}
export function useCreateREIESession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SessionInput) => createSession(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-sessions"] }); toast.success("Live session created"); },
  });
}
export function useUpdateREIESession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { sessionId: string; updates: Partial<SessionInput> & Record<string, unknown> }) => updateSession(p.sessionId, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-sessions"] }); },
  });
}
export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => startSession(sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-sessions"] }); toast.success("Session started"); },
  });
}
export function useEndSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => endSession(sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-sessions"] }); toast.success("Session ended"); },
  });
}

// ─── Participants ───────────────────────────────────────────
export function useREIEParticipants(sessionId?: string) {
  return useQuery({ queryKey: ["reie-participants", sessionId], queryFn: () => getParticipants(sessionId!), enabled: !!sessionId });
}
export function useAddREIEParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ParticipantInput) => addParticipant(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-participants"] }); },
  });
}

// ─── Action Items ───────────────────────────────────────────
export function useREIEActionItems(sessionId?: string) {
  return useQuery({ queryKey: ["reie-actions", sessionId], queryFn: () => getActionItems(sessionId!), enabled: !!sessionId });
}
export function useCreateREIEActionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ActionItemInput) => createActionItem(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-actions"] }); },
  });
}
export function useUpdateREIEActionItemStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { itemId: string; status: string }) => updateActionItemStatus(p.itemId, p.status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-actions"] }); },
  });
}

// ─── Decisions ──────────────────────────────────────────────
export function useREIEDecisions(sessionId?: string) {
  return useQuery({ queryKey: ["reie-decisions", sessionId], queryFn: () => getDecisions(sessionId!), enabled: !!sessionId });
}
export function useLogREIEDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecisionInput) => logDecision(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-decisions"] }); },
  });
}

// ─── Escrow Panel ───────────────────────────────────────────
export function useREIEEscrowPanel(sessionId?: string) {
  return useQuery({ queryKey: ["reie-escrow", sessionId], queryFn: () => getEscrowPanel(sessionId!), enabled: !!sessionId });
}
export function useSaveREIEEscrowPanel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EscrowPanelInput) => saveEscrowPanel(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-escrow"] }); },
  });
}
export function useUpdateREIEEscrowPanel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { panelId: string; updates: Partial<EscrowPanelInput> }) => updateEscrowPanel(p.panelId, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-escrow"] }); },
  });
}

// ─── Cross-Border ───────────────────────────────────────────
export function useREIECrossBorder(sessionId?: string) {
  return useQuery({ queryKey: ["reie-crossborder", sessionId], queryFn: () => getCrossBorderContext(sessionId!), enabled: !!sessionId });
}
export function useSaveREIECrossBorder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CrossBorderInput) => saveCrossBorderContext(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-crossborder"] }); },
  });
}

// ─── Live Documents ─────────────────────────────────────────
export function useREIELiveDocuments(sessionId?: string) {
  return useQuery({ queryKey: ["reie-docs", sessionId], queryFn: () => getLiveDocuments(sessionId!), enabled: !!sessionId });
}
export function useCreateREIELiveDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LiveDocumentInput) => createLiveDocument(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-docs"] }); },
  });
}
export function useUpdateREIELiveDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { docId: string; content: string; version: number }) => updateLiveDocument(p.docId, p.content, p.version),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-docs"] }); },
  });
}

// ─── Impact Index ───────────────────────────────────────────
export function useREIEImpactIndex(sessionId?: string) {
  return useQuery({ queryKey: ["reie-impact", sessionId], queryFn: () => getImpactIndex(sessionId!), enabled: !!sessionId });
}
export function useSaveREIEImpactIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ImpactIndexInput) => saveImpactIndex(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-impact"] }); },
  });
}

// ─── AI Summaries ───────────────────────────────────────────
export function useREIEAISummary(sessionId?: string) {
  return useQuery({ queryKey: ["reie-summary", sessionId], queryFn: () => getAISummary(sessionId!), enabled: !!sessionId });
}
export function useSaveREIEAISummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AISummaryInput) => saveAISummary(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-summary"] }); },
  });
}

// ─── Archives ───────────────────────────────────────────────
export function useREIEArchive(sessionId?: string) {
  return useQuery({ queryKey: ["reie-archive", sessionId], queryFn: () => getArchive(sessionId!), enabled: !!sessionId });
}
export function useArchiveREIESession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ArchiveInput) => archiveSession(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-archive"] }); toast.success("Session archived"); },
  });
}
export function useSearchREIEArchives(keyword?: string) {
  return useQuery({ queryKey: ["reie-archive-search", keyword], queryFn: () => searchArchives(keyword!), enabled: !!keyword });
}

// ─── Risk Flags ─────────────────────────────────────────────
export function useREIERiskFlags(sessionId?: string) {
  return useQuery({ queryKey: ["reie-risks", sessionId], queryFn: () => getRiskFlags(sessionId!), enabled: !!sessionId });
}
export function useFlagREIERisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RiskFlagInput) => flagRisk(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-risks"] }); },
  });
}
export function useResolveREIERiskFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (flagId: string) => resolveRiskFlag(flagId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reie-risks"] }); },
  });
}

// ─── Aggregated Dashboard ──────────────────────────────────
export function useREIESessionDashboard(sessionId?: string) {
  const session = useREIESession(sessionId);
  const participants = useREIEParticipants(sessionId);
  const actions = useREIEActionItems(sessionId);
  const decisions = useREIEDecisions(sessionId);
  const escrow = useREIEEscrowPanel(sessionId);
  const docs = useREIELiveDocuments(sessionId);
  const risks = useREIERiskFlags(sessionId);
  const impact = useREIEImpactIndex(sessionId);
  const summary = useREIEAISummary(sessionId);

  return {
    session: session.data,
    participants: participants.data ?? [],
    actionItems: actions.data ?? [],
    decisions: decisions.data ?? [],
    escrowPanel: escrow.data,
    documents: docs.data ?? [],
    riskFlags: risks.data ?? [],
    impact: impact.data,
    aiSummary: summary.data,
    isLoading: session.isLoading || participants.isLoading || actions.isLoading,
  };
}
