/**
 * React hooks for Execution Communication & Collaboration Engine (ECCE).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createChatRoom, getChatRooms, getChatRoom,
  addRoomMember, getRoomMembers, removeRoomMember,
  logDecision, getDecisionLogs,
  createActionItem, getActionItems, updateActionItemStatus,
  saveEscrowContext, getEscrowContext,
  createDisputeThread, getDisputeThreads, resolveDispute,
  createMeeting, getMeetings, updateMeetingSummary,
  saveHealthAnalytics, getHealthAnalytics,
  archiveItem, getArchive,
} from "@/lib/professional/executionCommunicationEngine";
import type {
  ChatRoomInput, RoomMemberInput, DecisionLogInput, ActionItemInput,
  EscrowContextInput, DisputeThreadInput, MeetingInput,
  HealthAnalyticsInput, ArchiveInput, RoomSearchFilters,
} from "@/lib/professional/executionCommunicationEngine";

// === Chat Rooms ===
export function useECCERooms(filters?: RoomSearchFilters) {
  return useQuery({ queryKey: ["ecceRooms", filters], queryFn: () => getChatRooms(filters) });
}
export function useECCERoom(id?: string) {
  return useQuery({ queryKey: ["ecceRoom", id], queryFn: () => getChatRoom(id!), enabled: !!id });
}
export function useCreateECCERoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ChatRoomInput) => createChatRoom(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceRooms"] }); toast.success("Chat room created"); },
  });
}

// === Members ===
export function useECCEMembers(roomId?: string) {
  return useQuery({ queryKey: ["ecceMembers", roomId], queryFn: () => getRoomMembers(roomId!), enabled: !!roomId });
}
export function useAddECCEMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RoomMemberInput) => addRoomMember(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceMembers"] }); },
  });
}
export function useRemoveECCEMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { roomId: string; userId: string }) => removeRoomMember(p.roomId, p.userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceMembers"] }); },
  });
}

// === Decision Logs ===
export function useECCEDecisions(roomId?: string) {
  return useQuery({ queryKey: ["ecceDecisions", roomId], queryFn: () => getDecisionLogs(roomId!), enabled: !!roomId });
}
export function useLogDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DecisionLogInput) => logDecision(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceDecisions"] }); toast.success("Decision logged"); },
  });
}

// === Action Items ===
export function useECCEActionItems(roomId?: string, status?: string) {
  return useQuery({ queryKey: ["ecceActions", roomId, status], queryFn: () => getActionItems(roomId!, status), enabled: !!roomId });
}
export function useCreateActionItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ActionItemInput) => createActionItem(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceActions"] }); toast.success("Action item created"); },
  });
}
export function useUpdateActionItemStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; status: string }) => updateActionItemStatus(p.id, p.status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceActions"] }); },
  });
}

// === Escrow Context ===
export function useECCEEscrowContext(roomId?: string) {
  return useQuery({ queryKey: ["ecceEscrow", roomId], queryFn: () => getEscrowContext(roomId!), enabled: !!roomId });
}
export function useSaveEscrowContext() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EscrowContextInput) => saveEscrowContext(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceEscrow"] }); },
  });
}

// === Disputes ===
export function useECCEDisputes(roomId?: string) {
  return useQuery({ queryKey: ["ecceDisputes", roomId], queryFn: () => getDisputeThreads(roomId!), enabled: !!roomId });
}
export function useCreateDisputeThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: DisputeThreadInput) => createDisputeThread(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceDisputes"] }); toast.success("Dispute escalated"); },
  });
}
export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; resolution: string }) => resolveDispute(p.id, p.resolution),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceDisputes"] }); toast.success("Dispute resolved"); },
  });
}

// === Meetings ===
export function useECCEMeetings(roomId?: string) {
  return useQuery({ queryKey: ["ecceMeetings", roomId], queryFn: () => getMeetings(roomId!), enabled: !!roomId });
}
export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MeetingInput) => createMeeting(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceMeetings"] }); toast.success("Meeting scheduled"); },
  });
}
export function useUpdateMeetingSummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; updates: Parameters<typeof updateMeetingSummary>[1] }) => updateMeetingSummary(p.id, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceMeetings"] }); },
  });
}

// === Health Analytics ===
export function useECCEHealth(roomId?: string) {
  return useQuery({ queryKey: ["ecceHealth", roomId], queryFn: () => getHealthAnalytics(roomId!), enabled: !!roomId });
}
export function useSaveHealthAnalytics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HealthAnalyticsInput) => saveHealthAnalytics(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceHealth"] }); },
  });
}

// === Archive ===
export function useECCEArchive(roomId?: string, archiveType?: string) {
  return useQuery({ queryKey: ["ecceArchive", roomId, archiveType], queryFn: () => getArchive(roomId!, archiveType), enabled: !!roomId });
}
export function useArchiveItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ArchiveInput) => archiveItem(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ecceArchive"] }); toast.success("Item archived"); },
  });
}

// === Aggregated Room Dashboard ===
export function useECCERoomDashboard(roomId?: string) {
  const room = useECCERoom(roomId);
  const members = useECCEMembers(roomId);
  const decisions = useECCEDecisions(roomId);
  const actions = useECCEActionItems(roomId);
  const escrow = useECCEEscrowContext(roomId);
  const disputes = useECCEDisputes(roomId);
  const meetings = useECCEMeetings(roomId);
  const health = useECCEHealth(roomId);
  const archive = useECCEArchive(roomId);

  return {
    room: room.data, roomLoading: room.isLoading,
    members: members.data ?? [], membersLoading: members.isLoading,
    decisions: decisions.data ?? [], decisionsLoading: decisions.isLoading,
    actionItems: actions.data ?? [], actionsLoading: actions.isLoading,
    escrowContext: escrow.data, escrowLoading: escrow.isLoading,
    disputes: disputes.data ?? [], disputesLoading: disputes.isLoading,
    meetings: meetings.data ?? [], meetingsLoading: meetings.isLoading,
    health: health.data, healthLoading: health.isLoading,
    archive: archive.data ?? [], archiveLoading: archive.isLoading,
    isLoading: room.isLoading,
  };
}
