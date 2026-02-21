import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Post } from "./useFeed";

export function useExplorePosts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["explore-posts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, full_name, role, university)
        `)
        .eq("is_hidden", false)
        .eq("visibility", "public")
        .order("likes_count", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as Post[];
    },
    enabled: !!user,
    staleTime: 60000,
  });
}

export function useTrendingTags() {
  return useQuery({
    queryKey: ["trending-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("tags")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const tagCounts: Record<string, number> = {};
      (data || []).forEach(post => {
        (post.tags || []).forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));
    },
    staleTime: 120000,
  });
}

export function useSuggestedProfiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["suggested-profiles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, university")
        .neq("id", user?.id || "")
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 120000,
  });
}
