import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface NotificationType {
  id: string;
  key: string;
  category: string;
  title_template: string;
  body_template: string;
  default_in_app: boolean;
  default_email: boolean;
  default_push: boolean;
  importance: string;
}

export interface NotificationPreference {
  id: string;
  notification_type_id: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
}

export interface GlobalNotificationSettings {
  do_not_disturb: boolean;
  dnd_start_time: string | null;
  dnd_end_time: string | null;
  email_digest_frequency: string;
  muted_until: string | null;
}

export interface NotificationWithType extends NotificationPreference {
  notification_type: NotificationType;
}

// Fetch all notification types
export function useNotificationTypes() {
  return useQuery({
    queryKey: ["notificationTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_types")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data as NotificationType[];
    },
  });
}

// Fetch user's notification preferences
export function useNotificationPreferences() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notificationPreferences", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("notification_preferences")
        .select(`
          *,
          notification_type:notification_types(*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data as NotificationWithType[];
    },
    enabled: !!user,
  });
}

// Fetch user's global notification settings
export function useGlobalNotificationSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["globalNotificationSettings", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("notification_global_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as GlobalNotificationSettings | null;
    },
    enabled: !!user,
  });
}

// Update a single notification preference
export function useUpdateNotificationPreference() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notificationTypeId,
      inApp,
      email,
      push,
    }: {
      notificationTypeId: string;
      inApp?: boolean;
      email?: boolean;
      push?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if preference exists
      const { data: existing } = await supabase
        .from("notification_preferences")
        .select("id")
        .eq("user_id", user.id)
        .eq("notification_type_id", notificationTypeId)
        .maybeSingle();

      const updates: Record<string, boolean> = {};
      if (inApp !== undefined) updates.in_app_enabled = inApp;
      if (email !== undefined) updates.email_enabled = email;
      if (push !== undefined) updates.push_enabled = push;

      if (existing) {
        const { error } = await supabase
          .from("notification_preferences")
          .update(updates)
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: user.id,
            notification_type_id: notificationTypeId,
            in_app_enabled: inApp ?? true,
            email_enabled: email ?? false,
            push_enabled: push ?? false,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
    },
    onError: (error) => {
      toast.error("Failed to update preference: " + error.message);
    },
  });
}

// Update global notification settings
export function useUpdateGlobalSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<GlobalNotificationSettings>) => {
      if (!user) throw new Error("Not authenticated");

      // Check if settings exist
      const { data: existing } = await supabase
        .from("notification_global_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("notification_global_settings")
          .update({ ...settings, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_global_settings")
          .insert({
            user_id: user.id,
            ...settings,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalNotificationSettings"] });
      toast.success("Settings updated");
    },
    onError: (error) => {
      toast.error("Failed to update settings: " + error.message);
    },
  });
}

// Get merged preferences (user preferences or defaults)
export function useMergedNotificationPreferences() {
  const { data: types, isLoading: typesLoading } = useNotificationTypes();
  const { data: preferences, isLoading: prefsLoading } = useNotificationPreferences();

  const merged = types?.map((type) => {
    const userPref = preferences?.find(
      (p) => p.notification_type_id === type.id
    );

    return {
      type,
      inApp: userPref?.in_app_enabled ?? type.default_in_app,
      email: userPref?.email_enabled ?? type.default_email,
      push: userPref?.push_enabled ?? type.default_push,
      hasCustomPreference: !!userPref,
    };
  });

  return {
    preferences: merged || [],
    isLoading: typesLoading || prefsLoading,
  };
}

// Group preferences by category
export function useGroupedNotificationPreferences() {
  const { preferences, isLoading } = useMergedNotificationPreferences();

  const grouped = preferences.reduce((acc, pref) => {
    const category = pref.type.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(pref);
    return acc;
  }, {} as Record<string, typeof preferences>);

  return { grouped, isLoading };
}
