/**
 * React hooks for Academic Career Intelligence & Reputation OS (ACIRO).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  upsertCareerProfile, getCareerProfile, saveMDRS, getMDRS,
  saveExecutionReliability, getExecutionReliability,
  saveAdaptability, getAdaptability, saveCareerRisks, getCareerRisks,
  saveTrajectorySnapshot, getCareerTrajectory, exportAcademicIdentity,
} from "@/lib/professional/academicCareerIntelligence";
import type {
  CareerProfileInput, MDRSInput, ExecutionReliabilityInput,
  AdaptabilityInput, CareerRiskInput,
} from "@/lib/professional/academicCareerIntelligence";

export function useCareerProfile(userId?: string) {
  return useQuery({ queryKey: ["careerProfile", userId], queryFn: () => getCareerProfile(userId!), enabled: !!userId });
}

export function useUpsertCareerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CareerProfileInput) => upsertCareerProfile(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careerProfile"] }); toast.success("Career profile updated"); },
  });
}

export function useMDRS(userId?: string) {
  return useQuery({ queryKey: ["mdrs", userId], queryFn: () => getMDRS(userId!), enabled: !!userId });
}

export function useSaveMDRS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: string; input: MDRSInput }) => saveMDRS(p.userId, p.input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mdrs"] }); toast.success("Reputation score computed"); },
  });
}

export function useExecutionReliability(userId?: string) {
  return useQuery({ queryKey: ["executionReliability", userId], queryFn: () => getExecutionReliability(userId!), enabled: !!userId });
}

export function useSaveExecutionReliability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: string; input: ExecutionReliabilityInput }) => saveExecutionReliability(p.userId, p.input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["executionReliability"] }); toast.success("Execution reliability saved"); },
  });
}

export function useAdaptability(userId?: string) {
  return useQuery({ queryKey: ["adaptability", userId], queryFn: () => getAdaptability(userId!), enabled: !!userId });
}

export function useSaveAdaptability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: string; input: AdaptabilityInput }) => saveAdaptability(p.userId, p.input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["adaptability"] }); toast.success("Adaptability index computed"); },
  });
}

export function useCareerRisks(userId?: string) {
  return useQuery({ queryKey: ["careerRisks", userId], queryFn: () => getCareerRisks(userId!), enabled: !!userId });
}

export function useSaveCareerRisks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: string; input: CareerRiskInput }) => saveCareerRisks(p.userId, p.input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careerRisks"] }); toast.success("Career risks assessed"); },
  });
}

export function useCareerTrajectory(userId?: string) {
  return useQuery({ queryKey: ["careerTrajectory", userId], queryFn: () => getCareerTrajectory(userId!), enabled: !!userId });
}

export function useSaveTrajectorySnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: string; snapshot: Parameters<typeof saveTrajectorySnapshot>[1] }) => saveTrajectorySnapshot(p.userId, p.snapshot),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["careerTrajectory"] }); toast.success("Trajectory snapshot saved"); },
  });
}

export function useExportAcademicIdentity() {
  return useMutation({
    mutationFn: (p: { userId: string; options?: Parameters<typeof exportAcademicIdentity>[1] }) => exportAcademicIdentity(p.userId, p.options ?? {}),
    onSuccess: () => toast.success("Academic identity exported"),
  });
}
