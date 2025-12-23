import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MessageThread {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
  last_message_at: string;
  last_message_text: string | null;
  other_user?: {
    id: string;
    full_name: string | null;
    role: string | null;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export function useThreads() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchThreads = useCallback(async () => {
    if (!user) {
      setThreads([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: threadsData, error: threadsError } = await supabase
        .from("message_threads")
        .select("*")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (threadsError) throw threadsError;

      if (!threadsData || threadsData.length === 0) {
        setThreads([]);
        setIsLoading(false);
        return;
      }

      // Get other user IDs
      const otherUserIds = threadsData.map((t) =>
        t.user_a === user.id ? t.user_b : t.user_a
      );

      // Fetch profiles for other users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .in("id", otherUserIds);

      // Fetch unread counts per thread
      const { data: unreadData } = await supabase
        .from("messages")
        .select("thread_id")
        .in("thread_id", threadsData.map((t) => t.id))
        .neq("sender_id", user.id)
        .is("read_at", null);

      const unreadCounts: Record<string, number> = {};
      unreadData?.forEach((m) => {
        unreadCounts[m.thread_id] = (unreadCounts[m.thread_id] || 0) + 1;
      });

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const enrichedThreads = threadsData.map((thread) => {
        const otherUserId = thread.user_a === user.id ? thread.user_b : thread.user_a;
        return {
          ...thread,
          other_user: profileMap.get(otherUserId) || {
            id: otherUserId,
            full_name: null,
            role: null,
          },
          unread_count: unreadCounts[thread.id] || 0,
        };
      });

      setThreads(enrichedThreads);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Realtime subscription for thread updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("threads-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_threads",
        },
        () => {
          fetchThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchThreads]);

  return { threads, isLoading, error, refetch: fetchThreads };
}

export function useMessages(threadId: string | undefined) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!threadId || !user) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      setMessages(data || []);

      // Mark unread messages as read
      const unreadIds = (data || [])
        .filter((m) => m.sender_id !== user.id && !m.read_at)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [threadId, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!threadId || !user) return;

    const channel = supabase
      .channel(`messages-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);

          // Mark as read if not sender
          if (newMessage.sender_id !== user.id) {
            await supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, user]);

  return { messages, isLoading, error, refetch: fetchMessages };
}

export function useSendMessage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (threadId: string, body: string) => {
    if (!user || !body.trim()) return null;

    setIsSending(true);
    try {
      const { data: message, error: insertError } = await supabase
        .from("messages")
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          body: body.trim(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update thread metadata
      await supabase
        .from("message_threads")
        .update({
          last_message_at: new Date().toISOString(),
          last_message_text: body.trim().substring(0, 100),
        })
        .eq("id", threadId);

      return message;
    } catch (err) {
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSending(false);
    }
  };

  return { sendMessage, isSending };
}

export function useStartConversation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const startConversation = async (targetUserId: string) => {
    if (!user) {
      // Store return URL and redirect to auth
      sessionStorage.setItem("returnTo", `/messages`);
      navigate("/auth");
      return;
    }

    if (targetUserId === user.id) {
      toast({
        title: "Cannot message yourself",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if thread exists
      const { data: existing } = await supabase
        .from("message_threads")
        .select("id")
        .or(
          `and(user_a.eq.${user.id},user_b.eq.${targetUserId}),and(user_a.eq.${targetUserId},user_b.eq.${user.id})`
        )
        .maybeSingle();

      if (existing) {
        navigate(`/messages/${existing.id}`);
        return;
      }

      // Create new thread
      const { data: newThread, error } = await supabase
        .from("message_threads")
        .insert({
          user_a: user.id,
          user_b: targetUserId,
        })
        .select()
        .single();

      if (error) throw error;
      navigate(`/messages/${newThread.id}`);
    } catch (err) {
      toast({
        title: "Failed to start conversation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return { startConversation };
}

export function useUnreadCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      // First get user's thread IDs
      const { data: threads } = await supabase
        .from("message_threads")
        .select("id")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

      if (!threads || threads.length === 0) {
        setUnreadCount(0);
        return;
      }

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("thread_id", threads.map((t) => t.id))
        .neq("sender_id", user.id)
        .is("read_at", null);

      setUnreadCount(count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("unread-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount]);

  return unreadCount;
}
