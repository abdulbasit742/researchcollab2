/**
 * React hooks for Micro-Execution Video Intelligence System.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMicroVideo, getMicroVideos, getUserMicroVideos,
  saveVideoQuality, getVideoQuality,
  saveVideoRanking,
  startVideoSession, updateVideoSession, getUserVideoSessions,
  addVideoComment, getVideoComments,
  createLearningPlaylist, getLearningPlaylists,
  createInstitutionalChannel, getInstitutionalChannels,
} from "@/lib/professional/microExecutionVideo";
import type {
  MicroVideoInput, VideoQualityInput, VideoRankingInput,
  VideoSessionInput, VideoSessionUpdate, VideoCommentInput,
  LearningPlaylistInput, InstitutionalChannelInput,
} from "@/lib/professional/microExecutionVideo";

// === Videos ===
export function useMicroVideos(filters?: { domain?: string; depth_tier?: string; difficulty?: string }) {
  return useQuery({ queryKey: ["microVideos", filters], queryFn: () => getMicroVideos(filters) });
}
export function useUserMicroVideos(creatorId?: string) {
  return useQuery({ queryKey: ["userVideos", creatorId], queryFn: () => getUserMicroVideos(creatorId!), enabled: !!creatorId });
}
export function useCreateMicroVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MicroVideoInput) => createMicroVideo(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["microVideos"] }); toast.success("Video published"); },
  });
}

// === Quality ===
export function useVideoQuality(videoId?: string) {
  return useQuery({ queryKey: ["videoQuality", videoId], queryFn: () => getVideoQuality(videoId!), enabled: !!videoId });
}
export function useSaveVideoQuality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VideoQualityInput) => saveVideoQuality(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["videoQuality"] }); },
  });
}

// === Rankings ===
export function useSaveVideoRanking() {
  return useMutation({ mutationFn: (input: VideoRankingInput) => saveVideoRanking(input) });
}

// === Sessions ===
export function useVideoSessions(userId?: string) {
  return useQuery({ queryKey: ["videoSessions", userId], queryFn: () => getUserVideoSessions(userId!), enabled: !!userId });
}
export function useStartVideoSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VideoSessionInput) => startVideoSession(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["videoSessions"] }); },
  });
}
export function useUpdateVideoSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { sessionId: string; updates: VideoSessionUpdate }) => updateVideoSession(p.sessionId, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["videoSessions"] }); },
  });
}

// === Comments ===
export function useVideoComments(videoId?: string) {
  return useQuery({ queryKey: ["videoComments", videoId], queryFn: () => getVideoComments(videoId!), enabled: !!videoId });
}
export function useAddVideoComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VideoCommentInput) => addVideoComment(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["videoComments"] }); toast.success("Comment added"); },
  });
}

// === Learning Playlists ===
export function useVideoLearningPlaylists(filters?: { skill_path?: string }) {
  return useQuery({ queryKey: ["videoPlaylists", filters], queryFn: () => getLearningPlaylists(filters) });
}
export function useCreateLearningPlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LearningPlaylistInput) => createLearningPlaylist(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["videoPlaylists"] }); toast.success("Playlist created"); },
  });
}

// === Institutional Channels ===
export function useVideoInstitutionalChannels(institutionId?: string) {
  return useQuery({ queryKey: ["instVideoChannels", institutionId], queryFn: () => getInstitutionalChannels(institutionId) });
}
export function useCreateInstitutionalChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InstitutionalChannelInput) => createInstitutionalChannel(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["instVideoChannels"] }); toast.success("Channel created"); },
  });
}
