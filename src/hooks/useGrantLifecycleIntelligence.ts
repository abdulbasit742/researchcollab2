/**
 * React hooks for Global Grant Lifecycle Intelligence System (GGLIS).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  recordGrantLifecycleEvent,
  getGrantLifecycleTimeline,
  computeGrantPerformance,
  saveGrantPerformanceMetrics,
  computeGRS,
  saveGRS,
  getGRS,
  forecastGrantImpact,
  saveGrantForecast,
  detectGrantAnomalies,
  saveAnomalyFlags,
  getInstitutionalFundingIntel,
  getGrantDisciplineNorms,
} from "@/lib/professional/grantLifecycleIntelligence";
import type {
  GrantLifecycleEvent,
  GrantPerformanceMetrics,
  GrantReliabilityScore,
} from "@/lib/professional/grantLifecycleIntelligence";
import { toast } from "sonner";

export function useGrantLifecycleTimeline(grantId?: string) {
  return useQuery({
    queryKey: ["grantLifecycleTimeline", grantId],
    queryFn: () => getGrantLifecycleTimeline(grantId!),
    enabled: !!grantId,
  });
}

export function useRecordLifecycleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (event: GrantLifecycleEvent) => recordGrantLifecycleEvent(event),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["grantLifecycleTimeline", vars.grant_id] });
      toast.success("Lifecycle event recorded");
    },
  });
}

export function useGrantReliabilityScore(userId?: string) {
  return useQuery({
    queryKey: ["grantReliabilityScore", userId],
    queryFn: () => getGRS(userId!),
    enabled: !!userId,
  });
}

export function useComputeGRS() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dimensions: Omit<GrantReliabilityScore, "user_id" | "overall_grs">) => {
      if (!user?.id) throw new Error("Not authenticated");
      const result = computeGRS(dimensions);
      await saveGRS(user.id, { ...result, user_id: user.id });
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grantReliabilityScore"] });
      toast.success("Grant Reliability Score computed");
    },
  });
}

export function useGrantImpactForecast() {
  return useMutation({
    mutationFn: async (params: {
      grantId: string;
      milestoneCompletionRate: number;
      budgetEfficiency: number;
      piReliabilityScore: number;
      domainPatentLikelihood: number;
      sponsorSatisfaction: number;
      complianceHistory: number;
    }) => {
      const forecast = forecastGrantImpact(params);
      await saveGrantForecast(params.grantId, forecast);
      return forecast;
    },
    onSuccess: () => toast.success("Impact forecast generated"),
  });
}

export function useDetectGrantAnomalies() {
  return useMutation({
    mutationFn: async (params: Parameters<typeof detectGrantAnomalies>[0]) => {
      const flags = detectGrantAnomalies(params);
      await saveAnomalyFlags(flags);
      return flags;
    },
  });
}

export function useInstitutionalFundingIntel(institutionId?: string) {
  return useQuery({
    queryKey: ["institutionalFundingIntel", institutionId],
    queryFn: () => getInstitutionalFundingIntel(institutionId!),
    enabled: !!institutionId,
  });
}

export function useGrantDisciplineNorms(discipline?: string) {
  return useQuery({
    queryKey: ["grantDisciplineNorms", discipline],
    queryFn: () => getGrantDisciplineNorms(discipline!),
    enabled: !!discipline,
  });
}
