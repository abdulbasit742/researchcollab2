import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

// Strict search input validation
const searchSchema = z.object({
  query: z.string().trim().max(200, "Query too long").default(""),
  entityType: z.enum(["all", "user", "project", "milestone", "artifact", "research"]).default("all"),
  sortBy: z.enum(["relevance", "recency", "activity"]).default("relevance"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
  institutionId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type SearchInput = z.infer<typeof searchSchema>;

export interface SearchResult {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  content_excerpt: string | null;
  visibility_scope: string;
  composite_rank_score: number;
  recency_score: number;
  activity_score: number;
  execution_quality_score: number;
  relevance_reason: string;
}

function deriveRelevanceReason(result: any, userRole?: string): string {
  const reasons: string[] = [];
  if (result.composite_rank_score > 70) reasons.push("High execution quality");
  if (result.recency_score > 60) reasons.push("Recently updated");
  if (result.activity_score > 50) reasons.push("Active engagement");
  if (userRole === "student" && ["project", "artifact"].includes(result.entity_type)) {
    reasons.push("Relevant to your role");
  }
  if (userRole === "supervisor" && ["milestone", "project"].includes(result.entity_type)) {
    reasons.push("Supervision-relevant");
  }
  return reasons.length > 0 ? reasons.join(" · ") : "Text match";
}

export function useSmartSearch(input: Partial<SearchInput>) {
  const { profile } = useAuth();

  const parsed = searchSchema.safeParse(input);
  const params = parsed.success ? parsed.data : searchSchema.parse({});

  return useQuery({
    queryKey: ["smart-search", params],
    queryFn: async (): Promise<{ results: SearchResult[]; total: number }> => {
      if (!params.query && params.entityType === "all") {
        return { results: [], total: 0 };
      }

      let query = supabase
        .from("global_search_index")
        .select("id, entity_type, entity_id, title, content_excerpt, visibility_scope, composite_rank_score, recency_score, activity_score, execution_quality_score", { count: "exact" })
        .eq("visibility_scope", "public");

      if (params.entityType !== "all") {
        query = query.eq("entity_type", params.entityType);
      }

      if (params.query) {
        query = query.or(`title.ilike.%${params.query}%,content_excerpt.ilike.%${params.query}%`);
      }

      if (params.institutionId) {
        query = query.eq("institution_id", params.institutionId);
      }

      if (params.dateFrom) {
        query = query.gte("updated_at", params.dateFrom);
      }
      if (params.dateTo) {
        query = query.lte("updated_at", params.dateTo);
      }

      // Sort
      const sortCol = params.sortBy === "recency"
        ? "recency_score"
        : params.sortBy === "activity"
        ? "activity_score"
        : "composite_rank_score";
      query = query.order(sortCol as any, { ascending: false });

      // Pagination
      const from = (params.page - 1) * params.pageSize;
      query = query.range(from, from + params.pageSize - 1);

      const { data, count, error } = await query;
      if (error) throw error;

      const userRole = (profile as any)?.role;
      const results: SearchResult[] = (data ?? []).map((r: any) => ({
        ...r,
        relevance_reason: deriveRelevanceReason(r, userRole),
      }));

      // Log search (fire-and-forget)
      supabase.from("search_query_logs").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        query_text: params.query.slice(0, 200),
        entity_type_filter: params.entityType,
        results_count: count ?? 0,
        flagged: params.query.length > 150 || /[;'"\\]/.test(params.query),
      }).then(() => {});

      return { results, total: count ?? 0 };
    },
    enabled: !!(params.query || params.entityType !== "all"),
    staleTime: 2 * 60 * 1000,
  });
}
