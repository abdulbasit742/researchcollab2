import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

export interface Group {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  group_type: string;
  visibility: string;
  cover_image_url: string | null;
  created_by: string;
  organization_id: string | null;
  rules: string | null;
  member_count: number;
  is_active: boolean;
  created_at: string;
  // Joined data
  creator?: { full_name: string | null };
  my_membership?: GroupMember;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  // Joined data
  profile?: { full_name: string | null };
}

export interface GroupPost {
  id: string;
  group_id: string;
  author_id: string;
  content: string;
  post_type: string;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  // Joined data
  author?: { full_name: string | null };
}

// =====================================================
// DISCOVER GROUPS
// =====================================================

export function useDiscoverGroups(filters?: { type?: string; search?: string }) {
  return useInfiniteQuery({
    queryKey: ["discoverGroups", filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("groups")
        .select("*, profiles!groups_created_by_fkey(full_name)")
        .eq("visibility", "public")
        .eq("is_active", true)
        .order("member_count", { ascending: false })
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);
      
      if (filters?.type) {
        query = query.eq("group_type", filters.type);
      }
      
      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return {
        groups: data.map(g => ({
          ...g,
          creator: g.profiles,
        })) as Group[],
        nextPage: data.length === 20 ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

// =====================================================
// MY GROUPS
// =====================================================

export function useMyGroups() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["myGroups", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          *,
          groups(*)
        `)
        .eq("user_id", user.id)
        .eq("status", "approved");
      
      if (error) throw error;
      
      return data.map(m => ({
        ...m.groups,
        my_membership: m,
      })) as Group[];
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// SINGLE GROUP
// =====================================================

export function useGroup(groupId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      const { data, error } = await supabase
        .from("groups")
        .select("*, profiles!groups_created_by_fkey(full_name)")
        .eq("id", groupId)
        .single();
      
      if (error) throw error;
      
      // Get user's membership if authenticated
      let membership = null;
      if (user?.id) {
        const { data: mem } = await supabase
          .from("group_members")
          .select("*")
          .eq("group_id", groupId)
          .eq("user_id", user.id)
          .maybeSingle();
        membership = mem;
      }
      
      return {
        ...data,
        creator: data.profiles,
        my_membership: membership,
      } as Group;
    },
    enabled: !!groupId,
  });
}

// =====================================================
// GROUP MEMBERS
// =====================================================

export function useGroupMembers(groupId?: string) {
  return useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from("group_members")
        .select("*, profiles(full_name)")
        .eq("group_id", groupId)
        .eq("status", "approved")
        .order("role", { ascending: true });
      
      if (error) throw error;
      
      return data.map(m => ({
        ...m,
        profile: m.profiles,
      })) as GroupMember[];
    },
    enabled: !!groupId,
  });
}

// =====================================================
// GROUP POSTS
// =====================================================

export function useGroupPosts(groupId?: string) {
  return useInfiniteQuery({
    queryKey: ["groupPosts", groupId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!groupId) return { posts: [], nextPage: null };
      
      const { data, error } = await supabase
        .from("group_posts")
        .select("*, profiles!group_posts_author_id_fkey(full_name)")
        .eq("group_id", groupId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);
      
      if (error) throw error;
      
      return {
        posts: data.map(p => ({
          ...p,
          author: p.profiles,
        })) as GroupPost[],
        nextPage: data.length === 20 ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: !!groupId,
  });
}

// =====================================================
// CREATE GROUP
// =====================================================

export function useCreateGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      group_type: string;
      visibility?: string;
      rules?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data: group, error } = await supabase
        .from("groups")
        .insert({
          ...data,
          slug,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Auto-join as admin
      await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: "admin",
          status: "approved",
        });
      
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.invalidateQueries({ queryKey: ["discoverGroups"] });
      toast.success("Group created");
    },
    onError: () => {
      toast.error("Failed to create group");
    },
  });
}

// =====================================================
// JOIN GROUP
// =====================================================

export function useJoinGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ groupId, isPrivate }: { groupId: string; isPrivate?: boolean }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: user.id,
          status: isPrivate ? "pending" : "approved",
        });
      
      if (error) throw error;
    },
    onSuccess: (_, { isPrivate }) => {
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
      toast.success(isPrivate ? "Join request sent" : "Joined group");
    },
    onError: () => {
      toast.error("Failed to join group");
    },
  });
}

// =====================================================
// LEAVE GROUP
// =====================================================

export function useLeaveGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
      toast.success("Left group");
    },
  });
}

// =====================================================
// CREATE GROUP POST
// =====================================================

export function useCreateGroupPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      group_id: string;
      content: string;
      post_type?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("group_posts")
        .insert({
          ...data,
          author_id: user.id,
        });
      
      if (error) throw error;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["groupPosts", data.group_id] });
      toast.success("Posted to group");
    },
    onError: () => {
      toast.error("Failed to post");
    },
  });
}
