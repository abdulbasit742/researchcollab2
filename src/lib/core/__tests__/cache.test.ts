import { describe, it, expect, beforeEach } from "vitest";
import {
  cacheGet, cacheSet, cacheGetOrSet,
  cacheInvalidate, cacheInvalidateNamespace,
  cacheClear, cachePrune,
} from "../cache";

describe("Cache", () => {
  beforeEach(() => cacheClear());

  it("stores and retrieves values", () => {
    cacheSet("test", "key1", { name: "Alice" });
    expect(cacheGet("test", "key1")).toEqual({ name: "Alice" });
  });

  it("returns null for missing keys", () => {
    expect(cacheGet("test", "missing")).toBeNull();
  });

  it("expires entries after TTL", async () => {
    cacheSet("test", "key1", "value", 50); // 50ms TTL
    await new Promise((r) => setTimeout(r, 60));
    expect(cacheGet("test", "key1")).toBeNull();
  });

  it("invalidates specific key", () => {
    cacheSet("ns", "a", 1);
    cacheSet("ns", "b", 2);
    cacheInvalidate("ns", "a");
    expect(cacheGet("ns", "a")).toBeNull();
    expect(cacheGet("ns", "b")).toBe(2);
  });

  it("invalidates entire namespace", () => {
    cacheSet("ns1", "a", 1);
    cacheSet("ns1", "b", 2);
    cacheSet("ns2", "a", 3);
    cacheInvalidateNamespace("ns1");
    expect(cacheGet("ns1", "a")).toBeNull();
    expect(cacheGet("ns1", "b")).toBeNull();
    expect(cacheGet("ns2", "a")).toBe(3);
  });

  it("cacheGetOrSet fetches and caches", async () => {
    let calls = 0;
    const fetcher = async () => { calls++; return "computed"; };

    const v1 = await cacheGetOrSet("ns", "k", fetcher);
    const v2 = await cacheGetOrSet("ns", "k", fetcher);

    expect(v1).toBe("computed");
    expect(v2).toBe("computed");
    expect(calls).toBe(1); // Only fetched once
  });

  it("prunes expired entries", async () => {
    cacheSet("ns", "a", 1, 10);
    cacheSet("ns", "b", 2, 100000);
    await new Promise((r) => setTimeout(r, 20));
    const pruned = cachePrune();
    expect(pruned).toBe(1);
    expect(cacheGet("ns", "b")).toBe(2);
  });
});
