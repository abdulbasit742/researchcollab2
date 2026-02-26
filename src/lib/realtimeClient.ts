import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

const activeChannels = new Map<string, RealtimeChannel>();

/**
 * Subscribe to realtime changes on a table with deduplication.
 * Returns a cleanup function.
 */
export function subscribeToTable(
  channelName: string,
  table: string,
  filter: string | undefined,
  callback: (payload: any) => void,
  event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*"
): () => void {
  // Prevent duplicate subscriptions
  if (activeChannels.has(channelName)) {
    supabase.removeChannel(activeChannels.get(channelName)!);
    activeChannels.delete(channelName);
  }

  const channelConfig: any = {
    event,
    schema: "public",
    table,
    ...(filter ? { filter } : {}),
  };

  const channel = supabase
    .channel(channelName)
    .on("postgres_changes" as any, channelConfig, callback)
    .subscribe();

  activeChannels.set(channelName, channel);

  return () => {
    supabase.removeChannel(channel);
    activeChannels.delete(channelName);
  };
}

/**
 * Remove a specific channel by name
 */
export function unsubscribe(channelName: string) {
  const channel = activeChannels.get(channelName);
  if (channel) {
    supabase.removeChannel(channel);
    activeChannels.delete(channelName);
  }
}

/**
 * Remove all active channels (cleanup on logout)
 */
export function unsubscribeAll() {
  activeChannels.forEach((channel) => {
    supabase.removeChannel(channel);
  });
  activeChannels.clear();
}

/**
 * Get count of active subscriptions (for debugging)
 */
export function getActiveChannelCount(): number {
  return activeChannels.size;
}
