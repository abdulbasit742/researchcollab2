/**
 * React hooks for Professional Civilization Network Architecture (PCNA).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  savePillarHealth, getPillarHealth,
  addGraphNode, getGraphNodes, addGraphEdge, getGraphEdges,
  saveDimensionScore, getDimensionScores,
  saveDiscoveryIndex, getDiscoveryIndex,
  flagIntegritySignal, getIntegritySignals, resolveIntegritySignal,
  saveSessionWellness, getSessionWellness,
  savePlatformMetrics, getPlatformMetrics,
  createArchivalRecord, getArchivalRecords,
} from "@/lib/professional/civilizationNetworkEngine";
import type {
  PillarName, GraphNodeInput, GraphEdgeInput,
  DimensionScoreInput, DiscoveryIndexInput, IntegritySignalInput,
  SessionWellnessInput, PlatformMetricsInput, ArchivalRecordInput,
} from "@/lib/professional/civilizationNetworkEngine";

// === Pillars ===
export function usePillarHealth() {
  return useQuery({ queryKey: ["pcnaPillars"], queryFn: getPillarHealth });
}
export function useSavePillarHealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { pillar: PillarName; healthScore: number; subsystemCount: number; integrationDensity: number }) =>
      savePillarHealth(p.pillar, p.healthScore, p.subsystemCount, p.integrationDensity),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pcnaPillars"] }); },
  });
}

// === Professional Graph ===
export function useGraphNodes(entityType?: string) {
  return useQuery({ queryKey: ["pgNodes", entityType], queryFn: () => getGraphNodes(entityType) });
}
export function useAddGraphNode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GraphNodeInput) => addGraphNode(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pgNodes"] }); },
  });
}
export function useGraphEdges(entityType?: string, entityId?: string) {
  return useQuery({ queryKey: ["pgEdges", entityType, entityId], queryFn: () => getGraphEdges(entityType, entityId) });
}
export function useAddGraphEdge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GraphEdgeInput) => addGraphEdge(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pgEdges"] }); },
  });
}

// === Dimension Scores ===
export function useDimensionScores(userId?: string) {
  return useQuery({ queryKey: ["dimScores", userId], queryFn: () => getDimensionScores(userId!), enabled: !!userId });
}
export function useSaveDimensionScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DimensionScoreInput) => saveDimensionScore(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dimScores"] }); },
  });
}

// === Discovery Index ===
export function useDiscoveryIndexPCNA(userId?: string) {
  return useQuery({ queryKey: ["pcnaDiscovery", userId], queryFn: () => getDiscoveryIndex(userId!), enabled: !!userId });
}
export function useSaveDiscoveryIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DiscoveryIndexInput) => saveDiscoveryIndex(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pcnaDiscovery"] }); },
  });
}

// === Integrity Signals ===
export function useIntegritySignals(userId?: string) {
  return useQuery({ queryKey: ["pcnaIntegrity", userId], queryFn: () => getIntegritySignals(userId) });
}
export function useFlagIntegritySignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IntegritySignalInput) => flagIntegritySignal(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pcnaIntegrity"] }); toast.success("Integrity signal flagged"); },
  });
}
export function useResolveIntegritySignal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; resolution: string; reviewerId: string }) => resolveIntegritySignal(p.id, p.resolution, p.reviewerId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pcnaIntegrity"] }); },
  });
}

// === Session Wellness ===
export function useSessionWellness(userId?: string) {
  return useQuery({ queryKey: ["pcnaWellness", userId], queryFn: () => getSessionWellness(userId!), enabled: !!userId });
}
export function useSaveSessionWellness() {
  return useMutation({
    mutationFn: (input: SessionWellnessInput) => saveSessionWellness(input),
  });
}

// === Platform Metrics ===
export function usePlatformMetricsPCNA(limit = 12) {
  return useQuery({ queryKey: ["pcnaPlatMetrics", limit], queryFn: () => getPlatformMetrics(limit) });
}
export function useSavePlatformMetrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PlatformMetricsInput) => savePlatformMetrics(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pcnaPlatMetrics"] }); },
  });
}

// === Archival Records ===
export function useArchivalRecords(recordType?: string) {
  return useQuery({ queryKey: ["pcnaArchival", recordType], queryFn: () => getArchivalRecords(recordType) });
}
export function useCreateArchivalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ArchivalRecordInput) => createArchivalRecord(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pcnaArchival"] }); },
  });
}

// === Aggregated Civilization Dashboard ===
export function useCivilizationDashboard() {
  const { user } = useAuth();
  const pillars = usePillarHealth();
  const dimensions = useDimensionScores(user?.id);
  const discovery = useDiscoveryIndexPCNA(user?.id);
  const integrity = useIntegritySignals(user?.id);
  const wellness = useSessionWellness(user?.id);
  const metrics = usePlatformMetricsPCNA();

  return {
    pillars: pillars.data ?? [], pillarsLoading: pillars.isLoading,
    dimensions: dimensions.data ?? [], dimensionsLoading: dimensions.isLoading,
    discovery: discovery.data, discoveryLoading: discovery.isLoading,
    integrity: integrity.data ?? [], integrityLoading: integrity.isLoading,
    wellness: wellness.data ?? [], wellnessLoading: wellness.isLoading,
    platformMetrics: metrics.data ?? [], metricsLoading: metrics.isLoading,
    isLoading: pillars.isLoading || dimensions.isLoading || metrics.isLoading,
  };
}
