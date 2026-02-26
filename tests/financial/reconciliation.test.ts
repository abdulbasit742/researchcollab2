/**
 * Reconciliation Tests
 * Validates that wallet + escrow + ledger totals always match.
 */
import { describe, it, expect } from "vitest";

interface ReconciliationState {
  wallets: Array<{ id: string; available: number; escrow: number }>;
  escrows: Array<{ id: string; locked: number; released: number; refunded: number; total: number }>;
  ledger: Array<{ type: "debit" | "credit"; amount: number; account_id: string }>;
}

function reconcile(state: ReconciliationState): { balanced: boolean; discrepancies: string[] } {
  const discrepancies: string[] = [];

  // 1. Each escrow sum invariant
  for (const e of state.escrows) {
    const sum = e.locked + e.released + e.refunded;
    if (sum > e.total) {
      discrepancies.push(`Escrow ${e.id}: sum ${sum} > total ${e.total}`);
    }
  }

  // 2. Total wallet escrow = total escrow locked
  const totalWalletEscrow = state.wallets.reduce((s, w) => s + w.escrow, 0);
  const totalEscrowLocked = state.escrows.reduce((s, e) => s + e.locked, 0);
  if (Math.abs(totalWalletEscrow - totalEscrowLocked) > 0.01) {
    discrepancies.push(`Wallet escrow total (${totalWalletEscrow}) != escrow locked total (${totalEscrowLocked})`);
  }

  // 3. Ledger balance: sum of debits = sum of credits
  const totalDebits = state.ledger.filter((l) => l.type === "debit").reduce((s, l) => s + l.amount, 0);
  const totalCredits = state.ledger.filter((l) => l.type === "credit").reduce((s, l) => s + l.amount, 0);
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    discrepancies.push(`Ledger imbalance: debits=${totalDebits}, credits=${totalCredits}`);
  }

  // 4. No negative wallet balances
  for (const w of state.wallets) {
    if (w.available < 0) discrepancies.push(`Wallet ${w.id}: negative available ${w.available}`);
    if (w.escrow < 0) discrepancies.push(`Wallet ${w.id}: negative escrow ${w.escrow}`);
  }

  return { balanced: discrepancies.length === 0, discrepancies };
}

describe("Daily Reconciliation", () => {
  it("balanced system passes reconciliation", () => {
    const state: ReconciliationState = {
      wallets: [
        { id: "w1", available: 40000, escrow: 10000 },
        { id: "w2", available: 25000, escrow: 0 },
      ],
      escrows: [{ id: "e1", locked: 10000, released: 0, refunded: 0, total: 10000 }],
      ledger: [
        { type: "debit", amount: 10000, account_id: "w1" },
        { type: "credit", amount: 10000, account_id: "e1" },
      ],
    };
    expect(reconcile(state).balanced).toBe(true);
  });

  it("detects wallet-escrow mismatch", () => {
    const state: ReconciliationState = {
      wallets: [{ id: "w1", available: 40000, escrow: 8000 }],
      escrows: [{ id: "e1", locked: 10000, released: 0, refunded: 0, total: 10000 }],
      ledger: [
        { type: "debit", amount: 10000, account_id: "w1" },
        { type: "credit", amount: 10000, account_id: "e1" },
      ],
    };
    const result = reconcile(state);
    expect(result.balanced).toBe(false);
    expect(result.discrepancies[0]).toContain("Wallet escrow total");
  });

  it("detects ledger corruption", () => {
    const state: ReconciliationState = {
      wallets: [{ id: "w1", available: 40000, escrow: 10000 }],
      escrows: [{ id: "e1", locked: 10000, released: 0, refunded: 0, total: 10000 }],
      ledger: [
        { type: "debit", amount: 10000, account_id: "w1" },
        { type: "credit", amount: 9000, account_id: "e1" }, // Corrupted!
      ],
    };
    const result = reconcile(state);
    expect(result.balanced).toBe(false);
    expect(result.discrepancies[0]).toContain("Ledger imbalance");
  });

  it("detects escrow sum violation", () => {
    const state: ReconciliationState = {
      wallets: [{ id: "w1", available: 40000, escrow: 10000 }],
      escrows: [{ id: "e1", locked: 10000, released: 5000, refunded: 0, total: 10000 }],
      ledger: [
        { type: "debit", amount: 10000, account_id: "w1" },
        { type: "credit", amount: 10000, account_id: "e1" },
      ],
    };
    expect(reconcile(state).balanced).toBe(false);
  });

  it("after partial release — reconciliation passes", () => {
    const state: ReconciliationState = {
      wallets: [
        { id: "w1", available: 40000, escrow: 7000 },
        { id: "w2", available: 28000, escrow: 0 },
      ],
      escrows: [{ id: "e1", locked: 7000, released: 3000, refunded: 0, total: 10000 }],
      ledger: [
        { type: "debit", amount: 10000, account_id: "w1" },
        { type: "credit", amount: 10000, account_id: "e1" },
        { type: "debit", amount: 3000, account_id: "e1" },
        { type: "credit", amount: 3000, account_id: "w2" },
      ],
    };
    expect(reconcile(state).balanced).toBe(true);
  });

  it("multi-escrow system reconciles correctly", () => {
    const state: ReconciliationState = {
      wallets: [
        { id: "w1", available: 30000, escrow: 15000 },
        { id: "w2", available: 20000, escrow: 5000 },
      ],
      escrows: [
        { id: "e1", locked: 10000, released: 0, refunded: 0, total: 10000 },
        { id: "e2", locked: 5000, released: 0, refunded: 0, total: 5000 },
        { id: "e3", locked: 5000, released: 0, refunded: 0, total: 5000 },
      ],
      ledger: [
        { type: "debit", amount: 10000, account_id: "w1" },
        { type: "credit", amount: 10000, account_id: "e1" },
        { type: "debit", amount: 5000, account_id: "w1" },
        { type: "credit", amount: 5000, account_id: "e2" },
        { type: "debit", amount: 5000, account_id: "w2" },
        { type: "credit", amount: 5000, account_id: "e3" },
      ],
    };
    expect(reconcile(state).balanced).toBe(true);
  });
});
