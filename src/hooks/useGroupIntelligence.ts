/**
 * React hooks for Professional Group Intelligence System (PGIS).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createGroup, getGroups, getGroup, updateGroup,
  joinGroup, getGroupMembers, updateMemberRole, leaveGroup,
  createGroupPost, getGroupPosts, markPostAsSolution,
  addThreadReply, getThreadReplies, markReplyAsSolution,
  saveGroupTrustDensity, getGroupTrustDensity,
  addGroupOutcome, getGroupOutcomes,
  saveGroupIntelligence, getGroupIntelligence,
  flagToxicity, getToxicityFlags, resolveToxicityFlag,
  addGroupMemory, getGroupMemory,
} from "@/lib/professional/groupIntelligenceEngine";
import type {
  GroupInput, GroupMemberInput, GroupPostInput, ThreadReplyInput,
  TrustDensityInput, GroupOutcomeInput, IntelligenceMetricsInput,
  ToxicityFlagInput, GroupMemoryInput, GroupDiscoveryFilters,
} from "@/lib/professional/groupIntelligenceEngine";

// === Groups ===
export function useGroups(filters?: GroupDiscoveryFilters) {
  return useQuery({ queryKey: ["profGroups", filters], queryFn: () => getGroups(filters) });
}
export function useGroup(id?: string) {
  return useQuery({ queryKey: ["profGroup", id], queryFn: () => getGroup(id!), enabled: !!id });
}
export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupInput) => createGroup(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profGroups"] }); toast.success("Group created"); },
  });
}
export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; updates: Partial<GroupInput> }) => updateGroup(p.id, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profGroups"] }); },
  });
}

// === Members ===
export function useGroupMembers(groupId?: string) {
  return useQuery({ queryKey: ["grpMembers", groupId], queryFn: () => getGroupMembers(groupId!), enabled: !!groupId });
}
export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupMemberInput) => joinGroup(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpMembers"] }); toast.success("Joined group"); },
  });
}
export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { groupId: string; userId: string; role: string }) => updateMemberRole(p.groupId, p.userId, p.role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpMembers"] }); },
  });
}
export function useLeaveGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { groupId: string; userId: string }) => leaveGroup(p.groupId, p.userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpMembers"] }); toast.success("Left group"); },
  });
}

// === Posts ===
export function useGroupPosts(groupId?: string, postType?: string) {
  return useQuery({ queryKey: ["grpPosts", groupId, postType], queryFn: () => getGroupPosts(groupId!, postType), enabled: !!groupId });
}
export function useCreateGroupPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupPostInput) => createGroupPost(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpPosts"] }); toast.success("Post published"); },
  });
}
export function useMarkPostAsSolution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => markPostAsSolution(postId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpPosts"] }); },
  });
}

// === Thread Replies ===
export function useThreadReplies(postId?: string) {
  return useQuery({ queryKey: ["grpReplies", postId], queryFn: () => getThreadReplies(postId!), enabled: !!postId });
}
export function useAddThreadReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ThreadReplyInput) => addThreadReply(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpReplies"] }); },
  });
}
export function useMarkReplyAsSolution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (replyId: string) => markReplyAsSolution(replyId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpReplies"] }); },
  });
}

// === Trust Density ===
export function useGroupTrustDensity(groupId?: string) {
  return useQuery({ queryKey: ["grpTrust", groupId], queryFn: () => getGroupTrustDensity(groupId!), enabled: !!groupId });
}
export function useSaveGroupTrustDensity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TrustDensityInput) => saveGroupTrustDensity(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpTrust"] }); },
  });
}

// === Outcomes ===
export function useGroupOutcomes(groupId?: string) {
  return useQuery({ queryKey: ["grpOutcomes", groupId], queryFn: () => getGroupOutcomes(groupId!), enabled: !!groupId });
}
export function useAddGroupOutcome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupOutcomeInput) => addGroupOutcome(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpOutcomes"] }); toast.success("Outcome recorded"); },
  });
}

// === Intelligence Metrics ===
export function useGroupIntelligence(groupId?: string) {
  return useQuery({ queryKey: ["grpIntel", groupId], queryFn: () => getGroupIntelligence(groupId!), enabled: !!groupId });
}
export function useSaveGroupIntelligence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: IntelligenceMetricsInput) => saveGroupIntelligence(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpIntel"] }); },
  });
}

// === Toxicity Flags ===
export function useToxicityFlags(groupId?: string) {
  return useQuery({ queryKey: ["grpTox", groupId], queryFn: () => getToxicityFlags(groupId!), enabled: !!groupId });
}
export function useFlagToxicity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ToxicityFlagInput) => flagToxicity(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpTox"] }); toast.success("Flag submitted"); },
  });
}
export function useResolveToxicityFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { flagId: string; reviewerId: string }) => resolveToxicityFlag(p.flagId, p.reviewerId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpTox"] }); },
  });
}

// === Group Memory ===
export function useGroupMemory(groupId?: string) {
  return useQuery({ queryKey: ["grpMemory", groupId], queryFn: () => getGroupMemory(groupId!), enabled: !!groupId });
}
export function useAddGroupMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GroupMemoryInput) => addGroupMemory(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grpMemory"] }); },
  });
}

// === Aggregated Group Dashboard ===
export function useGroupDashboard(groupId?: string) {
  const group = useGroup(groupId);
  const members = useGroupMembers(groupId);
  const posts = useGroupPosts(groupId);
  const trust = useGroupTrustDensity(groupId);
  const outcomes = useGroupOutcomes(groupId);
  const intel = useGroupIntelligence(groupId);
  const memory = useGroupMemory(groupId);

  return {
    group: group.data, groupLoading: group.isLoading,
    members: members.data ?? [], membersLoading: members.isLoading,
    posts: posts.data ?? [], postsLoading: posts.isLoading,
    trustDensity: trust.data, trustLoading: trust.isLoading,
    outcomes: outcomes.data ?? [], outcomesLoading: outcomes.isLoading,
    intelligence: intel.data, intelLoading: intel.isLoading,
    memory: memory.data ?? [], memoryLoading: memory.isLoading,
    isLoading: group.isLoading || members.isLoading,
  };
}
