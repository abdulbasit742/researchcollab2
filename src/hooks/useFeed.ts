import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type PostType = 'text' | 'research_update' | 'announcement' | 'publication' | 'organization_post' | 'milestone' | 'collaboration_request';
export type PostVisibility = 'public' | 'connections' | 'followers' | 'organization' | 'private';

export interface Post {
  id: string;
  author_id: string;
  content: string;
  post_type: PostType;
  visibility: PostVisibility;
  organization_id: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  media_urls: string[];
  tags: string[];
  mentioned_users: string[];
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  is_edited: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
    role: string | null;
    university: string | null;
  };
  has_liked?: boolean;
  has_bookmarked?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  likes_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
  };
  replies?: PostComment[];
  has_liked?: boolean;
}

export interface FeedEvent {
  id: string;
  actor_id: string;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  title: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  visibility: PostVisibility;
  created_at: string;
  actor?: {
    id: string;
    full_name: string | null;
  };
}

const PAGE_SIZE = 10;

export function useFeed(sortBy: 'recent' | 'relevant' = 'recent') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchFeedPage = async ({ pageParam = 0 }) => {
    if (!user) return { posts: [], nextPage: null };

    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Fetch posts with author info (only columns that exist)
    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, full_name, role, university)
      `)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // If we have posts, check if user has liked/bookmarked each
    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      
      const [likesResult, bookmarksResult] = await Promise.all([
        supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds),
        supabase
          .from("post_bookmarks")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds)
      ]);

      const likedPostIds = new Set(likesResult.data?.map(l => l.post_id) || []);
      const bookmarkedPostIds = new Set(bookmarksResult.data?.map(b => b.post_id) || []);

      return {
        posts: posts.map(p => ({
          ...p,
          has_liked: likedPostIds.has(p.id),
          has_bookmarked: bookmarkedPostIds.has(p.id)
        })) as Post[],
        nextPage: posts.length === PAGE_SIZE ? pageParam + 1 : null
      };
    }

    return { posts: [] as Post[], nextPage: null };
  };

  const feedQuery = useInfiniteQuery({
    queryKey: ["feed", sortBy, user?.id],
    queryFn: fetchFeedPage,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!user,
    staleTime: 30000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("feed-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["feed"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_likes" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["feed"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_comments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["feed"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const allPosts = feedQuery.data?.pages.flatMap(page => page.posts) || [];

  return {
    posts: allPosts,
    isLoading: feedQuery.isLoading,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    hasNextPage: feedQuery.hasNextPage,
    fetchNextPage: feedQuery.fetchNextPage,
    refetch: feedQuery.refetch,
  };
}

export function useCreatePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      content: string;
      post_type?: PostType;
      visibility?: PostVisibility;
      organization_id?: string;
      media_urls?: string[];
      tags?: string[];
      mentioned_users?: string[];
      linked_entity_type?: string;
      linked_entity_id?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          content: data.content,
          post_type: data.post_type || 'text',
          visibility: data.visibility || 'public',
          organization_id: data.organization_id || null,
          media_urls: data.media_urls || [],
          tags: data.tags || [],
          mentioned_users: data.mentioned_users || [],
          linked_entity_type: data.linked_entity_type || null,
          linked_entity_id: data.linked_entity_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("posts")
        .update({ content, is_edited: true, updated_at: new Date().toISOString() })
        .eq("id", postId)
        .eq("author_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({ title: "Post updated" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeletePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("author_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({ title: "Post deleted" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLikePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useBookmarkPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isBookmarked }: { postId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      if (isBookmarked) {
        const { error } = await supabase
          .from("post_bookmarks")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_bookmarks")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useSharePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, comment, visibility }: { 
      postId: string; 
      comment?: string;
      visibility?: PostVisibility;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("post_shares")
        .insert({
          post_id: postId,
          user_id: user.id,
          share_comment: comment || null,
          visibility: visibility || 'public',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({ title: "Post shared successfully" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function usePostComments(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from("post_comments")
        .select(`
          *,
          author:profiles!post_comments_user_id_fkey(id, full_name)
        `)
        .eq("post_id", postId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Check which comments user has liked
      if (comments && comments.length > 0 && user) {
        const commentIds = comments.map(c => c.id);
        const { data: likes } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in("comment_id", commentIds);

        const likedIds = new Set(likes?.map(l => l.comment_id) || []);

        // Organize into threaded structure
        const rootComments: PostComment[] = [];
        const repliesMap = new Map<string, PostComment[]>();

        comments.forEach(c => {
          const comment: PostComment = {
            ...c,
            has_liked: likedIds.has(c.id),
            replies: [],
          };

          if (c.parent_comment_id) {
            const replies = repliesMap.get(c.parent_comment_id) || [];
            replies.push(comment);
            repliesMap.set(c.parent_comment_id, replies);
          } else {
            rootComments.push(comment);
          }
        });

        // Attach replies to root comments
        rootComments.forEach(c => {
          c.replies = repliesMap.get(c.id) || [];
        });

        return rootComments;
      }

      return comments as PostComment[];
    },
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content, parentCommentId }: {
      postId: string;
      content: string;
      parentCommentId?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_comment_id: parentCommentId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLikeComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, postId, isLiked }: { 
      commentId: string; 
      postId: string;
      isLiked: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      if (isLiked) {
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comment_likes")
          .insert({ comment_id: commentId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", variables.postId] });
    },
  });
}

export function useReportPost() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, commentId, reason, details }: {
      postId?: string;
      commentId?: string;
      reason: string;
      details?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("reported_posts")
        .insert({
          post_id: postId || null,
          comment_id: commentId || null,
          reporter_id: user.id,
          reason: reason as any,
          details,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useFollowUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      if (isFollowing) {
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_follows")
          .insert({ follower_id: user.id, following_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

export function useSinglePost(postId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data: post, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, full_name, role, university)
        `)
        .eq("id", postId)
        .single();

      if (error) throw error;

      // Check if user has liked/bookmarked
      if (user) {
        const [likeResult, bookmarkResult] = await Promise.all([
          supabase.from("post_likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle(),
          supabase.from("post_bookmarks").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle(),
        ]);

        return {
          ...post,
          has_liked: !!likeResult.data,
          has_bookmarked: !!bookmarkResult.data,
        } as Post;
      }

      return post as Post;
    },
    enabled: !!postId,
  });
}
