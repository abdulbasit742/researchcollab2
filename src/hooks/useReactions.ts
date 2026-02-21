import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactionType } from "@/components/feed/ReactionPicker";

interface PostReactionsData {
  total: number;
  summary: Record<string, number>;
  userReaction: ReactionType | null;
}

export function usePostReactions(postId: string) {
  const { user } = useAuth();

  return useQuery<PostReactionsData>({
    queryKey: ["post-reactions", postId, user?.id],
    queryFn: async () => {
      const { data: reactions, error } = await supabase
        .from("post_reactions")
        .select("reaction_type, user_id")
        .eq("post_id", postId);

      if (error) throw error;

      const summary: Record<string, number> = {};
      let userReaction: ReactionType | null = null;

      (reactions || []).forEach((r: any) => {
        summary[r.reaction_type] = (summary[r.reaction_type] || 0) + 1;
        if (r.user_id === user?.id) {
          userReaction = r.reaction_type as ReactionType;
        }
      });

      return {
        total: reactions?.length || 0,
        summary,
        userReaction,
      };
    },
    enabled: !!postId,
    staleTime: 15000,
  });
}

export function useReactToPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: string; reactionType: ReactionType | null }) => {
      if (!user) throw new Error("Not authenticated");

      if (reactionType === null) {
        // Remove reaction
        const { error } = await supabase
          .from("post_reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Upsert reaction
        const { error } = await supabase
          .from("post_reactions")
          .upsert(
            { post_id: postId, user_id: user.id, reaction_type: reactionType },
            { onConflict: "post_id,user_id" }
          );
        if (error) throw error;
      }
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["post-reactions", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
