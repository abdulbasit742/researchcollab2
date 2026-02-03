import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// =====================================================
// TYPES
// =====================================================

export interface Grant {
  id: string;
  title: string;
  funder: string;
  description: string | null;
  amount_min: number | null;
  amount_max: number | null;
  currency: string;
  deadline: string | null;
  eligibility: string | null;
  fields: string[] | null;
  application_url: string | null;
  is_active: boolean;
  posted_by: string | null;
  organization_id: string | null;
  created_at: string;
  // Joined data
  organization?: { name: string };
  is_bookmarked?: boolean;
}

// =====================================================
// BROWSE GRANTS
// =====================================================

export function useGrants(filters?: {
  search?: string;
  field?: string;
  deadline?: "week" | "month" | "quarter";
}) {
  const { user } = useAuth();
  
  return useInfiniteQuery({
    queryKey: ["grants", filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("grants")
        .select("*, organizations(name)")
        .eq("is_active", true)
        .order("deadline", { ascending: true, nullsFirst: false })
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);
      
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }
      
      if (filters?.deadline) {
        const now = new Date();
        let endDate = new Date();
        if (filters.deadline === "week") endDate.setDate(now.getDate() + 7);
        else if (filters.deadline === "month") endDate.setMonth(now.getMonth() + 1);
        else if (filters.deadline === "quarter") endDate.setMonth(now.getMonth() + 3);
        
        query = query.gte("deadline", now.toISOString().split("T")[0])
                     .lte("deadline", endDate.toISOString().split("T")[0]);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Get bookmarked status if authenticated
      let bookmarkedIds: string[] = [];
      if (user?.id && data.length > 0) {
        const grantIds = data.map(g => g.id);
        const { data: bookmarks } = await supabase
          .from("grant_bookmarks")
          .select("grant_id")
          .eq("user_id", user.id)
          .in("grant_id", grantIds);
        
        bookmarkedIds = bookmarks?.map(b => b.grant_id) || [];
      }
      
      return {
        grants: data.map(g => ({
          ...g,
          organization: g.organizations,
          is_bookmarked: bookmarkedIds.includes(g.id),
        })) as Grant[],
        nextPage: data.length === 20 ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
}

// =====================================================
// SINGLE GRANT
// =====================================================

export function useGrant(grantId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["grant", grantId],
    queryFn: async () => {
      if (!grantId) return null;
      
      const { data, error } = await supabase
        .from("grants")
        .select("*, organizations(name)")
        .eq("id", grantId)
        .single();
      
      if (error) throw error;
      
      let is_bookmarked = false;
      if (user?.id) {
        const { data: bookmark } = await supabase
          .from("grant_bookmarks")
          .select("id")
          .eq("grant_id", grantId)
          .eq("user_id", user.id)
          .maybeSingle();
        is_bookmarked = !!bookmark;
      }
      
      return {
        ...data,
        organization: data.organizations,
        is_bookmarked,
      } as Grant;
    },
    enabled: !!grantId,
  });
}

// =====================================================
// BOOKMARKED GRANTS
// =====================================================

export function useBookmarkedGrants() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["bookmarkedGrants", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("grant_bookmarks")
        .select("*, grants(*, organizations(name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data.map(b => ({
        ...b.grants,
        organization: b.grants.organizations,
        is_bookmarked: true,
      })) as Grant[];
    },
    enabled: !!user?.id,
  });
}

// =====================================================
// BOOKMARK/UNBOOKMARK GRANT
// =====================================================

export function useBookmarkGrant() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ grantId, bookmark }: { grantId: string; bookmark: boolean }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      if (bookmark) {
        const { error } = await supabase
          .from("grant_bookmarks")
          .insert({ grant_id: grantId, user_id: user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("grant_bookmarks")
          .delete()
          .eq("grant_id", grantId)
          .eq("user_id", user.id);
        if (error) throw error;
      }
    },
    onSuccess: (_, { bookmark }) => {
      queryClient.invalidateQueries({ queryKey: ["grants"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarkedGrants"] });
      queryClient.invalidateQueries({ queryKey: ["grant"] });
      toast.success(bookmark ? "Grant bookmarked" : "Bookmark removed");
    },
  });
}

// =====================================================
// UPCOMING DEADLINES
// =====================================================

export function useUpcomingGrantDeadlines(days: number = 14) {
  return useQuery({
    queryKey: ["upcomingGrantDeadlines", days],
    queryFn: async () => {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + days);
      
      const { data, error } = await supabase
        .from("grants")
        .select("id, title, funder, deadline, amount_min, amount_max, currency")
        .eq("is_active", true)
        .gte("deadline", now.toISOString().split("T")[0])
        .lte("deadline", endDate.toISOString().split("T")[0])
        .order("deadline", { ascending: true })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });
}
