/**
 * React hooks for Global Research Civilization Operating System (GRCOS).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addKnowledgeNode, addKnowledgeEdge, getKnowledgeNodes, getKnowledgeEdges,
  saveScoringProfile, getScoringProfiles, computeCompositeScore,
  createGovernanceBoard, getGovernanceBoards, addBoardMember, getBoardMembers,
  logAIDecision, markAIDecisionReviewed, getAIDecisionAuditLog,
  saveArchivalPolicy, getArchivalPolicies,
  submitNationalIntelligenceQuery, getNationalIntelligenceResults,
  recordPlatformHealth, getPlatformHealthMetrics,
  validateGRCOSIntegrity,
} from "@/lib/professional/civilizationOperatingSystem";
import type {
  KnowledgeGraphNodeInput, KnowledgeGraphEdgeInput, GRCOSScoringInput,
  GovernanceBoardInput, AIDecisionAuditInput, NationalIntelligenceQueryInput,
  ScoringDimension,
} from "@/lib/professional/civilizationOperatingSystem";

// === Knowledge Graph ===
export function useKnowledgeNodes(nodeType?: string) {
  return useQuery({ queryKey: ["kgNodes", nodeType], queryFn: () => getKnowledgeNodes(nodeType) });
}

export function useKnowledgeEdges(sourceId?: string, targetId?: string) {
  return useQuery({ queryKey: ["kgEdges", sourceId, targetId], queryFn: () => getKnowledgeEdges(sourceId, targetId), enabled: !!(sourceId || targetId) });
}

export function useAddKnowledgeNode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: KnowledgeGraphNodeInput) => addKnowledgeNode(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kgNodes"] }); toast.success("Knowledge node added"); },
  });
}

export function useAddKnowledgeEdge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: KnowledgeGraphEdgeInput) => addKnowledgeEdge(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["kgEdges"] }); toast.success("Knowledge edge created"); },
  });
}

// === Scoring ===
export function useScoringProfiles(entityType?: string, entityId?: string) {
  return useQuery({ queryKey: ["grcosScores", entityType, entityId], queryFn: () => getScoringProfiles(entityType, entityId) });
}

export function useSaveScoringProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GRCOSScoringInput) => saveScoringProfile(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grcosScores"] }); toast.success("Scoring profile saved"); },
  });
}

export function useComputeCompositeScore() {
  return (scores: Record<ScoringDimension, number>, weights?: Record<ScoringDimension, number>) =>
    computeCompositeScore(scores, weights);
}

// === Governance ===
export function useGovernanceBoards() {
  return useQuery({ queryKey: ["govBoards"], queryFn: getGovernanceBoards });
}

export function useCreateGovernanceBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GovernanceBoardInput) => createGovernanceBoard(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["govBoards"] }); toast.success("Board created"); },
  });
}

export function useBoardMembers(boardId?: string) {
  return useQuery({ queryKey: ["govMembers", boardId], queryFn: () => getBoardMembers(boardId!), enabled: !!boardId });
}

export function useAddBoardMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { boardId: string; userId: string; role: string; institutionId?: string; termExpiresAt?: string }) =>
      addBoardMember(p.boardId, p.userId, p.role, p.institutionId, p.termExpiresAt),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["govMembers"] }); toast.success("Board member added"); },
  });
}

// === AI Audit ===
export function useAIDecisionAuditLog(decisionType?: string, entityId?: string) {
  return useQuery({ queryKey: ["aiAudit", decisionType, entityId], queryFn: () => getAIDecisionAuditLog(decisionType, entityId) });
}

export function useLogAIDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AIDecisionAuditInput) => logAIDecision(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["aiAudit"] }); },
  });
}

export function useMarkAIDecisionReviewed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { decisionId: string; reviewedBy: string }) => markAIDecisionReviewed(p.decisionId, p.reviewedBy),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["aiAudit"] }); toast.success("Decision marked as reviewed"); },
  });
}

// === Archival ===
export function useArchivalPolicies() {
  return useQuery({ queryKey: ["archival"], queryFn: getArchivalPolicies });
}

export function useSaveArchivalPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof saveArchivalPolicy>[0]) => saveArchivalPolicy(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["archival"] }); toast.success("Archival policy saved"); },
  });
}

// === National Intelligence ===
export function useNationalIntelligenceResults(countryId?: string, queryType?: string) {
  return useQuery({ queryKey: ["natlIntel", countryId, queryType], queryFn: () => getNationalIntelligenceResults(countryId, queryType) });
}

export function useSubmitNationalIntelligenceQuery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NationalIntelligenceQueryInput) => submitNationalIntelligenceQuery(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["natlIntel"] }); toast.success("Intelligence query submitted"); },
  });
}

// === Platform Health ===
export function usePlatformHealthMetrics(category?: string, period?: string) {
  return useQuery({ queryKey: ["platformHealth", category, period], queryFn: () => getPlatformHealthMetrics(category, period) });
}

export function useRecordPlatformHealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (m: Parameters<typeof recordPlatformHealth>[0]) => recordPlatformHealth(m),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["platformHealth"] }); },
  });
}

// === System Integrity ===
export function useGRCOSIntegrity() {
  return validateGRCOSIntegrity();
}
