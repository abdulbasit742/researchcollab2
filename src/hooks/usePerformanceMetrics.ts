/**
 * usePerformanceMetrics — Hooks for admin performance monitoring.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePerformanceMetrics() {
  return useQuery({
    queryKey: ["performance-metrics"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("performance_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Array<{
        id: string;
        endpoint: string;
        avg_response_time: number | null;
        p95_response_time: number | null;
        p99_response_time: number | null;
        request_count: number;
        error_rate: number;
        recorded_at: string;
      }>;
    },
    staleTime: 60_000,
  });
}

export function useAnalyticsCache() {
  return useQuery({
    queryKey: ["analytics-cache-stats"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("analytics_cache")
        .select("cache_key, generated_at, expires_at")
        .order("generated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Array<{
        cache_key: string;
        generated_at: string;
        expires_at: string;
      }>;
    },
    staleTime: 30_000,
  });
}
