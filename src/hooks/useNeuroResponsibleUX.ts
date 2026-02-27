/**
 * React hooks for Neuro-Responsible UX & Cognitive Wellness Engine.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  startFeedSession, updateFeedSession, getUserFeedSessions,
  saveTimeAwareness, getTimeAwareness,
  saveNotificationPrefs, getNotificationPrefs,
  startFocusMode, endFocusMode, getActiveFocusMode,
  saveHealthyEngagement, getHealthyEngagement,
  saveWeeklyReflection, getWeeklyReflections,
  saveGrowthSnapshot, getGrowthSnapshots,
  saveMetricVisibility, getMetricVisibility,
} from "@/lib/professional/neuroResponsibleUX";
import type {
  FeedSessionInput, FeedSessionUpdate, TimeAwarenessInput,
  NotificationPrefsInput, FocusModeInput, HealthyEngagementInput,
  WeeklyReflectionInput, GrowthSnapshotInput, MetricVisibilityInput,
} from "@/lib/professional/neuroResponsibleUX";

// === Feed Sessions ===
export function useFeedSessions(userId?: string) {
  return useQuery({ queryKey: ["feedSessions", userId], queryFn: () => getUserFeedSessions(userId!), enabled: !!userId });
}
export function useStartFeedSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FeedSessionInput) => startFeedSession(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feedSessions"] }); },
  });
}
export function useUpdateFeedSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { sessionId: string; updates: FeedSessionUpdate }) => updateFeedSession(p.sessionId, p.updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["feedSessions"] }); },
  });
}

// === Time Awareness ===
export function useTimeAwareness(userId?: string, period?: string) {
  return useQuery({ queryKey: ["timeAwareness", userId, period], queryFn: () => getTimeAwareness(userId!, period), enabled: !!userId });
}
export function useSaveTimeAwareness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TimeAwarenessInput) => saveTimeAwareness(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timeAwareness"] }); },
  });
}

// === Notification Preferences ===
export function useNotificationPrefs(userId?: string) {
  return useQuery({ queryKey: ["notifPrefs", userId], queryFn: () => getNotificationPrefs(userId!), enabled: !!userId });
}
export function useSaveNotificationPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NotificationPrefsInput) => saveNotificationPrefs(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifPrefs"] }); toast.success("Notification preferences saved"); },
  });
}

// === Focus Mode ===
export function useActiveFocusMode(userId?: string) {
  return useQuery({ queryKey: ["focusMode", userId], queryFn: () => getActiveFocusMode(userId!), enabled: !!userId });
}
export function useStartFocusMode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: FocusModeInput) => startFocusMode(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["focusMode"] }); toast.success("Focus mode activated"); },
  });
}
export function useEndFocusMode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => endFocusMode(sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["focusMode"] }); toast.success("Focus mode ended"); },
  });
}

// === Healthy Engagement ===
export function useHealthyEngagement(userId?: string, period?: string) {
  return useQuery({ queryKey: ["healthyEng", userId, period], queryFn: () => getHealthyEngagement(userId!, period), enabled: !!userId });
}
export function useSaveHealthyEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HealthyEngagementInput) => saveHealthyEngagement(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["healthyEng"] }); },
  });
}

// === Weekly Reflections ===
export function useWeeklyReflections(userId?: string) {
  return useQuery({ queryKey: ["weeklyReflect", userId], queryFn: () => getWeeklyReflections(userId!), enabled: !!userId });
}
export function useSaveWeeklyReflection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WeeklyReflectionInput) => saveWeeklyReflection(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["weeklyReflect"] }); toast.success("Reflection saved"); },
  });
}

// === Growth Snapshots ===
export function useGrowthSnapshots(userId?: string) {
  return useQuery({ queryKey: ["growthSnap", userId], queryFn: () => getGrowthSnapshots(userId!), enabled: !!userId });
}
export function useSaveGrowthSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GrowthSnapshotInput) => saveGrowthSnapshot(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["growthSnap"] }); },
  });
}

// === Metric Visibility ===
export function useMetricVisibility(userId?: string) {
  return useQuery({ queryKey: ["metricVis", userId], queryFn: () => getMetricVisibility(userId!), enabled: !!userId });
}
export function useSaveMetricVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MetricVisibilityInput) => saveMetricVisibility(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["metricVis"] }); toast.success("Metric visibility updated"); },
  });
}
