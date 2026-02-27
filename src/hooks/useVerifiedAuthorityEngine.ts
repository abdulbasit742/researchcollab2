/**
 * React hooks for Verified Authority & Credibility Engine (VACE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  saveDomainAuthority, getDomainAuthority,
  saveExecutionAuthority, getExecutionAuthority,
  saveKnowledgeAuthority, getKnowledgeAuthority,
  saveCollabTrustAuth, getCollabTrustAuth,
  recordAuthorityDecay, getAuthorityDecayHistory,
  submitPeerValidation, getPeerValidations,
  flagAuthorityManipulation, getAuthorityManipFlags,
  awardAuthorityBadge, getAuthorityBadges,
} from "@/lib/professional/verifiedAuthorityEngine";
import type {
  DomainAuthorityInput, ExecutionAuthorityInput, KnowledgeAuthorityInput,
  CollabTrustAuthorityInput, PeerValidationInput, AuthorityDecayInput,
  AuthorityBadgeInput, AuthorityManipFlagInput,
} from "@/lib/professional/verifiedAuthorityEngine";

// === Domain Authority ===
export function useDomainAuthority(userId?: string, domain?: string) {
  return useQuery({ queryKey: ["domainAuth", userId, domain], queryFn: () => getDomainAuthority(userId!, domain), enabled: !!userId });
}
export function useSaveDomainAuthority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DomainAuthorityInput) => saveDomainAuthority(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["domainAuth"] }); toast.success("Domain authority updated"); },
  });
}

// === Execution Authority ===
export function useExecutionAuthority(userId?: string) {
  return useQuery({ queryKey: ["execAuth", userId], queryFn: () => getExecutionAuthority(userId!), enabled: !!userId });
}
export function useSaveExecutionAuthority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ExecutionAuthorityInput) => saveExecutionAuthority(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["execAuth"] }); },
  });
}

// === Knowledge Authority ===
export function useKnowledgeAuthority(userId?: string) {
  return useQuery({ queryKey: ["knowledgeAuth", userId], queryFn: () => getKnowledgeAuthority(userId!), enabled: !!userId });
}
export function useSaveKnowledgeAuthority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: KnowledgeAuthorityInput) => saveKnowledgeAuthority(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledgeAuth"] }); },
  });
}

// === Collaboration Trust Authority ===
export function useCollabTrustAuthority(userId?: string) {
  return useQuery({ queryKey: ["collabTrustAuth", userId], queryFn: () => getCollabTrustAuth(userId!), enabled: !!userId });
}
export function useSaveCollabTrustAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CollabTrustAuthorityInput) => saveCollabTrustAuth(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["collabTrustAuth"] }); },
  });
}

// === Authority Decay ===
export function useAuthorityDecayHistory(userId?: string) {
  return useQuery({ queryKey: ["authDecay", userId], queryFn: () => getAuthorityDecayHistory(userId!), enabled: !!userId });
}
export function useRecordAuthorityDecay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AuthorityDecayInput) => recordAuthorityDecay(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["authDecay", "domainAuth"] }); },
  });
}

// === Peer Validation ===
export function usePeerValidations(userId?: string) {
  return useQuery({ queryKey: ["peerVal", userId], queryFn: () => getPeerValidations(userId!), enabled: !!userId });
}
export function useSubmitPeerValidation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PeerValidationInput) => submitPeerValidation(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["peerVal"] }); toast.success("Peer validation submitted"); },
  });
}

// === Manipulation Flags ===
export function useAuthorityManipFlags(userId?: string) {
  return useQuery({ queryKey: ["authManip", userId], queryFn: () => getAuthorityManipFlags(userId!), enabled: !!userId });
}
export function useFlagAuthorityManipulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AuthorityManipFlagInput) => flagAuthorityManipulation(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["authManip"] }); toast.success("Manipulation flagged"); },
  });
}

// === Impact Badges ===
export function useAuthorityBadges(userId?: string) {
  return useQuery({ queryKey: ["authBadges", userId], queryFn: () => getAuthorityBadges(userId!), enabled: !!userId });
}
export function useAwardAuthorityBadge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AuthorityBadgeInput) => awardAuthorityBadge(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["authBadges"] }); toast.success("Badge awarded"); },
  });
}
