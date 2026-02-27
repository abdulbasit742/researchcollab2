/**
 * React hooks for Execution-First Visual Network extensions.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCollaborationRequest, getCollaborationRequests, respondToCollaborationRequest,
  getDiscoveryCategories, createDiscoveryCategory,
  createLearningModule, getLearningModules, getUserLearningModules,
  getAIContentRecommendations, saveAIContentRecommendation,
  getInnovationMapPoints, addInnovationMapPoint,
} from "@/lib/professional/executionVisualNetwork";
import type {
  CollaborationRequestInput, LearningModuleInput, InnovationMapPointInput,
} from "@/lib/professional/executionVisualNetwork";

// === Collaboration Requests ===
export function useCollaborationRequests(userId?: string, status?: string) {
  return useQuery({
    queryKey: ["collabRequests", userId, status],
    queryFn: () => getCollaborationRequests(userId, status),
  });
}

export function useCreateCollaborationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CollaborationRequestInput) => createCollaborationRequest(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["collabRequests"] }); toast.success("Collaboration request sent"); },
  });
}

export function useRespondToCollaborationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { requestId: string; status: "accepted" | "declined" }) => respondToCollaborationRequest(p.requestId, p.status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["collabRequests"] }); toast.success("Response recorded"); },
  });
}

// === Discovery Categories ===
export function useDiscoveryCategories(categoryType?: string) {
  return useQuery({
    queryKey: ["discoveryCategories", categoryType],
    queryFn: () => getDiscoveryCategories(categoryType),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateDiscoveryCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof createDiscoveryCategory>[0]) => createDiscoveryCategory(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["discoveryCategories"] }); toast.success("Category created"); },
  });
}

// === Learning Modules ===
export function useLearningModules(moduleType?: string, skillTag?: string) {
  return useQuery({
    queryKey: ["learningModules", moduleType, skillTag],
    queryFn: () => getLearningModules(moduleType, skillTag),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserLearningModules(authorId?: string) {
  return useQuery({
    queryKey: ["userLearningModules", authorId],
    queryFn: () => getUserLearningModules(authorId!),
    enabled: !!authorId,
  });
}

export function useCreateLearningModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LearningModuleInput) => createLearningModule(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["learningModules"] }); toast.success("Learning module created"); },
  });
}

// === AI Content Recommendations ===
export function useAIContentRecommendations(userId?: string) {
  return useQuery({
    queryKey: ["aiContentRecs", userId],
    queryFn: () => getAIContentRecommendations(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveAIContentRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof saveAIContentRecommendation>[0]) => saveAIContentRecommendation(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["aiContentRecs"] }); },
  });
}

// === Innovation Map ===
export function useInnovationMapPoints(pointType?: string, countryCode?: string) {
  return useQuery({
    queryKey: ["innovationMap", pointType, countryCode],
    queryFn: () => getInnovationMapPoints(pointType, countryCode),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAddInnovationMapPoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InnovationMapPointInput) => addInnovationMapPoint(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["innovationMap"] }); toast.success("Map point added"); },
  });
}
