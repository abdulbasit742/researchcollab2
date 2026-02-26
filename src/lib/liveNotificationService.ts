import { supabase } from "@/integrations/supabase/client";

/**
 * Live notification service — standalone functions.
 * The useNotifications hook already has realtime subscriptions.
 * This provides additional utility for programmatic use.
 */

export function subscribeToNotifications(
  userId: string,
  callback: (notification: any) => void
): () => void {
  const channel = supabase
    .channel(`live-notifs-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message?: string,
  data?: Record<string, any>
) {
  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      message: message || null,
      data: data || {},
    });

  if (error) throw error;
}
