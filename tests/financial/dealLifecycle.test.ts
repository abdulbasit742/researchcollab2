/**
 * Deal Lifecycle State Machine Tests
 * Validates strict state transitions — no skipping, no invalid jumps.
 */
import { describe, it, expect } from "vitest";
import {
  validateDealTransition,
  isValidTransition,
  getAllowedTransitions,
  isTerminalState,
  type DealStatus,
} from "@/lib/deals/dealLifecycle";
import { ConflictError } from "@/lib/core/errors";

describe("Deal State Transitions", () => {
  // Valid forward transitions
  const validPaths: [DealStatus, DealStatus][] = [
    ["draft", "submitted"],
    ["submitted", "accepted"],
    ["accepted", "escrow_funded"],
    ["escrow_funded", "in_progress"],
    ["in_progress", "milestone_submitted"],
    ["milestone_submitted", "milestone_approved"],
    ["milestone_approved", "completed"],
  ];

  validPaths.forEach(([from, to]) => {
    it(`allows ${from} → ${to}`, () => {
      expect(() => validateDealTransition(from, to)).not.toThrow();
      expect(isValidTransition(from, to)).toBe(true);
    });
  });

  // Invalid skip transitions
  const invalidSkips: [DealStatus, DealStatus][] = [
    ["draft", "escrow_funded"],
    ["draft", "in_progress"],
    ["draft", "completed"],
    ["submitted", "in_progress"],
    ["accepted", "in_progress"],
    ["escrow_funded", "completed"],
    ["in_progress", "completed"],
  ];

  invalidSkips.forEach(([from, to]) => {
    it(`rejects skip ${from} → ${to}`, () => {
      expect(() => validateDealTransition(from, to)).toThrow(ConflictError);
      expect(isValidTransition(from, to)).toBe(false);
    });
  });

  // Terminal states
  it("completed is terminal", () => {
    expect(isTerminalState("completed")).toBe(true);
    expect(getAllowedTransitions("completed")).toHaveLength(0);
  });

  it("cancelled is terminal", () => {
    expect(isTerminalState("cancelled")).toBe(true);
    expect(getAllowedTransitions("cancelled")).toHaveLength(0);
  });

  it("draft is not terminal", () => {
    expect(isTerminalState("draft")).toBe(false);
  });

  // Cancellation allowed from most states
  const cancellableStates: DealStatus[] = ["draft", "submitted", "accepted", "escrow_funded", "in_progress"];
  cancellableStates.forEach((state) => {
    it(`allows ${state} → cancelled`, () => {
      expect(isValidTransition(state, "cancelled")).toBe(true);
    });
  });

  // Cannot cancel from completed
  it("cannot cancel from completed", () => {
    expect(isValidTransition("completed", "cancelled")).toBe(false);
  });

  // Dispute transitions
  it("allows escrow_funded → disputed", () => {
    expect(isValidTransition("escrow_funded", "disputed")).toBe(true);
  });

  it("allows in_progress → disputed", () => {
    expect(isValidTransition("in_progress", "disputed")).toBe(true);
  });

  it("allows disputed → in_progress (resolution)", () => {
    expect(isValidTransition("disputed", "in_progress")).toBe(true);
  });

  it("allows disputed → cancelled", () => {
    expect(isValidTransition("disputed", "cancelled")).toBe(true);
  });

  // Unknown state
  it("rejects unknown state", () => {
    expect(() => validateDealTransition("banana" as any, "draft")).toThrow(ConflictError);
  });

  it("isValidTransition returns false for unknown state", () => {
    expect(isValidTransition("unknown" as any, "draft")).toBe(false);
  });
});
