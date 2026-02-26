/**
 * In-memory cache with TTL — lightweight, user-scoped, namespace-based.
 * NEVER cache financial mutations. Only read-heavy, eventually-consistent data.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/** Default TTLs in milliseconds */
const TTL = {
  SHORT: 2 * 60 * 1000,    // 2 min — deal summaries
  MEDIUM: 5 * 60 * 1000,   // 5 min — trust scores, leaderboard, user metrics
  LONG: 15 * 60 * 1000,    // 15 min — rarely changing config
} as const;

function makeKey(namespace: string, id: string): string {
  return `${namespace}:${id}`;
}

/**
 * Get a cached value, or null if expired/missing.
 */
export function cacheGet<T>(namespace: string, id: string): T | null {
  const key = makeKey(namespace, id);
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set a cached value with TTL.
 */
export function cacheSet<T>(namespace: string, id: string, value: T, ttlMs: number = TTL.MEDIUM): void {
  store.set(makeKey(namespace, id), { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Get or compute — returns cached value or runs fetcher & caches result.
 */
export async function cacheGetOrSet<T>(
  namespace: string,
  id: string,
  fetcher: () => Promise<T>,
  ttlMs: number = TTL.MEDIUM
): Promise<T> {
  const cached = cacheGet<T>(namespace, id);
  if (cached !== null) return cached;
  const value = await fetcher();
  cacheSet(namespace, id, value, ttlMs);
  return value;
}

/**
 * Invalidate a specific cache entry.
 */
export function cacheInvalidate(namespace: string, id: string): void {
  store.delete(makeKey(namespace, id));
}

/**
 * Invalidate all entries in a namespace.
 */
export function cacheInvalidateNamespace(namespace: string): void {
  const prefix = `${namespace}:`;
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/**
 * Clear entire cache.
 */
export function cacheClear(): void {
  store.clear();
}

/**
 * Prune expired entries (call periodically if needed).
 */
export function cachePrune(): number {
  let pruned = 0;
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) {
      store.delete(key);
      pruned++;
    }
  }
  return pruned;
}

export { TTL };
