import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Story {
  id: string;
  user_id: string;
  content: string;
  background_color: string;
  story_type: string;
  created_at: string;
  expires_at: string;
  author?: {
    id: string;
    full_name: string | null;
  };
  views_count?: number;
  likes_count?: number;
  has_viewed?: boolean;
  has_liked?: boolean;
}

export interface StoryGroup {
  userId: string;
  userName: string;
  stories: Story[];
  hasUnviewed: boolean;
}

export function useStories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["stories", user?.id],
    queryFn: async () => {
      // Fetch stories
      const { data: stories, error } = await supabase
        .from("stories")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author profiles separately
      const userIds = [...new Set((stories || []).map(s => s.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
        : { data: [] };
      
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      // Get view/like counts and user status
      if (stories && stories.length > 0 && user) {
        const storyIds = stories.map(s => s.id);
        
        const [viewsResult, likesResult, userViewsResult] = await Promise.all([
          supabase.from("story_views").select("story_id").in("story_id", storyIds),
          supabase.from("story_likes").select("story_id").in("story_id", storyIds),
          supabase.from("story_views").select("story_id").eq("viewer_id", user.id).in("story_id", storyIds),
        ]);

        const viewCounts: Record<string, number> = {};
        const likeCounts: Record<string, number> = {};
        const viewedIds = new Set(userViewsResult.data?.map(v => v.story_id) || []);

        (viewsResult.data || []).forEach(v => {
          viewCounts[v.story_id] = (viewCounts[v.story_id] || 0) + 1;
        });
        (likesResult.data || []).forEach(l => {
          likeCounts[l.story_id] = (likeCounts[l.story_id] || 0) + 1;
        });

        const enriched: Story[] = stories.map(s => ({
          ...s,
          author: profileMap.get(s.user_id) || { id: s.user_id, full_name: "Unknown" },
          views_count: viewCounts[s.id] || 0,
          likes_count: likeCounts[s.id] || 0,
          has_viewed: viewedIds.has(s.id),
        }));

        // Group by user
        const groups = new Map<string, StoryGroup>();
        enriched.forEach(story => {
          const existing = groups.get(story.user_id);
          if (existing) {
            existing.stories.push(story);
            if (!story.has_viewed) existing.hasUnviewed = true;
          } else {
            groups.set(story.user_id, {
              userId: story.user_id,
              userName: story.author?.full_name || "Unknown",
              stories: [story],
              hasUnviewed: !story.has_viewed,
            });
          }
        });

        return Array.from(groups.values());
      }

      return [] as StoryGroup[];
    },
    enabled: !!user,
    staleTime: 30000,
  });
}

export function useCreateStory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string; background_color: string; story_type?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: story, error } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          content: data.content,
          background_color: data.background_color,
          story_type: data.story_type || "text",
        })
        .select()
        .single();

      if (error) throw error;
      return story;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast({ title: "Story created!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useViewStory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      if (!user) return;
      await supabase
        .from("story_views")
        .upsert({ story_id: storyId, viewer_id: user.id }, { onConflict: "story_id,viewer_id" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}

export function useLikeStory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storyId, isLiked }: { storyId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        await supabase.from("story_likes").delete().eq("story_id", storyId).eq("user_id", user.id);
      } else {
        await supabase.from("story_likes").upsert({ story_id: storyId, user_id: user.id }, { onConflict: "story_id,user_id" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });
}
