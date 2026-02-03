import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

export interface SearchResult {
  id: string;
  entity_type: string;
  entity_id: string;
  searchable_text: string;
  keywords: string[];
  domains: string[];
  visibility_scope: string;
  owner_id: string | null;
  relevance_score?: number;
}

export interface SemanticQuery {
  id: string;
  user_id: string;
  query_name: string | null;
  query_text: string;
  parsed_structure: Json | null;
  entity_types: string[];
  filters: Json;
  scope: string;
  is_alert_enabled: boolean;
  last_executed_at: string | null;
  created_at: string;
}

export interface DiscoverySignal {
  id: string;
  entity_type: string;
  entity_id: string;
  signal_type: string;
  signal_value: number;
  context: Json;
  computed_at: string;
}

export interface SearchFilters {
  entity_types?: string[];
  domains?: string[];
  visibility?: string;
  dateRange?: { start?: string; end?: string };
}

export function useSearch() {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters?: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      let queryBuilder = supabase
        .from("search_indexes")
        .select("*")
        .textSearch("searchable_text", query, {
          type: "websearch",
          config: "english",
        });

      // Apply filters
      if (filters?.entity_types?.length) {
        queryBuilder = queryBuilder.in("entity_type", filters.entity_types);
      }

      if (filters?.visibility) {
        queryBuilder = queryBuilder.eq("visibility_scope", filters.visibility);
      }

      if (filters?.domains?.length) {
        queryBuilder = queryBuilder.overlaps("domains", filters.domains);
      }

      const { data, error: searchError } = await queryBuilder.limit(50);

      if (searchError) throw searchError;
      
      setResults(data || []);
      
      // Log query execution
      if (user) {
        await supabase.from("query_execution_logs").insert({
          executed_by: user.id,
          query_text: query,
          result_count: data?.length || 0,
          filters_applied: filters,
        } as any);
      }

      return { success: true, data };
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearResults = () => setResults([]);

  return { results, loading, error, search, clearResults };
}

export function useSemanticQuery() {
  const { user } = useAuth();
  const [savedQueries, setSavedQueries] = useState<SemanticQuery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedQueries = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("semantic_queries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedQueries(data || []);
    } catch (err) {
      console.error("Error fetching saved queries:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveQuery = async (query: {
    query_name?: string;
    query_text: string;
    entity_types?: string[];
    filters?: Record<string, any>;
    scope?: string;
    is_alert_enabled?: boolean;
  }) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("semantic_queries")
        .insert({
          ...query,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      setSavedQueries(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteQuery = async (queryId: string) => {
    try {
      const { error } = await supabase
        .from("semantic_queries")
        .delete()
        .eq("id", queryId);

      if (error) throw error;
      setSavedQueries(prev => prev.filter(q => q.id !== queryId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleAlert = async (queryId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("semantic_queries")
        .update({ is_alert_enabled: enabled })
        .eq("id", queryId);

      if (error) throw error;
      setSavedQueries(prev => prev.map(q => 
        q.id === queryId ? { ...q, is_alert_enabled: enabled } : q
      ));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    savedQueries,
    loading,
    refetch: fetchSavedQueries,
    saveQuery,
    deleteQuery,
    toggleAlert,
  };
}

export function useDiscoverySignals(entityType?: string, entityId?: string) {
  const [signals, setSignals] = useState<DiscoverySignal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSignals = useCallback(async () => {
    if (!entityType || !entityId) {
      setSignals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("discovery_signals")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId);

      if (error) throw error;
      setSignals(data || []);
    } catch (err) {
      console.error("Error fetching signals:", err);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  // Get aggregated signals for ranking
  const getAggregateScore = useCallback(() => {
    if (signals.length === 0) return 0;
    
    const weights: Record<string, number> = {
      relevance: 0.3,
      credibility: 0.25,
      recency: 0.15,
      reproducibility: 0.15,
      interdisciplinarity: 0.1,
      peer_validation: 0.05,
    };

    return signals.reduce((score, signal) => {
      const weight = weights[signal.signal_type] || 0.1;
      return score + (signal.signal_value * weight);
    }, 0);
  }, [signals]);

  return { signals, loading, refetch: fetchSignals, getAggregateScore };
}

// Parse scholarly query language
export function parseScholarlyQuery(query: string): {
  entityType?: string;
  filters: Record<string, any>;
  keywords: string[];
} {
  const result: {
    entityType?: string;
    filters: Record<string, any>;
    keywords: string[];
  } = {
    filters: {},
    keywords: [],
  };

  // Match entity type: "research where...", "datasets open and..."
  const entityMatch = query.match(/^(research|datasets|scholars|funding|concepts)\s+(where|with|and|open|restricted)?/i);
  if (entityMatch) {
    const typeMap: Record<string, string> = {
      research: "research_timeline",
      datasets: "dataset",
      scholars: "scholar",
      funding: "funding_program",
      concepts: "knowledge_node",
    };
    result.entityType = typeMap[entityMatch[1].toLowerCase()];
  }

  // Match domain filter: domain = "climate science"
  const domainMatch = query.match(/domain\s*=\s*["']([^"']+)["']/i);
  if (domainMatch) {
    result.filters.domain = domainMatch[1];
  }

  // Match method filter: method = "simulation"
  const methodMatch = query.match(/method\s*=\s*["']([^"']+)["']/i);
  if (methodMatch) {
    result.filters.method = methodMatch[1];
  }

  // Match boolean flags
  if (/\bopen\b/i.test(query)) result.filters.access_level = "open";
  if (/\breproducible\b/i.test(query)) result.filters.reproducible = true;
  if (/\bverified\b/i.test(query)) result.filters.verified = true;
  if (/\binterdisciplinary\b/i.test(query)) result.filters.interdisciplinary = true;

  // Match since/after: "since 2018"
  const sinceMatch = query.match(/since\s+(\d{4})/i);
  if (sinceMatch) {
    result.filters.since = sinceMatch[1];
  }

  // Extract remaining keywords
  const cleanedQuery = query
    .replace(/^(research|datasets|scholars|funding|concepts)\s+/i, "")
    .replace(/where|with|and|or|open|restricted|reproducible|verified/gi, "")
    .replace(/domain\s*=\s*["'][^"']+["']/gi, "")
    .replace(/method\s*=\s*["'][^"']+["']/gi, "")
    .replace(/since\s+\d{4}/gi, "")
    .trim();

  if (cleanedQuery) {
    result.keywords = cleanedQuery.split(/\s+/).filter(k => k.length > 2);
  }

  return result;
}
