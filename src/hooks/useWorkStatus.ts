import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type WorkStatusType = "available" | "busy" | "deep_work" | "away" | "dnd";

export interface WorkStatus {
  status: WorkStatusType;
  message?: string;
  expiresAt?: Date;
  isAutomatic: boolean;
  openToOpportunities: boolean;
  responseTimeHours: number;
  lastUpdated: Date;
}

export interface StatusHistoryEntry {
  id: string;
  status: WorkStatusType;
  message?: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes: number;
  wasAutomatic: boolean;
}

export interface StatusPreset {
  id: string;
  name: string;
  status: WorkStatusType;
  message: string;
  autoExpireHours?: number;
}

const DEFAULT_PRESETS: StatusPreset[] = [
  { id: "preset-1", name: "Focus Time", status: "deep_work", message: "In deep focus mode - will respond later", autoExpireHours: 2 },
  { id: "preset-2", name: "In Meeting", status: "busy", message: "Currently in a meeting", autoExpireHours: 1 },
  { id: "preset-3", name: "Lunch Break", status: "away", message: "On lunch break - back in an hour", autoExpireHours: 1 },
  { id: "preset-4", name: "End of Day", status: "away", message: "Done for today - will respond tomorrow" },
  { id: "preset-5", name: "Vacation", status: "dnd", message: "On vacation - limited availability" },
];

export function useWorkStatus(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const isOwnProfile = targetUserId === user?.id;

  const [loading, setLoading] = useState(false);
  const [presets] = useState<StatusPreset[]>(DEFAULT_PRESETS);

  const [currentStatus, setCurrentStatus] = useState<WorkStatus>({
    status: "available",
    message: "Open for collaboration",
    isAutomatic: false,
    openToOpportunities: true,
    responseTimeHours: 4,
    lastUpdated: new Date(),
  });

  const [statusHistory] = useState<StatusHistoryEntry[]>([
    { id: "hist-1", status: "deep_work", message: "Focused coding session", startedAt: new Date(Date.now() - 86400000), endedAt: new Date(Date.now() - 86400000 + 7200000), durationMinutes: 120, wasAutomatic: false },
    { id: "hist-2", status: "busy", startedAt: new Date(Date.now() - 86400000 * 2), endedAt: new Date(Date.now() - 86400000 * 2 + 3600000), durationMinutes: 60, wasAutomatic: true },
  ]);

  const updateStatus = useCallback(async (
    newStatus: WorkStatusType,
    options?: {
      message?: string;
      expiresAt?: Date;
      openToOpportunities?: boolean;
      responseTimeHours?: number;
    }
  ) => {
    if (!isOwnProfile) return { success: false, error: "Cannot update status for other users" };

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    setCurrentStatus(prev => ({
      status: newStatus,
      message: options?.message || prev.message,
      expiresAt: options?.expiresAt,
      isAutomatic: false,
      openToOpportunities: options?.openToOpportunities ?? prev.openToOpportunities,
      responseTimeHours: options?.responseTimeHours ?? prev.responseTimeHours,
      lastUpdated: new Date(),
    }));

    setLoading(false);
    return { success: true };
  }, [isOwnProfile]);

  const applyPreset = useCallback(async (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return { success: false, error: "Preset not found" };

    const expiresAt = preset.autoExpireHours 
      ? new Date(Date.now() + preset.autoExpireHours * 3600000)
      : undefined;

    return updateStatus(preset.status, { message: preset.message, expiresAt });
  }, [presets, updateStatus]);

  const toggleOpportunities = useCallback(async (open: boolean) => {
    return updateStatus(currentStatus.status, { openToOpportunities: open });
  }, [currentStatus.status, updateStatus]);

  // Check for expired status
  useEffect(() => {
    if (currentStatus.expiresAt && currentStatus.expiresAt <= new Date()) {
      setCurrentStatus(prev => ({
        ...prev,
        status: "available",
        message: undefined,
        expiresAt: undefined,
        isAutomatic: true,
        lastUpdated: new Date(),
      }));
    }
  }, [currentStatus.expiresAt]);

  const getStatusColor = useCallback((status: WorkStatusType): string => {
    switch (status) {
      case "available": return "bg-green-500";
      case "busy": return "bg-yellow-500";
      case "deep_work": return "bg-purple-500";
      case "away": return "bg-gray-500";
      case "dnd": return "bg-red-500";
      default: return "bg-muted";
    }
  }, []);

  const getStatusLabel = useCallback((status: WorkStatusType): string => {
    switch (status) {
      case "available": return "Available";
      case "busy": return "Busy";
      case "deep_work": return "In Deep Work";
      case "away": return "Away";
      case "dnd": return "Do Not Disturb";
      default: return "Unknown";
    }
  }, []);

  return {
    currentStatus,
    statusHistory,
    presets,
    loading,
    isOwnProfile,
    updateStatus,
    applyPreset,
    toggleOpportunities,
    getStatusColor,
    getStatusLabel,
    targetUserId,
  };
}
