/**
 * Production Hardening Tests
 * Validates input guards, idempotency, and rate limiting.
 */
import { describe, it, expect } from "vitest";
import {
  validateMonetaryAmount,
  validateUUID,
  sanitizeString,
  checkRateLimit,
  idempotent,
} from "@/lib/core/productionHardening";

describe("Monetary Amount Validation", () => {
  it("accepts valid positive amount", () => {
    expect(validateMonetaryAmount(1000)).toBe(1000);
  });

  it("rounds to 2 decimal places", () => {
    expect(validateMonetaryAmount(99.999)).toBe(100);
    expect(validateMonetaryAmount(49.994)).toBe(49.99);
  });

  it("rejects zero", () => {
    expect(() => validateMonetaryAmount(0)).toThrow("must be positive");
  });

  it("rejects negative", () => {
    expect(() => validateMonetaryAmount(-100)).toThrow("must be positive");
  });

  it("rejects Infinity", () => {
    expect(() => validateMonetaryAmount(Infinity)).toThrow("must be a finite number");
  });

  it("rejects NaN", () => {
    expect(() => validateMonetaryAmount(NaN)).toThrow("must be a finite number");
  });

  it("rejects string", () => {
    expect(() => validateMonetaryAmount("1000")).toThrow("must be a finite number");
  });

  it("rejects amount exceeding max", () => {
    expect(() => validateMonetaryAmount(20_000_000)).toThrow("exceeds maximum");
  });

  it("custom max works", () => {
    expect(() => validateMonetaryAmount(500, "amt", 100)).toThrow("exceeds maximum");
  });
});

describe("UUID Validation", () => {
  it("accepts valid UUID", () => {
    expect(validateUUID("550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects non-string", () => {
    expect(() => validateUUID(123)).toThrow("must be a string");
  });

  it("rejects invalid format", () => {
    expect(() => validateUUID("not-a-uuid")).toThrow("not a valid UUID");
  });

  it("rejects empty string", () => {
    expect(() => validateUUID("")).toThrow("not a valid UUID");
  });
});

describe("String Sanitization", () => {
  it("trims and returns valid string", () => {
    expect(sanitizeString("  hello  ")).toBe("hello");
  });

  it("rejects empty string", () => {
    expect(() => sanitizeString("   ")).toThrow("cannot be empty");
  });

  it("rejects non-string", () => {
    expect(() => sanitizeString(123)).toThrow("must be a string");
  });

  it("rejects string exceeding max length", () => {
    expect(() => sanitizeString("a".repeat(600))).toThrow("exceeds maximum length");
  });
});

describe("Rate Limiting", () => {
  it("allows requests within limit", () => {
    const key = `rate-test-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, { maxRequests: 5, windowMs: 60000 })).toBe(true);
    }
  });

  it("blocks requests exceeding limit", () => {
    const key = `rate-block-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, { maxRequests: 3, windowMs: 60000 });
    }
    expect(checkRateLimit(key, { maxRequests: 3, windowMs: 60000 })).toBe(false);
  });
});

describe("Idempotency", () => {
  it("returns same result for same key", async () => {
    let callCount = 0;
    const key = `idem-${Date.now()}`;
    const op = async () => { callCount++; return 42; };

    const r1 = await idempotent(key, op);
    const r2 = await idempotent(key, op);

    expect(r1).toBe(42);
    expect(r2).toBe(42);
    expect(callCount).toBe(1); // Only called once
  });

  it("different keys execute independently", async () => {
    const k1 = `idem-a-${Date.now()}`;
    const k2 = `idem-b-${Date.now()}`;

    const r1 = await idempotent(k1, async () => "alpha");
    const r2 = await idempotent(k2, async () => "beta");

    expect(r1).toBe("alpha");
    expect(r2).toBe("beta");
  });
});
