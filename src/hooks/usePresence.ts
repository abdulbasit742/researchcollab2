import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PresenceState {
  user_id: string;
  online_at: string;
  status: "online" | "offline";
}

const PRESENCE_CHANNEL = "global-presence";
const OFFLINE_TIMEOUT = 30000; // 30 seconds of inactivity = offline

export function usePresence() {
  const { user } = useAuth();
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceState>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track user's own presence
  const updatePresence = useCallback(async () => {
    if (!user || !channelRef.current) return;

    await channelRef.current.track({
      user_id: user.id,
      online_at: new Date().toISOString(),
      status: "online" as const,
    });
  }, [user]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }

    updatePresence();

    activityTimeoutRef.current = setTimeout(() => {
      // User is idle, but still connected
    }, OFFLINE_TIMEOUT);
  }, [updatePresence]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const newPresenceMap: Record<string, PresenceState> = {};

        Object.entries(state).forEach(([key, presences]) => {
          if (presences.length > 0) {
            const p = presences[0] as unknown as PresenceState;
            if (p.user_id) {
              newPresenceMap[key] = p;
            }
          }
        });

        setPresenceMap(newPresenceMap);
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (newPresences.length > 0) {
          const p = newPresences[0] as unknown as PresenceState;
          if (p.user_id) {
            setPresenceMap((prev) => ({
              ...prev,
              [key]: p,
            }));
          }
        }
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setPresenceMap((prev) => {
          const newMap = { ...prev };
          if (newMap[key]) {
            newMap[key] = {
              ...newMap[key],
              status: "offline",
              online_at: new Date().toISOString(),
            };
          }
          return newMap;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await updatePresence();
        }
      });

    // Track user activity
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Handle visibility change
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        updatePresence();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Handle before unload
    const handleUnload = () => {
      if (channelRef.current) {
        channelRef.current.untrack();
      }
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);

      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, updatePresence, handleActivity]);

  const isOnline = useCallback(
    (userId: string) => {
      return presenceMap[userId]?.status === "online";
    },
    [presenceMap]
  );

  const getLastSeen = useCallback(
    (userId: string) => {
      return presenceMap[userId]?.online_at || null;
    },
    [presenceMap]
  );

  return { presenceMap, isOnline, getLastSeen };
}

export function useUserPresence(userId: string | undefined) {
  const { presenceMap, isOnline, getLastSeen } = usePresence();

  if (!userId) {
    return { isOnline: false, lastSeen: null };
  }

  return {
    isOnline: isOnline(userId),
    lastSeen: getLastSeen(userId),
  };
}
