import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlatformSearchFilters {
  entity_types?: string[];
  institution_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface PlatformSearchResult {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  content_excerpt: string | null;
  institution_id: string | null;
  visibility_scope: string;
  rank: number;
  created_at: string;
}

export interface TrendingEntity {
  entity_type: string;
  entity_id: string;
  entity_title: string | null;
  engagement_score: number;
  activity_velocity: number;
}

export interface PublicResearch {
  id: string;
  research_execution_id: string | null;
  project_title: string;
  institution_name: string | null;
  institution_id: string | null;
  validation_status: string | null;
  execution_score: number;
  searchable_tags: string[];
  created_at: string;
}

export function usePlatformSearch(query: string, filters: PlatformSearchFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ["platform-search", query, filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_platform", {
        query_text: query,
        filter_entity_types: filters.entity_types?.length ? filters.entity_types : null,
        filter_institution_id: filters.institution_id || null,
        filter_date_from: filters.date_from || null,
        filter_date_to: filters.date_to || null,
        page_num: filters.page || 1,
        page_size: filters.page_size || 20,
      });
      if (error) throw error;
      return (data || []) as PlatformSearchResult[];
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30_000,
  });
}

export function useTrendingEntities(limit = 20) {
  return useQuery({
    queryKey: ["trending-entities", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("compute_trending_entities", {
        limit_count: limit,
      });
      if (error) throw error;
      return (data || []) as TrendingEntity[];
    },
    staleTime: 60_000,
  });
}

export function usePublicResearchDiscovery(filters?: { tags?: string[]; minScore?: number }) {
  return useQuery({
    queryKey: ["public-research-discovery", filters],
    queryFn: async () => {
      let q = supabase
        .from("public_research_index")
        .select("*")
        .order("execution_score", { ascending: false })
        .limit(50);

      if (filters?.minScore) {
        q = q.gte("execution_score", filters.minScore);
      }
      if (filters?.tags?.length) {
        q = q.overlaps("searchable_tags", filters.tags);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as PublicResearch[];
    },
    staleTime: 120_000,
  });
}

export function useSearchAuditLog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["search-audit-log", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("search_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
