import { supabase } from "@/integrations/supabase/client";

/**
 * Notification service — standalone notification creation.
 * The useNotifications hook handles UI-level queries with realtime.
 * This service is for programmatic use when creating notifications
 * from other service files (dealsService, escrowEngine, etc.).
 */

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  data?: Record<string, any>
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    message,
    data: data || {},
  });

  if (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

export async function createBulkNotifications(
  notifications: Array<{
    user_id: string;
    title: string;
    message: string;
    type: string;
    data?: Record<string, any>;
  }>
) {
  const { error } = await supabase.from("notifications").insert(
    notifications.map((n) => ({
      user_id: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data || {},
    }))
  );

  if (error) {
    console.error("Failed to create bulk notifications:", error);
    throw error;
  }
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) throw error;
}
