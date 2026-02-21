import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Reel {
  id: string;
  user_id: string;
  content: string;
  background_color: string;
  audio_track: string | null;
  reel_type: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  author?: {
    id: string;
    full_name: string | null;
    role: string | null;
    university: string | null;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const PAGE_SIZE = 10;

export function useReels() {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ["reels", user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("reels")
        .select("*")
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Fetch authors
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("id, full_name, role, university").in("id", userIds)
        : { data: [] };

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      // Fetch user's likes and bookmarks
      let likedIds = new Set<string>();
      let bookmarkedIds = new Set<string>();

      if (user && data && data.length > 0) {
        const reelIds = data.map(r => r.id);
        const [likesRes, bookmarksRes] = await Promise.all([
          supabase.from("reel_likes").select("reel_id").eq("user_id", user.id).in("reel_id", reelIds),
          supabase.from("reel_bookmarks").select("reel_id").eq("user_id", user.id).in("reel_id", reelIds),
        ]);
        likedIds = new Set((likesRes.data || []).map(l => l.reel_id));
        bookmarkedIds = new Set((bookmarksRes.data || []).map(b => b.reel_id));
      }

      const enriched: Reel[] = (data || []).map(r => ({
        ...r,
        author: profileMap.get(r.user_id) || { id: r.user_id, full_name: "Unknown", role: null, university: null },
        isLiked: likedIds.has(r.id),
        isBookmarked: bookmarkedIds.has(r.id),
      }));

      return enriched;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length : undefined;
    },
    enabled: !!user,
    staleTime: 30000,
  });
}

export function useCreateReel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string; background_color: string; audio_track?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: reel, error } = await supabase
        .from("reels")
        .insert({
          user_id: user.id,
          content: data.content,
          background_color: data.background_color,
          audio_track: data.audio_track || null,
        })
        .select()
        .single();

      if (error) throw error;
      return reel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      toast({ title: "Reel created!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useLikeReel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reelId, isLiked }: { reelId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        await supabase.from("reel_likes").delete().eq("reel_id", reelId).eq("user_id", user.id);
      } else {
        await supabase.from("reel_likes").upsert({ reel_id: reelId, user_id: user.id }, { onConflict: "reel_id,user_id" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
  });
}

export function useBookmarkReel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reelId, isBookmarked }: { reelId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      if (isBookmarked) {
        await supabase.from("reel_bookmarks").delete().eq("reel_id", reelId).eq("user_id", user.id);
      } else {
        await supabase.from("reel_bookmarks").upsert({ reel_id: reelId, user_id: user.id }, { onConflict: "reel_id,user_id" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reels"] });
    },
  });
}
