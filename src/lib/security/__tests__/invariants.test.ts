import { describe, it, expect } from "vitest";
import {
  assertNonNegativeBalance,
  assertSufficientBalance,
  assertDealStatus,
  assertMilestoneState,
} from "../invariants";
import { FinancialInvariantError, ConflictError } from "@/lib/core/errors";

describe("assertNonNegativeBalance", () => {
  it("passes for zero", () => {
    expect(() => assertNonNegativeBalance(0)).not.toThrow();
  });

  it("passes for positive", () => {
    expect(() => assertNonNegativeBalance(1000)).not.toThrow();
  });

  it("throws for negative", () => {
    expect(() => assertNonNegativeBalance(-1)).toThrow(FinancialInvariantError);
  });

  it("includes label in error", () => {
    expect(() => assertNonNegativeBalance(-5, "escrow")).toThrow(/escrow/);
  });
});

describe("assertSufficientBalance", () => {
  it("passes when available >= required", () => {
    expect(() => assertSufficientBalance(1000, 500)).not.toThrow();
    expect(() => assertSufficientBalance(500, 500)).not.toThrow();
  });

  it("throws when available < required", () => {
    expect(() => assertSufficientBalance(100, 500)).toThrow(FinancialInvariantError);
  });
});

describe("assertDealStatus", () => {
  it("passes for allowed status", () => {
    expect(() => assertDealStatus("funded", ["funded", "active"], "release")).not.toThrow();
  });

  it("throws for disallowed status", () => {
    expect(() => assertDealStatus("completed", ["funded", "active"], "release")).toThrow(ConflictError);
  });

  it("handles null status", () => {
    expect(() => assertDealStatus(null, ["pending"], "fund")).toThrow(ConflictError);
  });
});

describe("assertMilestoneState", () => {
  it("passes for allowed state", () => {
    expect(() => assertMilestoneState("approved", ["approved", "submitted"], "release")).not.toThrow();
  });

  it("throws for disallowed state", () => {
    expect(() => assertMilestoneState("released", ["approved"], "release")).toThrow(ConflictError);
  });
});
