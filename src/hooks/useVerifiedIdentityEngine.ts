/**
 * React hooks for Verified Professional Visual Identity Engine.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  saveReputationStack, getReputationStack,
  addIdentityTimelineEvent, getIdentityTimeline,
  addSkillMatrixEntry, getSkillMatrix, updateSkillMatrixEntry,
  awardVerifiedBadge, getUserVerifiedBadges,
  addGlobalFootprint, getGlobalFootprint,
  saveStabilityIndex, getStabilityIndex,
  submitInstitutionalVerification, approveInstitutionalVerification, getUserInstitutionalVerifications,
} from "@/lib/professional/verifiedIdentityEngine";
import type {
  ReputationStackInput, IdentityTimelineEventInput, SkillMatrixEntryInput,
  VerifiedBadgeInput, GlobalFootprintInput, StabilityIndexInput, InstitutionalVerificationInput,
} from "@/lib/professional/verifiedIdentityEngine";

// === Reputation Stack ===
export function useReputationStack(userId?: string) {
  return useQuery({ queryKey: ["repStack", userId], queryFn: () => getReputationStack(userId!), enabled: !!userId });
}

export function useSaveReputationStack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReputationStackInput) => saveReputationStack(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["repStack"] }); toast.success("Reputation stack updated"); },
  });
}

// === Identity Timeline ===
export function useIdentityTimeline(userId?: string) {
  return useQuery({ queryKey: ["idTimeline", userId], queryFn: () => getIdentityTimeline(userId!), enabled: !!userId });
}

export function useAddIdentityTimelineEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IdentityTimelineEventInput) => addIdentityTimelineEvent(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["idTimeline"] }); toast.success("Timeline event added"); },
  });
}

// === Skill Matrix ===
export function useSkillMatrix(userId?: string) {
  return useQuery({ queryKey: ["skillMatrix", userId], queryFn: () => getSkillMatrix(userId!), enabled: !!userId });
}

export function useAddSkillMatrixEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SkillMatrixEntryInput) => addSkillMatrixEntry(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["skillMatrix"] }); toast.success("Skill added"); },
  });
}

export function useUpdateSkillMatrixEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { entryId: string; updates: Partial<SkillMatrixEntryInput> }) => updateSkillMatrixEntry(p.entryId, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["skillMatrix"] }); toast.success("Skill updated"); },
  });
}

// === Verified Badges ===
export function useVerifiedBadges(userId?: string) {
  return useQuery({ queryKey: ["verifiedBadges", userId], queryFn: () => getUserVerifiedBadges(userId!), enabled: !!userId });
}

export function useAwardVerifiedBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VerifiedBadgeInput) => awardVerifiedBadge(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["verifiedBadges"] }); toast.success("Badge awarded"); },
  });
}

// === Global Footprint ===
export function useGlobalFootprint(userId?: string) {
  return useQuery({ queryKey: ["globalFootprint", userId], queryFn: () => getGlobalFootprint(userId!), enabled: !!userId });
}

export function useAddGlobalFootprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GlobalFootprintInput) => addGlobalFootprint(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["globalFootprint"] }); toast.success("Footprint added"); },
  });
}

// === Stability Index ===
export function useStabilityIndex(userId?: string) {
  return useQuery({ queryKey: ["stabilityIndex", userId], queryFn: () => getStabilityIndex(userId!), enabled: !!userId });
}

export function useSaveStabilityIndex() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StabilityIndexInput) => saveStabilityIndex(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stabilityIndex"] }); toast.success("Stability index saved"); },
  });
}

// === Institutional Verification ===
export function useInstitutionalVerifications(userId?: string) {
  return useQuery({ queryKey: ["instVerify", userId], queryFn: () => getUserInstitutionalVerifications(userId!), enabled: !!userId });
}

export function useSubmitInstitutionalVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InstitutionalVerificationInput) => submitInstitutionalVerification(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instVerify"] }); toast.success("Verification submitted"); },
  });
}

export function useApproveInstitutionalVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { verificationId: string; verifiedByUserId: string }) => approveInstitutionalVerification(p.verificationId, p.verifiedByUserId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instVerify"] }); toast.success("Verification approved"); },
  });
}
