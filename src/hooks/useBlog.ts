import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

export interface BlogPost {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author_id: string;
  category: string | null;
  tags: string[] | null;
  status: string;
  published_at: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  author?: { full_name: string | null };
}

// =====================================================
// PUBLISHED POSTS
// =====================================================

export function useBlogPosts(filters?: { category?: string; search?: string }) {
  return useInfiniteQuery({
    queryKey: ["blogPosts", filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("blog_posts")
        .select("*, profiles!blog_posts_author_id_fkey(full_name)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(pageParam * 10, (pageParam + 1) * 10 - 1);
      
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return {
        posts: data.map(p => ({
          ...p,
          author: p.profiles,
        })) as BlogPost[],
        nextPage: data.length === 10 ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

// =====================================================
// SINGLE POST
// =====================================================

export function useBlogPost(slugOrId?: string) {
  return useQuery({
    queryKey: ["blogPost", slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      
      // Try by slug first, then by id
      let { data, error } = await supabase
        .from("blog_posts")
        .select("*, profiles!blog_posts_author_id_fkey(full_name)")
        .eq("slug", slugOrId)
        .eq("status", "published")
        .maybeSingle();
      
      if (!data) {
        const result = await supabase
          .from("blog_posts")
          .select("*, profiles!blog_posts_author_id_fkey(full_name)")
          .eq("id", slugOrId)
          .eq("status", "published")
          .maybeSingle();
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      if (!data) return null;
      
      // Increment view count
      await supabase
        .from("blog_posts")
        .update({ views_count: data.views_count + 1 })
        .eq("id", data.id);
      
      return {
        ...data,
        author: data.profiles,
      } as BlogPost;
    },
    enabled: !!slugOrId,
  });
}

// =====================================================
// FEATURED POSTS
// =====================================================

export function useFeaturedBlogPosts() {
  return useQuery({
    queryKey: ["featuredBlogPosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, profiles!blog_posts_author_id_fkey(full_name)")
        .eq("status", "published")
        .order("views_count", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return data.map(p => ({
        ...p,
        author: p.profiles,
      })) as BlogPost[];
    },
  });
}

// =====================================================
// CATEGORIES
// =====================================================

export function useBlogCategories() {
  return useQuery({
    queryKey: ["blogCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("category")
        .eq("status", "published")
        .not("category", "is", null);
      
      if (error) throw error;
      
      const categories = new Set(data.map(p => p.category).filter(Boolean));
      return Array.from(categories) as string[];
    },
  });
}

// =====================================================
// MY DRAFTS (FOR AUTHORS)
// =====================================================

export function useMyBlogDrafts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["myBlogDrafts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("author_id", user.id)
        .in("status", ["draft", "published"])
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// CREATE/UPDATE POST
// =====================================================

export function useCreateBlogPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      excerpt?: string;
      category?: string;
      tags?: string[];
      cover_image_url?: string;
      status?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { error } = await supabase
        .from("blog_posts")
        .insert({
          ...data,
          slug,
          author_id: user.id,
          published_at: data.status === "published" ? new Date().toISOString() : null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      queryClient.invalidateQueries({ queryKey: ["myBlogDrafts"] });
      toast.success("Post saved");
    },
    onError: () => {
      toast.error("Failed to save post");
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, data }: {
      postId: string;
      data: Partial<BlogPost>;
    }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          published_at: data.status === "published" ? new Date().toISOString() : undefined,
        })
        .eq("id", postId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      queryClient.invalidateQueries({ queryKey: ["blogPost"] });
      queryClient.invalidateQueries({ queryKey: ["myBlogDrafts"] });
      toast.success("Post updated");
    },
  });
}

// =====================================================
// DELETE POST
// =====================================================

export function useDeleteBlogPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", postId)
        .eq("author_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      queryClient.invalidateQueries({ queryKey: ["myBlogDrafts"] });
      toast.success("Post deleted");
    },
  });
}
