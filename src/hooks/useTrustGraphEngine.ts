/**
 * React hooks for Professional Trust Graph Engine (PTGE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  saveTrustEdge, getTrustEdges,
  saveDomainTrust, getDomainTrust,
  saveGlobalTrust, getGlobalTrust,
  recordTrustEvent, getTrustEvents,
  saveTrustCompat, getTrustCompat,
  flagTrustManipulation, getTrustManipFlags,
  saveTeamTrust, getTeamTrust,
  saveInstitutionalTrust, getInstitutionalTrust,
} from "@/lib/professional/trustGraphEngine";
import type {
  TrustEdgeInput, DomainTrustInput, GlobalTrustInput,
  TrustEventInput, TrustCompatInput, TeamTrustInput, InstitutionalTrustInput,
} from "@/lib/professional/trustGraphEngine";

// === Trust Edges ===
export function useTrustEdges(userId?: string) {
  return useQuery({ queryKey: ["trustEdges", userId], queryFn: () => getTrustEdges(userId!), enabled: !!userId });
}
export function useSaveTrustEdge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrustEdgeInput) => saveTrustEdge(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trustEdges"] }); },
  });
}

// === Domain Trust ===
export function useDomainTrust(userId?: string, domain?: string) {
  return useQuery({ queryKey: ["domainTrust", userId, domain], queryFn: () => getDomainTrust(userId!, domain), enabled: !!userId });
}
export function useSaveDomainTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DomainTrustInput) => saveDomainTrust(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["domainTrust"] }); },
  });
}

// === Global Trust ===
export function useGlobalTrust(userId?: string) {
  return useQuery({ queryKey: ["globalTrust", userId], queryFn: () => getGlobalTrust(userId!), enabled: !!userId });
}
export function useSaveGlobalTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GlobalTrustInput) => saveGlobalTrust(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["globalTrust"] }); },
  });
}

// === Trust Events ===
export function useTrustEvents(userId?: string, limit = 30) {
  return useQuery({ queryKey: ["trustEvents", userId, limit], queryFn: () => getTrustEvents(userId!, limit), enabled: !!userId });
}
export function useRecordTrustEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrustEventInput) => recordTrustEvent(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["trustEvents"] }); },
  });
}

// === Trust Compatibility ===
export function useTrustCompat(userAId?: string, userBId?: string) {
  return useQuery({ queryKey: ["trustCompat", userAId, userBId], queryFn: () => getTrustCompat(userAId!, userBId!), enabled: !!userAId && !!userBId });
}
export function useSaveTrustCompat() {
  return useMutation({
    mutationFn: (input: TrustCompatInput) => saveTrustCompat(input),
    onSuccess: () => { toast.success("Compatibility check saved"); },
  });
}

// === Trust Manipulation ===
export function useTrustManipFlags(userId?: string) {
  return useQuery({ queryKey: ["trustManip", userId], queryFn: () => getTrustManipFlags(userId!), enabled: !!userId });
}
export function useFlagTrustManipulation() {
  return useMutation({
    mutationFn: (input: { user_id: string; flag_type: string; description?: string; evidence?: Record<string, unknown>; severity?: string }) => flagTrustManipulation(input),
    onSuccess: () => { toast.success("Manipulation flagged"); },
  });
}

// === Team Trust ===
export function useTeamTrust(projectId?: string) {
  return useQuery({ queryKey: ["teamTrust", projectId], queryFn: () => getTeamTrust(projectId!), enabled: !!projectId });
}
export function useSaveTeamTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TeamTrustInput) => saveTeamTrust(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teamTrust"] }); toast.success("Team trust saved"); },
  });
}

// === Institutional Trust ===
export function useInstitutionalTrust(institutionId?: string) {
  return useQuery({ queryKey: ["instTrust", institutionId], queryFn: () => getInstitutionalTrust(institutionId!), enabled: !!institutionId });
}
export function useSaveInstitutionalTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InstitutionalTrustInput) => saveInstitutionalTrust(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instTrust"] }); },
  });
}

// === Aggregated Trust Dashboard ===
export function useTrustDashboard() {
  const { user } = useAuth();
  const edges = useTrustEdges(user?.id);
  const global = useGlobalTrust(user?.id);
  const domains = useDomainTrust(user?.id);
  const events = useTrustEvents(user?.id);
  const manipFlags = useTrustManipFlags(user?.id);

  return {
    edges: edges.data ?? [], edgesLoading: edges.isLoading,
    globalTrust: global.data, globalLoading: global.isLoading,
    domainTrust: domains.data ?? [], domainLoading: domains.isLoading,
    events: events.data ?? [], eventsLoading: events.isLoading,
    manipFlags: manipFlags.data ?? [],
    isLoading: edges.isLoading || global.isLoading || domains.isLoading || events.isLoading,
  };
}
