import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

 // Ambient notification types for the intelligence system
 export type AmbientNotificationType = 
   | "ambient_opportunity"    // High-match opportunity alerts
   | "ambient_relationship"   // Connection decay warnings  
   | "ambient_deal"           // Deal health risk notifications
   | "ambient_insight";       // General proactive insights
 
 export interface AmbientNotificationData {
   priority: "low" | "medium" | "high" | "urgent";
   category: AmbientNotificationType;
   entityId?: string;
   entityType?: "opportunity" | "connection" | "deal" | "insight";
   score?: number;
   actionUrl?: string;
 }
 
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifs = data as Notification[];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription
    if (user) {
      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

   // Get high-priority ambient notifications
   const getAmbientNotifications = () => {
     return notifications.filter(n => 
       n.type.startsWith("ambient_") && 
       (n.data as AmbientNotificationData)?.priority === "high" ||
       (n.data as AmbientNotificationData)?.priority === "urgent"
     );
   };
 
   // Get notifications grouped by priority
   const getNotificationsByPriority = () => {
     const grouped = {
       urgent: [] as Notification[],
       high: [] as Notification[],
       medium: [] as Notification[],
       low: [] as Notification[],
     };
     
     notifications.forEach(n => {
       const priority = (n.data as AmbientNotificationData)?.priority || "low";
       grouped[priority].push(n);
     });
     
     return grouped;
   };
 
  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
     getAmbientNotifications,
     getNotificationsByPriority,
  };
}

export function useCreateNotification() {
  const createNotification = async (
    userId: string,
    type: string,
    title: string,
    message?: string,
     data?: Record<string, any>
  ) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data: data || {},
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error("Error creating notification:", err);
      return { success: false, error: err.message };
    }
  };

  return { createNotification };
}
