/**
 * Cache Layer — TTL-based, namespaced, shard-aware in-memory cache.
 *
 * Features: TTL support, namespace isolation, invalidation rules, size limits.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  namespace: string;
  key: string;
}

const MAX_ENTRIES = 5000;
const store = new Map<string, CacheEntry<any>>();

function fullKey(namespace: string, key: string): string {
  return `${namespace}::${key}`;
}

export function get<T>(namespace: string, key: string): T | null {
  const fk = fullKey(namespace, key);
  const entry = store.get(fk);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(fk);
    return null;
  }
  return entry.data as T;
}

export function set<T>(namespace: string, key: string, data: T, ttlMs: number = 300000): void {
  // Evict if full
  if (store.size >= MAX_ENTRIES) {
    evictExpired();
    if (store.size >= MAX_ENTRIES) {
      const oldest = store.keys().next().value;
      if (oldest) store.delete(oldest);
    }
  }

  store.set(fullKey(namespace, key), {
    data,
    expiresAt: Date.now() + ttlMs,
    namespace,
    key,
  });
}

export function invalidate(namespace: string, key: string): boolean {
  return store.delete(fullKey(namespace, key));
}

export function invalidateNamespace(namespace: string): number {
  let count = 0;
  for (const [fk, entry] of store) {
    if (entry.namespace === namespace) {
      store.delete(fk);
      count++;
    }
  }
  return count;
}

export function invalidateAll(): number {
  const count = store.size;
  store.clear();
  return count;
}

function evictExpired(): number {
  const now = Date.now();
  let count = 0;
  for (const [fk, entry] of store) {
    if (now > entry.expiresAt) {
      store.delete(fk);
      count++;
    }
  }
  return count;
}

export function getStats() {
  evictExpired();
  const namespaces: Record<string, number> = {};
  for (const entry of store.values()) {
    namespaces[entry.namespace] = (namespaces[entry.namespace] ?? 0) + 1;
  }
  return { totalEntries: store.size, maxEntries: MAX_ENTRIES, namespaces };
}

// ─── Convenience: cached async fetch ───
export async function getOrFetch<T>(
  namespace: string,
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 300000
): Promise<T> {
  const cached = get<T>(namespace, key);
  if (cached !== null) return cached;

  const data = await fetcher();
  set(namespace, key, data, ttlMs);
  return data;
}
