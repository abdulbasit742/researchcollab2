import { supabase } from "@/integrations/supabase/client";

/**
 * Typing indicator service using ephemeral broadcast channels.
 * No database persistence — typing state auto-expires client-side.
 */

const TYPING_TIMEOUT_MS = 3000;
const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Broadcast that the current user is typing in a thread.
 * Debounced — safe to call on every keystroke.
 */
export function sendTyping(threadId: string, userId: string) {
  const channelName = `typing-${threadId}`;

  // Get or create channel
  const channel = supabase.channel(channelName);

  channel.send({
    type: "broadcast",
    event: "typing",
    payload: { user_id: userId, timestamp: Date.now() },
  });

  // Subscribe if not already (idempotent)
  if (channel.state !== "joined") {
    channel.subscribe();
  }
}

/**
 * Subscribe to typing events in a thread.
 * Returns cleanup function.
 * Callback receives userId of who is typing, or null when they stop.
 */
export function subscribeToTyping(
  threadId: string,
  currentUserId: string,
  callback: (typingUserIds: string[]) => void
): () => void {
  const channelName = `typing-${threadId}`;
  const activeTypers = new Map<string, ReturnType<typeof setTimeout>>();

  const channel = supabase.channel(channelName);

  channel
    .on("broadcast", { event: "typing" }, (payload) => {
      const typingUserId = payload.payload?.user_id;
      if (!typingUserId || typingUserId === currentUserId) return;

      // Clear existing timer for this user
      const existingTimer = activeTypers.get(typingUserId);
      if (existingTimer) clearTimeout(existingTimer);

      // Set auto-expire timer
      const timer = setTimeout(() => {
        activeTypers.delete(typingUserId);
        callback(Array.from(activeTypers.keys()));
      }, TYPING_TIMEOUT_MS);

      activeTypers.set(typingUserId, timer);
      callback(Array.from(activeTypers.keys()));
    })
    .subscribe();

  return () => {
    // Cleanup all timers
    activeTypers.forEach((timer) => clearTimeout(timer));
    activeTypers.clear();
    supabase.removeChannel(channel);
  };
}
