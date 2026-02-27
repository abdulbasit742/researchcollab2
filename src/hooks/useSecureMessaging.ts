/**
 * useSecureMessaging — Entity-linked, server-validated messaging with realtime.
 * All messages go through send_message_secure RPC. No direct DB inserts.
 */

import { useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ============================================================
// TYPES
// ============================================================

export interface ConversationThread {
  id: string;
  user_a: string;
  user_b: string;
  context_entity_type: string | null;
  context_entity_id: string | null;
  last_message_at: string;
  last_message_text: string | null;
  archived_by_user_a: boolean | null;
  archived_by_user_b: boolean | null;
  priority: string | null;
  is_auditable: boolean | null;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  type: string;
  created_at: string;
  deleted_at: string | null;
  read_at: string | null;
  metadata: Record<string, any> | null;
  attachment: Record<string, any> | null;
}

export interface ConversationParticipant {
  id: string;
  thread_id: string;
  user_id: string;
  role_in_context: string;
  joined_at: string;
  left_at: string | null;
}

// ============================================================
// CONVERSATIONS LIST
// ============================================================

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("message_threads")
        .select("*")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ConversationThread[];
    },
    enabled: !!user,
  });
}

export function useEntityConversation(entityType?: string, entityId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversation-entity", entityType, entityId],
    queryFn: async () => {
      if (!user || !entityType || !entityId) return null;
      const { data, error } = await supabase
        .from("message_threads")
        .select("*")
        .eq("context_entity_type", entityType)
        .eq("context_entity_id", entityId)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .maybeSingle();
      if (error) throw error;
      return data as ConversationThread | null;
    },
    enabled: !!user && !!entityType && !!entityId,
  });
}

// ============================================================
// MESSAGES (paginated)
// ============================================================

export function useConversationMessages(threadId?: string, limit = 50) {
  return useQuery({
    queryKey: ["messages", threadId, limit],
    queryFn: async () => {
      if (!threadId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("thread_id", threadId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Message[];
    },
    enabled: !!threadId,
  });
}

// ============================================================
// SEND MESSAGE (server-validated RPC)
// ============================================================

export function useSendMessage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      threadId,
      body,
      type = "text",
      metadata = {},
    }: {
      threadId: string;
      body: string;
      type?: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.rpc("send_message_secure" as any, {
        p_thread_id: threadId,
        p_body: body,
        p_type: type,
        p_metadata: metadata,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.threadId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: Error) => {
      toast({ title: "Message failed", description: err.message, variant: "destructive" });
    },
  });
}

// ============================================================
// PARTICIPANTS
// ============================================================

export function useConversationParticipants(threadId?: string) {
  return useQuery({
    queryKey: ["conversation-participants", threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const { data, error } = await (supabase as any)
        .from("conversation_participants")
        .select("*")
        .eq("thread_id", threadId)
        .is("left_at", null);
      if (error) throw error;
      return (data ?? []) as ConversationParticipant[];
    },
    enabled: !!threadId,
  });
}

// ============================================================
// READ RECEIPTS
// ============================================================

export function useMarkMessagesRead(threadId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user || !threadId) return;
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("thread_id", threadId)
        .neq("sender_id", user.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", threadId] });
    },
  });
}

// ============================================================
// REALTIME SUBSCRIPTION
// ============================================================

export function useMessageRealtime(threadId?: string) {
  const qc = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!threadId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`msgs-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["messages", threadId] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["messages", threadId] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [threadId, qc]);
}

// ============================================================
// SOFT DELETE (with audit)
// ============================================================

export function useSoftDeleteMessage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      toast({ title: "Message removed" });
    },
    onError: (err: Error) => {
      toast({ title: "Cannot delete", description: err.message, variant: "destructive" });
    },
  });
}

// ============================================================
// NOTIFICATION REALTIME
// ============================================================

export function useNotificationRealtime() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`notifs-rt-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user, qc]);
}
