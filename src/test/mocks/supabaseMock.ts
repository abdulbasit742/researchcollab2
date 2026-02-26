/**
 * Supabase client mock for unit testing.
 * Provides chainable query builder that returns configurable data.
 */
import { vi } from "vitest";

type MockResponse = { data: unknown; error: unknown; count?: number };

let mockResponses: MockResponse[] = [];
let responseIndex = 0;

export function setMockResponse(data: unknown, error: unknown = null) {
  mockResponses = [{ data, error }];
  responseIndex = 0;
}

export function setMockResponses(responses: MockResponse[]) {
  mockResponses = responses;
  responseIndex = 0;
}

function getNextResponse(): MockResponse {
  const r = mockResponses[responseIndex] ?? { data: null, error: null };
  if (responseIndex < mockResponses.length - 1) responseIndex++;
  return r;
}

function createChain(): Record<string, unknown> {
  const chain: Record<string, unknown> = {};
  const methods = [
    "select", "insert", "update", "delete", "upsert",
    "eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike",
    "in", "is", "order", "limit", "range", "filter",
    "match", "not", "or", "contains", "containedBy",
    "textSearch", "single", "maybeSingle",
  ];
  for (const m of methods) {
    chain[m] = vi.fn(() => chain);
  }
  // Terminal methods return the response
  chain["then"] = vi.fn((resolve: (v: MockResponse) => void) => {
    resolve(getNextResponse());
    return Promise.resolve(getNextResponse());
  });
  // Make it thenable so await works
  Object.defineProperty(chain, Symbol.toStringTag, { value: "Promise" });
  // Override to act as a promise
  (chain as Record<string, unknown>)["then"] = (
    onFulfilled?: (v: MockResponse) => unknown,
    onRejected?: (e: unknown) => unknown
  ) => {
    const resp = getNextResponse();
    if (resp.error && onRejected) return Promise.resolve(onRejected(resp.error));
    if (onFulfilled) return Promise.resolve(onFulfilled(resp));
    return Promise.resolve(resp);
  };
  return chain;
}

export const mockSupabase = {
  from: vi.fn(() => createChain()),
  rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
  auth: {
    getUser: vi.fn(() =>
      Promise.resolve({ data: { user: { id: "test-user-id" } }, error: null })
    ),
    getSession: vi.fn(() =>
      Promise.resolve({ data: { session: { user: { id: "test-user-id" } } }, error: null })
    ),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
  },
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
  })),
  removeChannel: vi.fn(),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: "test/path" }, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.com/file" } })),
      createSignedUrl: vi.fn(() =>
        Promise.resolve({ data: { signedUrl: "https://example.com/signed" }, error: null })
      ),
      remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
};

// Auto-mock the supabase client import
vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));
