import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { MessageThread, Message } from "@/hooks/useMessaging";

// Debounce hook for search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  });

  return debouncedValue;
}

// Hook for filtering threads in inbox
export function useThreadSearch(threads: MessageThread[], searchQuery: string) {
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;

    const query = searchQuery.toLowerCase().trim();
    return threads.filter((thread) => {
      const name = thread.other_user?.full_name?.toLowerCase() || "";
      const lastMessage = thread.last_message_text?.toLowerCase() || "";
      return name.includes(query) || lastMessage.includes(query);
    });
  }, [threads, searchQuery]);

  return filteredThreads;
}

// Hook for searching messages within a thread
export function useMessageSearch(messages: Message[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);

  const matches = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    return messages
      .map((msg, index) => ({
        message: msg,
        originalIndex: index,
        matches: msg.body.toLowerCase().includes(query),
      }))
      .filter((item) => item.matches);
  }, [messages, searchQuery]);

  const goToNext = useCallback(() => {
    if (matches.length === 0) return null;
    const newIndex = (matchIndex + 1) % matches.length;
    setMatchIndex(newIndex);
    return matches[newIndex];
  }, [matches, matchIndex]);

  const goToPrev = useCallback(() => {
    if (matches.length === 0) return null;
    const newIndex = (matchIndex - 1 + matches.length) % matches.length;
    setMatchIndex(newIndex);
    return matches[newIndex];
  }, [matches, matchIndex]);

  const currentMatch = matches.length > 0 ? matches[matchIndex] : null;

  const reset = useCallback(() => {
    setSearchQuery("");
    setMatchIndex(0);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    matches,
    matchIndex,
    currentMatch,
    goToNext,
    goToPrev,
    reset,
    totalMatches: matches.length,
  };
}

// Hook for archive/unarchive functionality
export function useThreadArchive() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const archiveThread = useCallback(
    async (threadId: string, isUserA: boolean) => {
      if (!user) return false;

      setIsLoading(true);
      try {
        const updateField = isUserA ? "archived_by_user_a" : "archived_by_user_b";
        const { error } = await supabase
          .from("message_threads")
          .update({ [updateField]: true })
          .eq("id", threadId);

        if (error) throw error;

        toast({ title: "Conversation archived" });
        return true;
      } catch (err) {
        toast({
          title: "Failed to archive",
          description: "Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, toast]
  );

  const unarchiveThread = useCallback(
    async (threadId: string, isUserA: boolean) => {
      if (!user) return false;

      setIsLoading(true);
      try {
        const updateField = isUserA ? "archived_by_user_a" : "archived_by_user_b";
        const { error } = await supabase
          .from("message_threads")
          .update({ [updateField]: false })
          .eq("id", threadId);

        if (error) throw error;

        toast({ title: "Conversation restored" });
        return true;
      } catch (err) {
        toast({
          title: "Failed to restore",
          description: "Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, toast]
  );

  return { archiveThread, unarchiveThread, isLoading };
}

// Hook for mute functionality
export function useThreadMute() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const muteThread = useCallback(
    async (threadId: string, isUserA: boolean, duration: "1h" | "24h" | "7d" | "forever") => {
      if (!user) return false;

      setIsLoading(true);
      try {
        let muteUntil: string | null = null;
        const now = new Date();

        switch (duration) {
          case "1h":
            muteUntil = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
            break;
          case "24h":
            muteUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            break;
          case "7d":
            muteUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case "forever":
            muteUntil = new Date("2099-12-31").toISOString();
            break;
        }

        const updateField = isUserA ? "muted_by_user_a_until" : "muted_by_user_b_until";
        const { error } = await supabase
          .from("message_threads")
          .update({ [updateField]: muteUntil })
          .eq("id", threadId);

        if (error) throw error;

        toast({ title: "Notifications muted" });
        return true;
      } catch (err) {
        toast({
          title: "Failed to mute",
          description: "Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, toast]
  );

  const unmuteThread = useCallback(
    async (threadId: string, isUserA: boolean) => {
      if (!user) return false;

      setIsLoading(true);
      try {
        const updateField = isUserA ? "muted_by_user_a_until" : "muted_by_user_b_until";
        const { error } = await supabase
          .from("message_threads")
          .update({ [updateField]: null })
          .eq("id", threadId);

        if (error) throw error;

        toast({ title: "Notifications unmuted" });
        return true;
      } catch (err) {
        toast({
          title: "Failed to unmute",
          description: "Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, toast]
  );

  return { muteThread, unmuteThread, isLoading };
}

// Hook for block functionality
export function useUserBlock() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const blockUser = useCallback(
    async (blockedId: string) => {
      if (!user || user.id === blockedId) return false;

      setIsLoading(true);
      try {
        const { error } = await supabase.from("user_blocks").insert({
          blocker_id: user.id,
          blocked_id: blockedId,
        });

        if (error) throw error;

        toast({ title: "User blocked", description: "They can no longer message you." });
        return true;
      } catch (err: any) {
        if (err.code === "23505") {
          toast({ title: "Already blocked" });
          return true;
        }
        toast({
          title: "Failed to block",
          description: "Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, toast]
  );

  const unblockUser = useCallback(
    async (blockedId: string) => {
      if (!user) return false;

      setIsLoading(true);
      try {
        const { error } = await supabase
          .from("user_blocks")
          .delete()
          .eq("blocker_id", user.id)
          .eq("blocked_id", blockedId);

        if (error) throw error;

        toast({ title: "User unblocked" });
        return true;
      } catch (err) {
        toast({
          title: "Failed to unblock",
          description: "Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, toast]
  );

  const isBlocked = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!user) return false;

      const { data } = await supabase
        .from("user_blocks")
        .select("id")
        .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${userId}),and(blocker_id.eq.${userId},blocked_id.eq.${user.id})`)
        .maybeSingle();

      return !!data;
    },
    [user]
  );

  return { blockUser, unblockUser, isBlocked, isLoading };
}

// Hook for reporting
export function useReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const reportUser = useCallback(
    async (data: {
      reportedUserId: string;
      threadId?: string;
      messageId?: string;
      reason: "spam" | "harassment" | "fake" | "offensive" | "other";
      description?: string;
    }) => {
      if (!user || user.id === data.reportedUserId) return false;

      setIsLoading(true);
      try {
        const { error } = await supabase.from("reports").insert({
          reporter_id: user.id,
          reported_user_id: data.reportedUserId,
          thread_id: data.threadId || null,
          message_id: data.messageId || null,
          reason: data.reason,
          description: data.description || null,
        });

        if (error) throw error;

        toast({
          title: "Report submitted",
          description: "Our team will review this shortly.",
        });
        return true;
      } catch (err) {
        toast({
          title: "Failed to submit report",
          description: "Please try again.",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, toast]
  );

  return { reportUser, isLoading };
}
