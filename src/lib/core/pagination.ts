/**
 * Pagination utility — standardized pagination for all list queries.
 * Prevents unbounded queries across the platform.
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Default limits per entity type */
export const DEFAULT_LIMITS: Record<string, number> = {
  deals: 20,
  offers: 20,
  messages: 50,
  transactions: 20,
  notifications: 20,
  admin_logs: 50,
  leaderboard: 25,
};

/**
 * Normalize pagination params — clamp page/limit to safe ranges.
 */
export function normalizePagination(
  params: Partial<PaginationParams>,
  entityType?: string
): PaginationParams {
  const defaultLimit = entityType ? (DEFAULT_LIMITS[entityType] ?? 20) : 20;
  const limit = Math.min(Math.max(params.limit ?? defaultLimit, 1), 100);
  const page = Math.max(params.page ?? 1, 1);
  return { page, limit };
}

/**
 * Compute Supabase range() params from page/limit.
 */
export function toRange(params: PaginationParams): { from: number; to: number } {
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  return { from, to };
}

/**
 * Build a PaginatedResult from data + total count.
 */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1,
  };
}
