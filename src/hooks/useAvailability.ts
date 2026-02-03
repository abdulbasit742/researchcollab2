import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface WorkingHours {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isWorkingDay: boolean;
}

export interface AvailabilityWindow {
  id: string;
  type: "available" | "busy" | "focus" | "meeting" | "blocked";
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly";
  color?: string;
}

export interface ProjectAvailability {
  isOpenToProjects: boolean;
  maxConcurrentProjects: number;
  currentProjects: number;
  preferredProjectDuration: "short" | "medium" | "long" | "any";
  preferredProjectSize: "small" | "medium" | "large" | "any";
  availableHoursPerWeek: number;
  earliestStartDate: Date;
  excludedProjectTypes: string[];
}

export interface TimezoneOverlap {
  userId: string;
  userName: string;
  timezone: string;
  overlapHours: number;
  overlapWindows: { start: string; end: string }[];
  overlapQuality: "excellent" | "good" | "limited" | "minimal";
}

export function useAvailability(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const [loading, setLoading] = useState(false);
  const [timezone] = useState("America/New_York");

  const [workingHours] = useState<WorkingHours[]>([
    { dayOfWeek: 0, startTime: "", endTime: "", isWorkingDay: false },
    { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isWorkingDay: true },
    { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isWorkingDay: true },
    { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isWorkingDay: true },
    { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isWorkingDay: true },
    { dayOfWeek: 5, startTime: "09:00", endTime: "15:00", isWorkingDay: true },
    { dayOfWeek: 6, startTime: "", endTime: "", isWorkingDay: false },
  ]);

  const [availabilityWindows] = useState<AvailabilityWindow[]>([
    {
      id: "aw-1",
      type: "focus",
      title: "Deep Work Block",
      description: "No meetings, focused research time",
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 86400000 + 14400000),
      isRecurring: true,
      recurrencePattern: "daily",
    },
    {
      id: "aw-2",
      type: "meeting",
      title: "Team Sync",
      startTime: new Date(Date.now() + 86400000 * 2),
      endTime: new Date(Date.now() + 86400000 * 2 + 3600000),
      isRecurring: true,
      recurrencePattern: "weekly",
    },
    {
      id: "aw-3",
      type: "blocked",
      title: "Conference Attendance",
      description: "IEEE Conference - Out of office",
      startTime: new Date(Date.now() + 86400000 * 14),
      endTime: new Date(Date.now() + 86400000 * 18),
      isRecurring: false,
    },
  ]);

  const [projectAvailability] = useState<ProjectAvailability>({
    isOpenToProjects: true,
    maxConcurrentProjects: 3,
    currentProjects: 2,
    preferredProjectDuration: "medium",
    preferredProjectSize: "medium",
    availableHoursPerWeek: 15,
    earliestStartDate: new Date(Date.now() + 86400000 * 7),
    excludedProjectTypes: ["urgentDeadline"],
  });

  const hasCapacity = useMemo(() => 
    projectAvailability.currentProjects < projectAvailability.maxConcurrentProjects,
    [projectAvailability]
  );

  const updateWorkingHours = useCallback(async (hours: WorkingHours[]) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Updating working hours:", hours);
    setLoading(false);
    return { success: true };
  }, []);

  const addAvailabilityWindow = useCallback(async (window: Omit<AvailabilityWindow, "id">) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log("Adding availability window:", window);
    setLoading(false);
    return { success: true, id: `aw-${Date.now()}` };
  }, []);

  const removeAvailabilityWindow = useCallback(async (windowId: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoading(false);
    return { success: true };
  }, []);

  const updateProjectAvailability = useCallback(async (availability: Partial<ProjectAvailability>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log("Updating project availability:", availability);
    setLoading(false);
    return { success: true };
  }, []);

  const calculateTimezoneOverlap = useCallback((
    collaboratorTimezones: { userId: string; userName: string; timezone: string }[]
  ): TimezoneOverlap[] => {
    return collaboratorTimezones.map(collab => {
      // Simplified overlap calculation
      const overlapHours = collab.timezone === timezone ? 8 : 
        collab.timezone.includes("Europe") ? 4 : 
        collab.timezone.includes("Asia") ? 2 : 6;
      
      return {
        userId: collab.userId,
        userName: collab.userName,
        timezone: collab.timezone,
        overlapHours,
        overlapWindows: [{ start: "14:00", end: `${14 + overlapHours}:00` }],
        overlapQuality: overlapHours >= 6 ? "excellent" : 
                       overlapHours >= 4 ? "good" : 
                       overlapHours >= 2 ? "limited" : "minimal",
      };
    });
  }, [timezone]);

  const getAvailabilityForDate = useCallback((date: Date): AvailabilityWindow[] => {
    return availabilityWindows.filter(w => {
      const windowDate = new Date(w.startTime);
      return windowDate.toDateString() === date.toDateString();
    });
  }, [availabilityWindows]);

  return {
    timezone,
    workingHours,
    availabilityWindows,
    projectAvailability,
    hasCapacity,
    loading,
    updateWorkingHours,
    addAvailabilityWindow,
    removeAvailabilityWindow,
    updateProjectAvailability,
    calculateTimezoneOverlap,
    getAvailabilityForDate,
    targetUserId,
  };
}
