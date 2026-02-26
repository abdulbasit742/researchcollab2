import { supabase } from "@/integrations/supabase/client";

/**
 * Online presence service.
 * Tracks user online/offline status via the online_presence table.
 */

let presenceCleanup: (() => void) | null = null;

/**
 * Start tracking presence for the current user.
 * Call once on login / app mount.
 */
export async function startPresenceTracking(userId: string) {
  // Upsert presence to online
  await supabase
    .from("online_presence")
    .upsert(
      {
        user_id: userId,
        status: "online",
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  // Heartbeat every 60s to keep alive
  const heartbeat = setInterval(async () => {
    await supabase
      .from("online_presence")
      .update({
        status: "online",
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }, 60_000);

  // Handle tab close / navigate away
  const handleBeforeUnload = () => {
    // Use sendBeacon for reliable offline signal
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/online_presence?user_id=eq.${userId}`;
    const body = JSON.stringify({
      status: "offline",
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    navigator.sendBeacon?.(
      url,
      new Blob([body], { type: "application/json" })
    );
  };

  // Handle visibility change (tab switch → away)
  const handleVisibilityChange = async () => {
    const newStatus = document.hidden ? "away" : "online";
    await supabase
      .from("online_presence")
      .update({
        status: newStatus,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Store cleanup
  presenceCleanup = () => {
    clearInterval(heartbeat);
    window.removeEventListener("beforeunload", handleBeforeUnload);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

/**
 * Stop presence tracking and set offline.
 * Call on logout.
 */
export async function stopPresenceTracking(userId: string) {
  presenceCleanup?.();
  presenceCleanup = null;

  await supabase
    .from("online_presence")
    .update({
      status: "offline",
      last_seen: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

/**
 * Get online status for a list of user IDs.
 */
export async function getPresenceForUsers(
  userIds: string[]
): Promise<Record<string, { status: string; last_seen: string }>> {
  if (userIds.length === 0) return {};

  const { data, error } = await supabase
    .from("online_presence")
    .select("user_id, status, last_seen")
    .in("user_id", userIds);

  if (error) {
    console.error("getPresenceForUsers error:", error);
    return {};
  }

  const result: Record<string, { status: string; last_seen: string }> = {};
  data?.forEach((row) => {
    result[row.user_id] = {
      status: row.status,
      last_seen: row.last_seen,
    };
  });
  return result;
}

/**
 * Subscribe to presence changes for specific users.
 * Returns cleanup function.
 */
export function subscribeToPresence(
  userIds: string[],
  callback: (userId: string, status: string) => void
): () => void {
  if (userIds.length === 0) return () => {};

  const channel = supabase
    .channel("presence-updates")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "online_presence",
      },
      (payload) => {
        const row = payload.new as { user_id: string; status: string };
        if (userIds.includes(row.user_id)) {
          callback(row.user_id, row.status);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
