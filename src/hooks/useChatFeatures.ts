import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useMessaging";

// Reaction types
const REACTION_EMOJIS = ['👍', '❤️', '🎯', '📌', '❗'] as const;
type ReactionEmoji = typeof REACTION_EMOJIS[number];

interface Reaction {
  user_id: string;
  emoji: ReactionEmoji;
}

// Hook for message reactions
export function useReactions() {
  const { user } = useAuth();
  const { toast } = useToast();

  const toggleReaction = useCallback(async (messageId: string, emoji: ReactionEmoji, currentReactions: Reaction[]) => {
    if (!user) return;

    const existingIndex = currentReactions.findIndex(
      r => r.user_id === user.id && r.emoji === emoji
    );

    let newReactions: Reaction[];
    if (existingIndex >= 0) {
      // Remove reaction
      newReactions = currentReactions.filter((_, i) => i !== existingIndex);
    } else {
      // Add reaction
      newReactions = [...currentReactions, { user_id: user.id, emoji }];
    }

    const { error } = await supabase
      .from('messages')
      .update({ reactions: JSON.parse(JSON.stringify(newReactions)) })
      .eq('id', messageId);

    if (error) {
      toast({ title: "Failed to update reaction", variant: "destructive" });
    }
  }, [user, toast]);

  return { toggleReaction, REACTION_EMOJIS };
}

// Hook for pinned messages
export function usePinnedMessages(threadId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pinnedMessages, setPinnedMessages] = useState<Array<{ id: string; message_id: string; is_global: boolean }>>([]);

  const fetchPins = useCallback(async () => {
    if (!threadId) return;

    const { data, error } = await supabase
      .from('pinned_messages')
      .select('id, message_id, is_global')
      .eq('thread_id', threadId);

    if (!error && data) {
      setPinnedMessages(data);
    }
  }, [threadId]);

  const togglePin = useCallback(async (messageId: string, isGlobal = false) => {
    if (!user || !threadId) return;

    const existing = pinnedMessages.find(p => p.message_id === messageId);
    
    if (existing) {
      const { error } = await supabase
        .from('pinned_messages')
        .delete()
        .eq('id', existing.id);

      if (!error) {
        setPinnedMessages(prev => prev.filter(p => p.id !== existing.id));
        toast({ title: "Message unpinned" });
      }
    } else {
      const { data, error } = await supabase
        .from('pinned_messages')
        .insert({
          message_id: messageId,
          thread_id: threadId,
          pinned_by: user.id,
          is_global: isGlobal
        })
        .select()
        .single();

      if (!error && data) {
        setPinnedMessages(prev => [...prev, data]);
        toast({ title: "Message pinned" });
      }
    }
  }, [user, threadId, pinnedMessages, toast]);

  return { pinnedMessages, fetchPins, togglePin };
}

// Hook for starring threads
export function useStarThread() {
  const { user } = useAuth();
  const { toast } = useToast();

  const toggleStar = useCallback(async (
    threadId: string, 
    isUserA: boolean, 
    currentlyStarred: boolean
  ) => {
    if (!user) return;

    const field = isUserA ? 'starred_by_user_a' : 'starred_by_user_b';
    
    const { error } = await supabase
      .from('message_threads')
      .update({ [field]: !currentlyStarred })
      .eq('id', threadId);

    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
      return false;
    }

    toast({ title: currentlyStarred ? "Unstarred" : "Starred ⭐" });
    return true;
  }, [user, toast]);

  return { toggleStar };
}

// Hook for soft delete messages
export function useDeleteMessage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const deleteMessage = useCallback(async (message: Message) => {
    if (!user || message.sender_id !== user.id) {
      toast({ title: "Cannot delete this message", variant: "destructive" });
      return false;
    }

    // Don't allow deleting offers or system messages
    const msgType = message.type || 'text';
    if (msgType !== 'text' && msgType !== 'attachment') {
      toast({ title: "Cannot delete this type of message", variant: "destructive" });
      return false;
    }

    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', message.id);

    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
      return false;
    }

    toast({ title: "Message deleted" });
    return true;
  }, [user, toast]);

  return { deleteMessage };
}

// Hook for thread notes
export function useThreadNotes(threadId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!user || !threadId) return;

    const { data } = await supabase
      .from('thread_notes')
      .select('content')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setNotes(data.content || "");
    }
  }, [user, threadId]);

  const saveNotes = useCallback(async (content: string) => {
    if (!user || !threadId) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('thread_notes')
      .upsert({
        thread_id: threadId,
        user_id: user.id,
        content,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'thread_id,user_id'
      });

    setIsSaving(false);
    
    if (error) {
      toast({ title: "Failed to save notes", variant: "destructive" });
    }
  }, [user, threadId, toast]);

  return { notes, setNotes, fetchNotes, saveNotes, isSaving };
}

export { REACTION_EMOJIS };
export type { Reaction, ReactionEmoji };
