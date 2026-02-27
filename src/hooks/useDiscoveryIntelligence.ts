/**
 * React hooks for Global Capability Discovery & Network Intelligence Engine.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  startDiscoverySession, getDiscoverySessions,
  saveEmergingTalent, getEmergingTalent,
  saveInnovationCluster, getInnovationClusters,
  saveCapabilityIndex, searchCapabilities,
  getFairnessConfig, flagDiscoveryIntegrity,
  getCapabilityGrowthFeed, addGrowthFeedItem,
  saveDiscoveryExplanation, getDiscoveryExplanations,
} from "@/lib/professional/discoveryIntelligenceEngine";
import type {
  DiscoverySessionInput, EmergingTalentInput, InnovationClusterInput,
  CapabilityIndexInput, CapabilitySearchFilters, DiscoveryExplanation,
} from "@/lib/professional/discoveryIntelligenceEngine";

// === Discovery Sessions ===
export function useDiscoverySessions(userId?: string) {
  return useQuery({ queryKey: ["discSessions", userId], queryFn: () => getDiscoverySessions(userId!), enabled: !!userId });
}
export function useStartDiscoverySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DiscoverySessionInput) => startDiscoverySession(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["discSessions"] }); },
  });
}

// === Emerging Talent ===
export function useEmergingTalent(limit = 20) {
  return useQuery({ queryKey: ["emergingTalent", limit], queryFn: () => getEmergingTalent(limit) });
}
export function useSaveEmergingTalent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EmergingTalentInput) => saveEmergingTalent(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["emergingTalent"] }); },
  });
}

// === Innovation Clusters ===
export function useInnovationClusters(domain?: string) {
  return useQuery({ queryKey: ["innovClusters", domain], queryFn: () => getInnovationClusters(domain) });
}
export function useSaveInnovationCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InnovationClusterInput) => saveInnovationCluster(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["innovClusters"] }); toast.success("Cluster saved"); },
  });
}

// === Capability Search ===
export function useCapabilitySearch(filters: CapabilitySearchFilters) {
  return useQuery({ queryKey: ["capSearch", filters], queryFn: () => searchCapabilities(filters) });
}
export function useSaveCapabilityIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CapabilityIndexInput) => saveCapabilityIndex(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["capSearch"] }); },
  });
}

// === Fairness Config ===
export function useFairnessConfig() {
  return useQuery({ queryKey: ["fairnessConfig"], queryFn: () => getFairnessConfig() });
}

// === Discovery Integrity ===
export function useFlagDiscoveryIntegrity() {
  return useMutation({
    mutationFn: (input: { user_id: string; flag_type: string; description?: string; evidence?: Record<string, unknown>; severity?: string }) => flagDiscoveryIntegrity(input),
    onSuccess: () => { toast.success("Integrity flag submitted"); },
  });
}

// === Growth Feed ===
export function useCapabilityGrowthFeed(userId?: string) {
  return useQuery({ queryKey: ["growthFeed", userId], queryFn: () => getCapabilityGrowthFeed(userId!), enabled: !!userId });
}
export function useAddGrowthFeedItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { user_id: string; feed_type: string; title: string; description?: string; domain?: string; relevance_score?: number; metadata?: Record<string, unknown> }) => addGrowthFeedItem(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["growthFeed"] }); },
  });
}

// === Discovery Explanations ===
export function useDiscoveryExplanations(viewerUserId?: string, sessionId?: string) {
  return useQuery({ queryKey: ["discExplanations", viewerUserId, sessionId], queryFn: () => getDiscoveryExplanations(viewerUserId!, sessionId), enabled: !!viewerUserId });
}
export function useSaveDiscoveryExplanation() {
  return useMutation({
    mutationFn: (input: DiscoveryExplanation) => saveDiscoveryExplanation(input),
  });
}

// === Aggregated Discovery Dashboard ===
export function useDiscoveryDashboard() {
  const { user } = useAuth();
  const sessions = useDiscoverySessions(user?.id);
  const emerging = useEmergingTalent();
  const clusters = useInnovationClusters();
  const growthFeed = useCapabilityGrowthFeed(user?.id);
  const fairness = useFairnessConfig();

  return {
    sessions: sessions.data ?? [], sessionsLoading: sessions.isLoading,
    emergingTalent: emerging.data ?? [], emergingLoading: emerging.isLoading,
    clusters: clusters.data ?? [], clustersLoading: clusters.isLoading,
    growthFeed: growthFeed.data ?? [], growthFeedLoading: growthFeed.isLoading,
    fairnessRules: fairness.data ?? [],
    isLoading: sessions.isLoading || emerging.isLoading || clusters.isLoading || growthFeed.isLoading,
  };
}
