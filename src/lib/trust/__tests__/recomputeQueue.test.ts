import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  enqueueTrustRecompute,
  flushPendingRecomputes,
  getPendingCount,
} from "../recomputeQueue";

vi.mock("@/lib/core/logger", () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() }),
}));

describe("Trust Recompute Queue", () => {
  beforeEach(() => {
    flushPendingRecomputes();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("deduplicates same user within debounce window", () => {
    const fn = vi.fn(async () => {});
    enqueueTrustRecompute("user-1", fn);
    enqueueTrustRecompute("user-1", fn);
    enqueueTrustRecompute("user-1", fn);
    expect(getPendingCount()).toBe(1);
  });

  it("tracks different users separately", () => {
    const fn = vi.fn(async () => {});
    enqueueTrustRecompute("user-1", fn);
    enqueueTrustRecompute("user-2", fn);
    expect(getPendingCount()).toBe(2);
  });

  it("executes after debounce period", async () => {
    const fn = vi.fn(async () => {});
    enqueueTrustRecompute("user-1", fn);

    vi.advanceTimersByTime(5000);
    await vi.runAllTimersAsync();

    expect(fn).toHaveBeenCalledWith("user-1");
  });

  it("flushPendingRecomputes clears queue", () => {
    const fn = vi.fn(async () => {});
    enqueueTrustRecompute("user-1", fn);
    enqueueTrustRecompute("user-2", fn);
    flushPendingRecomputes();
    expect(getPendingCount()).toBe(0);
  });
});
