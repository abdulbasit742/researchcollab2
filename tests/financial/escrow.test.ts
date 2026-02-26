/**
 * Escrow Invariant Tests
 * Validates escrow state machine, balance constraints, and integrity checks.
 */
import { describe, it, expect } from "vitest";

// --- Pure escrow invariant logic (no DB dependency) ---

interface EscrowState {
  total_amount: number;
  locked_amount: number;
  released_amount: number;
  refunded_amount: number;
  status: string;
}

function validateEscrowInvariants(escrow: EscrowState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (escrow.total_amount <= 0) errors.push("Total amount must be positive");
  if (escrow.locked_amount < 0) errors.push("Locked amount cannot be negative");
  if (escrow.released_amount < 0) errors.push("Released amount cannot be negative");
  if (escrow.refunded_amount < 0) errors.push("Refunded amount cannot be negative");

  const sum = escrow.locked_amount + escrow.released_amount + escrow.refunded_amount;
  if (sum > escrow.total_amount) {
    errors.push(`Sum invariant violated: ${sum} > ${escrow.total_amount}`);
  }

  const VALID_STATUSES = ["created", "funded", "locked", "partially_released", "completed", "refunded", "disputed"];
  if (!VALID_STATUSES.includes(escrow.status)) {
    errors.push(`Invalid escrow status: ${escrow.status}`);
  }

  return { valid: errors.length === 0, errors };
}

function simulateRelease(escrow: EscrowState, amount: number): EscrowState {
  if (amount <= 0) throw new Error("Release amount must be positive");
  if (amount > escrow.locked_amount) throw new Error("Release exceeds locked amount");
  if (escrow.status !== "funded" && escrow.status !== "locked") {
    throw new Error(`Cannot release from status "${escrow.status}"`);
  }
  return {
    ...escrow,
    locked_amount: escrow.locked_amount - amount,
    released_amount: escrow.released_amount + amount,
    status: escrow.locked_amount - amount === 0 ? "completed" : "partially_released",
  };
}

function simulateRefund(escrow: EscrowState, amount: number): EscrowState {
  if (amount <= 0) throw new Error("Refund amount must be positive");
  if (amount > escrow.locked_amount) throw new Error("Refund exceeds locked amount");
  return {
    ...escrow,
    locked_amount: escrow.locked_amount - amount,
    refunded_amount: escrow.refunded_amount + amount,
    status: escrow.locked_amount - amount === 0 ? "refunded" : escrow.status,
  };
}

describe("Escrow Invariants", () => {
  const validEscrow: EscrowState = {
    total_amount: 10000,
    locked_amount: 10000,
    released_amount: 0,
    refunded_amount: 0,
    status: "funded",
  };

  it("validates a correctly funded escrow", () => {
    const result = validateEscrowInvariants(validEscrow);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects negative locked amount", () => {
    const result = validateEscrowInvariants({ ...validEscrow, locked_amount: -100 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Locked amount cannot be negative");
  });

  it("rejects negative released amount", () => {
    const result = validateEscrowInvariants({ ...validEscrow, released_amount: -50 });
    expect(result.valid).toBe(false);
  });

  it("rejects negative refunded amount", () => {
    const result = validateEscrowInvariants({ ...validEscrow, refunded_amount: -1 });
    expect(result.valid).toBe(false);
  });

  it("rejects sum exceeding total", () => {
    const result = validateEscrowInvariants({ ...validEscrow, released_amount: 5000, refunded_amount: 6000 });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Sum invariant violated");
  });

  it("rejects zero total amount", () => {
    const result = validateEscrowInvariants({ ...validEscrow, total_amount: 0 });
    expect(result.valid).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = validateEscrowInvariants({ ...validEscrow, status: "banana" });
    expect(result.valid).toBe(false);
  });

  it("release increases released_amount correctly", () => {
    const after = simulateRelease(validEscrow, 3000);
    expect(after.released_amount).toBe(3000);
    expect(after.locked_amount).toBe(7000);
    expect(after.status).toBe("partially_released");
    expect(validateEscrowInvariants(after).valid).toBe(true);
  });

  it("full release sets status to completed", () => {
    const after = simulateRelease(validEscrow, 10000);
    expect(after.status).toBe("completed");
    expect(after.locked_amount).toBe(0);
    expect(validateEscrowInvariants(after).valid).toBe(true);
  });

  it("double release fails — release exceeding locked", () => {
    const after1 = simulateRelease(validEscrow, 10000);
    expect(() => simulateRelease(after1, 1)).toThrow("Release exceeds locked amount");
  });

  it("release without funding fails", () => {
    const created: EscrowState = { ...validEscrow, status: "created", locked_amount: 10000 };
    expect(() => simulateRelease(created, 100)).toThrow("Cannot release from status");
  });

  it("negative release amount fails", () => {
    expect(() => simulateRelease(validEscrow, -500)).toThrow("Release amount must be positive");
  });

  it("release exceeding total fails", () => {
    expect(() => simulateRelease(validEscrow, 15000)).toThrow("Release exceeds locked amount");
  });

  it("refund increases refunded_amount correctly", () => {
    const after = simulateRefund(validEscrow, 4000);
    expect(after.refunded_amount).toBe(4000);
    expect(after.locked_amount).toBe(6000);
    expect(validateEscrowInvariants(after).valid).toBe(true);
  });

  it("full refund sets status to refunded", () => {
    const after = simulateRefund(validEscrow, 10000);
    expect(after.status).toBe("refunded");
    expect(validateEscrowInvariants(after).valid).toBe(true);
  });

  it("refund exceeding locked fails", () => {
    expect(() => simulateRefund(validEscrow, 15000)).toThrow("Refund exceeds locked amount");
  });

  it("invariant holds after mixed release + refund", () => {
    let state = simulateRelease(validEscrow, 3000);
    state = simulateRefund(state, 2000);
    expect(state.locked_amount).toBe(5000);
    expect(state.released_amount).toBe(3000);
    expect(state.refunded_amount).toBe(2000);
    expect(validateEscrowInvariants(state).valid).toBe(true);
  });
});
