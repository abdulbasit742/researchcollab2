import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SearchResult {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  skills: string[] | null;
  university: string | null;
  organization_id: string | null;
  trust_score_snapshot: number;
  visibility: string;
  updated_at: string;
}

export interface SearchFilters {
  entity_types?: string[];
  university?: string;
  skills?: string[];
  trust_tier?: string;
  verified_only?: boolean;
}

// =====================================================
// GLOBAL SEARCH
// =====================================================

export function useGlobalSearch(query: string, filters?: SearchFilters) {
  const { user } = useAuth();
  
  return useInfiniteQuery({
    queryKey: ["globalSearch", query, filters],
    queryFn: async ({ pageParam = 0 }) => {
      if (!query || query.length < 2) return { results: [], nextPage: null };
      
      let searchQuery = supabase
        .from("search_index")
        .select("*")
        .textSearch("searchable_text", query, { type: "websearch" })
        .eq("visibility", "public")
        .order("trust_score_snapshot", { ascending: false })
        .range(pageParam * 20, (pageParam + 1) * 20 - 1);
      
      // Apply entity type filter
      if (filters?.entity_types && filters.entity_types.length > 0) {
        searchQuery = searchQuery.in("entity_type", filters.entity_types);
      }
      
      // Apply university filter
      if (filters?.university) {
        searchQuery = searchQuery.ilike("university", `%${filters.university}%`);
      }
      
      const { data, error } = await searchQuery;
      
      if (error) throw error;
      
      // Log search event
      if (user?.id && data && data.length > 0) {
        await supabase.from("search_events").insert({
          user_id: user.id,
          query,
          filters: filters as any,
        });
      }
      
      return {
        results: (data || []) as SearchResult[],
        nextPage: data && data.length === 20 ? pageParam + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled: query.length >= 2,
  });
}

// =====================================================
// QUICK SEARCH (FOR AUTOCOMPLETE)
// =====================================================

export function useQuickSearch(query: string) {
  return useQuery({
    queryKey: ["quickSearch", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from("search_index")
        .select("entity_type, entity_id, title, description")
        .textSearch("searchable_text", query, { type: "websearch" })
        .eq("visibility", "public")
        .limit(8);
      
      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60, // Cache for 1 minute
  });
}

// =====================================================
// SAVED SEARCHES
// =====================================================

export function useSavedSearches() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["savedSearches", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("last_used_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useSaveSearch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ query, filters }: { query: string; filters?: SearchFilters }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("saved_searches")
        .upsert({
          user_id: user.id,
          query_text: query,
          filters: filters as any,
          last_used_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,query_text",
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedSearches", user?.id] });
      toast.success("Search saved");
    },
    onError: () => {
      toast.error("Failed to save search");
    },
  });
}

export function useDeleteSavedSearch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (searchId: string) => {
      const { error } = await supabase
        .from("saved_searches")
        .delete()
        .eq("id", searchId)
        .eq("user_id", user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedSearches", user?.id] });
    },
  });
}

// =====================================================
// SEARCH BY ENTITY TYPE
// =====================================================

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, first_name, last_name, avatar_url, role, university, bio")
        .or(`full_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,university.ilike.%${query}%`)
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2,
  });
}

export function useSearchProjects(query: string) {
  return useQuery({
    queryKey: ["searchProjects", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from("earning_projects")
        .select("id, title, description, status, budget_min, budget_max, tags")
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("status", "open")
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2,
  });
}

export function useSearchOrganizations(query: string) {
  return useQuery({
    queryKey: ["searchOrganizations", query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, type, description, logo_url")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: query.length >= 2,
  });
}

// =====================================================
// TRENDING & RECENT SEARCHES
// =====================================================

export function useRecentSearches() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["recentSearches", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("search_events")
        .select("query")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Deduplicate
      const seen = new Set();
      return (data || []).filter(item => {
        if (seen.has(item.query)) return false;
        seen.add(item.query);
        return true;
      }).slice(0, 5);
    },
    enabled: !!user?.id,
  });
}
