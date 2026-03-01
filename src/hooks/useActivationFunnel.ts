import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const ACTIVATION_EVENTS = [
  "signup_completed",
  "profile_completed",
  "first_project_created",
  "first_project_joined",
  "first_milestone_created",
  "first_submission_made",
  "first_review_completed",
  "first_message_sent",
  "first_artifact_uploaded",
] as const;

type ActivationEvent = typeof ACTIVATION_EVENTS[number];

export function useActivationFunnel() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["activation-funnel", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("activation_funnel_events")
        .select("event_type, occurred_at")
        .eq("user_id", user.id);
      return (data ?? []) as { event_type: string; occurred_at: string }[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const trackEvent = useMutation({
    mutationFn: async (eventType: ActivationEvent) => {
      if (!user?.id) return;
      const exists = events.some((e) => e.event_type === eventType);
      if (exists) return;
      await supabase.from("activation_funnel_events").upsert(
        { user_id: user.id, event_type: eventType },
        { onConflict: "user_id,event_type" }
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["activation-funnel", user?.id] }),
  });

  // Auto-track signup on mount if user exists
  useEffect(() => {
    if (user?.id && events.length === 0 && !isLoading) {
      trackEvent.mutate("signup_completed");
    }
  }, [user?.id, events.length, isLoading]);

  // Auto-track profile completion
  useEffect(() => {
    if (profile?.full_name && profile?.university && profile?.department) {
      const already = events.some((e) => e.event_type === "profile_completed");
      if (!already) trackEvent.mutate("profile_completed");
    }
  }, [profile, events]);

  const completedSet = new Set(events.map((e) => e.event_type));
  const completedCount = ACTIVATION_EVENTS.filter((e) => completedSet.has(e)).length;
  const progress = Math.round((completedCount / ACTIVATION_EVENTS.length) * 100);

  const stage = completedCount <= 1
    ? "new"
    : completedCount <= 3
    ? "exploring"
    : completedCount <= 6
    ? "engaged"
    : completedCount <= 8
    ? "active"
    : "power_user";

  return {
    events: ACTIVATION_EVENTS.map((e) => ({
      type: e,
      completed: completedSet.has(e),
      occurredAt: events.find((ev) => ev.event_type === e)?.occurred_at,
    })),
    completedCount,
    totalCount: ACTIVATION_EVENTS.length,
    progress,
    stage,
    trackEvent: trackEvent.mutate,
    isLoading,
  };
}
