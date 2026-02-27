/**
 * React hooks for Global Academic Collaboration Intelligence Graph (GACIG).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  createCollaborationNode,
  getCollaborationNodes,
  saveCollaborationEdge,
  getCollaborationEdges,
  saveCTS,
  getCTS,
  saveCDI,
  getCDI,
  recordEvolutionEvent,
  getCollaborationTimeline,
  getDomainClusters,
  suggestCollaborations,
} from "@/lib/professional/collaborationIntelligenceGraph";
import type {
  CollaborationNode,
  CollaborationEdgeInput,
  CollaborationTrustScoreInput,
  CollaborationDiversityInput,
  CollaborationNodeType,
  EvolutionEventType,
} from "@/lib/professional/collaborationIntelligenceGraph";
import { toast } from "sonner";

export function useCollaborationNodes(nodeType?: CollaborationNodeType) {
  return useQuery({
    queryKey: ["collaborationNodes", nodeType],
    queryFn: () => getCollaborationNodes(nodeType),
  });
}

export function useCreateCollaborationNode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (node: CollaborationNode) => createCollaborationNode(node),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collaborationNodes"] });
      toast.success("Collaboration node created");
    },
  });
}

export function useCollaborationEdges(nodeId?: string) {
  return useQuery({
    queryKey: ["collaborationEdges", nodeId],
    queryFn: () => getCollaborationEdges(nodeId!),
    enabled: !!nodeId,
  });
}

export function useSaveCollaborationEdge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (edge: CollaborationEdgeInput) => saveCollaborationEdge(edge),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collaborationEdges"] });
      toast.success("Collaboration edge saved");
    },
  });
}

export function useCollaborationTrustScore(userAId?: string, userBId?: string) {
  return useQuery({
    queryKey: ["collaborationTrustScore", userAId, userBId],
    queryFn: () => getCTS(userAId!, userBId!),
    enabled: !!userAId && !!userBId,
  });
}

export function useSaveCTS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CollaborationTrustScoreInput) => saveCTS(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collaborationTrustScore"] });
      toast.success("Collaboration Trust Score updated");
    },
  });
}

export function useCollaborationDiversity(userId?: string) {
  return useQuery({
    queryKey: ["collaborationDiversity", userId],
    queryFn: () => getCDI(userId!),
    enabled: !!userId,
  });
}

export function useSaveCDI() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CollaborationDiversityInput) => saveCDI(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collaborationDiversity"] });
      toast.success("Collaboration Diversity Index updated");
    },
  });
}

export function useCollaborationTimeline(userAId?: string, userBId?: string) {
  return useQuery({
    queryKey: ["collaborationTimeline", userAId, userBId],
    queryFn: () => getCollaborationTimeline(userAId!, userBId!),
    enabled: !!userAId && !!userBId,
  });
}

export function useRecordEvolutionEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { user_a_id: string; user_b_id: string; event_type: EvolutionEventType; event_data?: Record<string, unknown> }) =>
      recordEvolutionEvent(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collaborationTimeline"] });
      toast.success("Evolution event recorded");
    },
  });
}

export function useDomainClusters(emerging?: boolean) {
  return useQuery({
    queryKey: ["domainClusters", emerging],
    queryFn: () => getDomainClusters(emerging),
  });
}

export function useCollaborationSuggestions() {
  return useMutation({
    mutationFn: (params: Parameters<typeof suggestCollaborations>[0]) => {
      return Promise.resolve(suggestCollaborations(params));
    },
  });
}
