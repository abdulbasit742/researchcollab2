import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TypingState {
  user_id: string;
  user_name: string;
  is_typing: boolean;
}

const TYPING_TIMEOUT = 2000; // 2 seconds

export function useTyping(threadId: string | undefined) {
  const { user, profile } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingState[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Broadcast typing status
  const broadcastTyping = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current || !user || !profile) return;

      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: user.id,
          user_name: profile.full_name || "User",
          is_typing: isTyping,
        },
      });
    },
    [user, profile]
  );

  // Handle typing start
  const startTyping = useCallback(() => {
    if (isTypingRef.current) {
      // Already typing, just reset the timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } else {
      isTypingRef.current = true;
      broadcastTyping(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      broadcastTyping(false);
    }, TYPING_TIMEOUT);
  }, [broadcastTyping]);

  // Handle typing stop
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      broadcastTyping(false);
    }
  }, [broadcastTyping]);

  useEffect(() => {
    if (!threadId || !user) return;

    const channel = supabase.channel(`typing-${threadId}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const typingState = payload as TypingState;

        // Ignore own typing events
        if (typingState.user_id === user.id) return;

        setTypingUsers((prev) => {
          if (typingState.is_typing) {
            // Add or update typing user
            const exists = prev.find((t) => t.user_id === typingState.user_id);
            if (exists) {
              return prev.map((t) =>
                t.user_id === typingState.user_id ? typingState : t
              );
            }
            return [...prev, typingState];
          } else {
            // Remove typing user
            return prev.filter((t) => t.user_id !== typingState.user_id);
          }
        });
      })
      .subscribe();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
      supabase.removeChannel(channel);
    };
  }, [threadId, user, stopTyping]);

  // Get typing indicator text
  const typingText = typingUsers.length > 0 
    ? `${typingUsers[0].user_name} is typing...`
    : null;

  return {
    typingUsers,
    typingText,
    startTyping,
    stopTyping,
  };
}
