/**
 * Cross-Module Invariant Tests
 * Validates that escrow + wallet + ledger invariants hold together.
 */
import { describe, it, expect } from "vitest";

// --- Unified financial state model ---

interface FinancialSnapshot {
  wallet_available: number;
  wallet_escrow: number;
  escrow_locked: number;
  escrow_released: number;
  escrow_refunded: number;
  escrow_total: number;
  ledger_debits: number;
  ledger_credits: number;
}

function validateFullInvariant(snap: FinancialSnapshot): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Wallet non-negative
  if (snap.wallet_available < 0) errors.push("Wallet available balance negative");
  if (snap.wallet_escrow < 0) errors.push("Wallet escrow balance negative");

  // Escrow sum invariant
  const escrowSum = snap.escrow_locked + snap.escrow_released + snap.escrow_refunded;
  if (escrowSum > snap.escrow_total) {
    errors.push(`Escrow sum ${escrowSum} exceeds total ${snap.escrow_total}`);
  }

  // Double-entry balance: debits must equal credits
  if (Math.abs(snap.ledger_debits - snap.ledger_credits) > 0.01) {
    errors.push(`Ledger imbalance: debits=${snap.ledger_debits}, credits=${snap.ledger_credits}`);
  }

  // Wallet escrow should match escrow locked
  if (Math.abs(snap.wallet_escrow - snap.escrow_locked) > 0.01) {
    errors.push(`Wallet escrow (${snap.wallet_escrow}) != escrow locked (${snap.escrow_locked})`);
  }

  return { valid: errors.length === 0, errors };
}

describe("Full Financial Invariants", () => {
  it("balanced state passes all checks", () => {
    const snap: FinancialSnapshot = {
      wallet_available: 40000,
      wallet_escrow: 10000,
      escrow_locked: 10000,
      escrow_released: 0,
      escrow_refunded: 0,
      escrow_total: 10000,
      ledger_debits: 10000,
      ledger_credits: 10000,
    };
    expect(validateFullInvariant(snap).valid).toBe(true);
  });

  it("detects wallet-escrow mismatch", () => {
    const snap: FinancialSnapshot = {
      wallet_available: 40000,
      wallet_escrow: 8000, // should be 10000
      escrow_locked: 10000,
      escrow_released: 0,
      escrow_refunded: 0,
      escrow_total: 10000,
      ledger_debits: 10000,
      ledger_credits: 10000,
    };
    const result = validateFullInvariant(snap);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Wallet escrow");
  });

  it("detects ledger imbalance", () => {
    const snap: FinancialSnapshot = {
      wallet_available: 40000,
      wallet_escrow: 10000,
      escrow_locked: 10000,
      escrow_released: 0,
      escrow_refunded: 0,
      escrow_total: 10000,
      ledger_debits: 10000,
      ledger_credits: 9500,
    };
    const result = validateFullInvariant(snap);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Ledger imbalance");
  });

  it("detects escrow sum violation", () => {
    const snap: FinancialSnapshot = {
      wallet_available: 40000,
      wallet_escrow: 10000,
      escrow_locked: 10000,
      escrow_released: 5000,
      escrow_refunded: 0,
      escrow_total: 10000,
      ledger_debits: 10000,
      ledger_credits: 10000,
    };
    const result = validateFullInvariant(snap);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Escrow sum");
  });

  it("detects negative wallet balance", () => {
    const snap: FinancialSnapshot = {
      wallet_available: -100,
      wallet_escrow: 10000,
      escrow_locked: 10000,
      escrow_released: 0,
      escrow_refunded: 0,
      escrow_total: 10000,
      ledger_debits: 10000,
      ledger_credits: 10000,
    };
    expect(validateFullInvariant(snap).valid).toBe(false);
  });

  it("after partial release — invariants hold", () => {
    const snap: FinancialSnapshot = {
      wallet_available: 40000,
      wallet_escrow: 7000,
      escrow_locked: 7000,
      escrow_released: 3000,
      escrow_refunded: 0,
      escrow_total: 10000,
      ledger_debits: 10000,
      ledger_credits: 10000,
    };
    expect(validateFullInvariant(snap).valid).toBe(true);
  });
});
