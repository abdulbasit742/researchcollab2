/**
 * usePaginatedQuery — Generic server-side pagination hook.
 * Wraps TanStack Query with limit/offset pattern.
 */
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";

interface PaginationConfig<T> {
  queryKey: string[];
  queryFn: (params: { offset: number; limit: number }) => Promise<{ data: T[]; count: number }>;
  pageSize?: number;
  staleTime?: number;
  enabled?: boolean;
}

export function usePaginatedQuery<T>(config: PaginationConfig<T>) {
  const pageSize = config.pageSize || 20;
  const [page, setPage] = useState(0);

  const offset = page * pageSize;

  const query = useQuery({
    queryKey: [...config.queryKey, page, pageSize],
    queryFn: () => config.queryFn({ offset, limit: pageSize }),
    placeholderData: keepPreviousData,
    staleTime: config.staleTime ?? 60_000,
    enabled: config.enabled ?? true,
  });

  const totalPages = useMemo(
    () => Math.ceil((query.data?.count || 0) / pageSize),
    [query.data?.count, pageSize]
  );

  const goNext = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages - 1));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 0));
  }, []);

  const goTo = useCallback((p: number) => {
    setPage(Math.max(0, Math.min(p, totalPages - 1)));
  }, [totalPages]);

  return {
    ...query,
    items: query.data?.data || [],
    totalCount: query.data?.count || 0,
    page,
    pageSize,
    totalPages,
    goNext,
    goPrev,
    goTo,
    hasNext: page < totalPages - 1,
    hasPrev: page > 0,
  };
}
