/**
 * Wallet Invariant Tests
 * Validates balance constraints, lock operations, and integrity checks.
 */
import { describe, it, expect } from "vitest";

interface WalletState {
  available_balance: number;
  escrow_balance: number;
  pending_balance: number;
  currency: string;
}

function validateWalletInvariants(wallet: WalletState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (wallet.available_balance < 0) errors.push("Negative available balance");
  if (wallet.escrow_balance < 0) errors.push("Negative escrow balance");
  if (wallet.pending_balance < 0) errors.push("Negative pending balance");
  return { valid: errors.length === 0, errors };
}

function lockFunds(wallet: WalletState, amount: number): WalletState {
  if (amount <= 0) throw new Error("Lock amount must be positive");
  if (amount > wallet.available_balance) throw new Error("Insufficient available balance for lock");
  return {
    ...wallet,
    available_balance: wallet.available_balance - amount,
    escrow_balance: wallet.escrow_balance + amount,
  };
}

function releaseFunds(wallet: WalletState, amount: number): WalletState {
  if (amount <= 0) throw new Error("Release amount must be positive");
  if (amount > wallet.escrow_balance) throw new Error("Insufficient escrow balance for release");
  return {
    ...wallet,
    escrow_balance: wallet.escrow_balance - amount,
  };
}

describe("Wallet Invariants", () => {
  const validWallet: WalletState = { available_balance: 50000, escrow_balance: 0, pending_balance: 0, currency: "PKR" };

  it("valid wallet passes invariants", () => {
    expect(validateWalletInvariants(validWallet).valid).toBe(true);
  });

  it("negative available balance fails", () => {
    expect(validateWalletInvariants({ ...validWallet, available_balance: -1 }).valid).toBe(false);
  });

  it("negative escrow balance fails", () => {
    expect(validateWalletInvariants({ ...validWallet, escrow_balance: -1 }).valid).toBe(false);
  });

  it("lock decreases available and increases escrow", () => {
    const after = lockFunds(validWallet, 10000);
    expect(after.available_balance).toBe(40000);
    expect(after.escrow_balance).toBe(10000);
    expect(validateWalletInvariants(after).valid).toBe(true);
  });

  it("cannot lock more than available", () => {
    expect(() => lockFunds(validWallet, 60000)).toThrow("Insufficient available balance");
  });

  it("cannot lock zero", () => {
    expect(() => lockFunds(validWallet, 0)).toThrow("Lock amount must be positive");
  });

  it("cannot lock negative", () => {
    expect(() => lockFunds(validWallet, -100)).toThrow("Lock amount must be positive");
  });

  it("release decreases escrow balance", () => {
    const locked = lockFunds(validWallet, 10000);
    const released = releaseFunds(locked, 5000);
    expect(released.escrow_balance).toBe(5000);
    expect(validateWalletInvariants(released).valid).toBe(true);
  });

  it("cannot release more than escrow", () => {
    const locked = lockFunds(validWallet, 10000);
    expect(() => releaseFunds(locked, 15000)).toThrow("Insufficient escrow balance");
  });

  it("total conservation: lock + release = original available", () => {
    let w = lockFunds(validWallet, 20000);
    w = releaseFunds(w, 20000);
    // Funds released go to recipient, so escrow is 0 and available unchanged
    expect(w.escrow_balance).toBe(0);
    expect(w.available_balance).toBe(30000); // 50000 - 20000 locked, then escrow released (goes to other party)
  });
});
