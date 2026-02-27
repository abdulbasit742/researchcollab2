/**
 * React hooks for Value-Optimized Social Intelligence Engine.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  saveValueRanking, getValueRanking,
  saveLongTermValue, getLongTermValue,
  saveCollabProbability,
  setAlgorithmMode, getAlgorithmMode,
  saveFeedExplainability, getFeedExplainability,
  submitValueFeedback, getPostValueFeedback,
  applyViralityCap,
  flagManipulation, getManipulationFlags,
} from "@/lib/professional/socialIntelligenceEngine";
import type {
  ValueRankingInput, LongTermValueInput, CollabProbabilityInput,
  AlgorithmModeInput, FeedExplainabilityInput, ValueFeedbackInput,
  ViralityCapInput, ManipulationFlagInput,
} from "@/lib/professional/socialIntelligenceEngine";

// === Value Rankings ===
export function useValueRanking(postId?: string) {
  return useQuery({ queryKey: ["valueRank", postId], queryFn: () => getValueRanking(postId!), enabled: !!postId });
}
export function useSaveValueRanking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ValueRankingInput) => saveValueRanking(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["valueRank"] }); },
  });
}

// === Long-Term Value ===
export function useLongTermValue(postId?: string) {
  return useQuery({ queryKey: ["ltv", postId], queryFn: () => getLongTermValue(postId!), enabled: !!postId });
}
export function useSaveLongTermValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LongTermValueInput) => saveLongTermValue(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ltv"] }); },
  });
}

// === Collab Probability ===
export function useSaveCollabProbability() {
  return useMutation({ mutationFn: (input: CollabProbabilityInput) => saveCollabProbability(input) });
}

// === Algorithm Mode ===
export function useAlgorithmMode(userId?: string) {
  return useQuery({ queryKey: ["algoMode", userId], queryFn: () => getAlgorithmMode(userId!), enabled: !!userId });
}
export function useSetAlgorithmMode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AlgorithmModeInput) => setAlgorithmMode(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["algoMode"] }); toast.success("Algorithm mode updated"); },
  });
}

// === Feed Explainability ===
export function useFeedExplainability(userId?: string, postId?: string) {
  return useQuery({ queryKey: ["feedExplain", userId, postId], queryFn: () => getFeedExplainability(userId!, postId!), enabled: !!userId && !!postId });
}
export function useSaveFeedExplainability() {
  return useMutation({ mutationFn: (input: FeedExplainabilityInput) => saveFeedExplainability(input) });
}

// === Value Feedback ===
export function usePostValueFeedback(postId?: string) {
  return useQuery({ queryKey: ["valFeedback", postId], queryFn: () => getPostValueFeedback(postId!), enabled: !!postId });
}
export function useSubmitValueFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ValueFeedbackInput) => submitValueFeedback(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["valFeedback"] }); toast.success("Feedback submitted"); },
  });
}

// === Virality Cap ===
export function useApplyViralityCap() {
  return useMutation({ mutationFn: (input: ViralityCapInput) => applyViralityCap(input) });
}

// === Manipulation Flags ===
export function useManipulationFlags(targetId?: string) {
  return useQuery({ queryKey: ["manipFlags", targetId], queryFn: () => getManipulationFlags(targetId!), enabled: !!targetId });
}
export function useFlagManipulation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ManipulationFlagInput) => flagManipulation(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["manipFlags"] }); toast.success("Manipulation flagged"); },
  });
}
