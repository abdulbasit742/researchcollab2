import { supabase } from "@/integrations/supabase/client";

/**
 * Message service layer — wraps messaging operations with optimistic updates.
 * The hooks in useMessaging.ts already handle realtime subscriptions.
 * This service provides standalone functions for use outside hooks.
 */

export async function getThreads(userId: string) {
  const { data, error } = await supabase
    .from("message_threads")
    .select("*")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMessages(threadId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(
  threadId: string,
  _senderId: string,
  content: string
) {
  // Route through server-validated RPC — no direct DB insert
  const { data, error } = await supabase.rpc("send_message_secure" as any, {
    p_thread_id: threadId,
    p_body: content.trim(),
    p_type: "text",
    p_metadata: {},
  });

  if (error) throw error;
  return data;
}

export async function markThreadAsRead(threadId: string, userId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_id", threadId)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) throw error;
}

/**
 * Subscribe to read receipt updates in a thread.
 * Returns cleanup function.
 */
export function subscribeToReadUpdates(
  threadId: string,
  callback: (messageId: string, readAt: string) => void
): () => void {
  const channel = supabase
    .channel(`read-receipts-${threadId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => {
        const updated = payload.new as { id: string; read_at: string | null };
        if (updated.read_at) {
          callback(updated.id, updated.read_at);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
