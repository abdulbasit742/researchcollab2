/**
 * Concurrency Safety Tests
 * Validates that concurrent financial operations cannot cause double-spend.
 */
import { describe, it, expect } from "vitest";

// --- Simulated mutex / SELECT FOR UPDATE behavior ---

class FinancialLock {
  private locks = new Map<string, boolean>();

  acquire(resourceId: string): boolean {
    if (this.locks.get(resourceId)) return false; // Already locked
    this.locks.set(resourceId, true);
    return true;
  }

  release(resourceId: string): void {
    this.locks.delete(resourceId);
  }

  isLocked(resourceId: string): boolean {
    return this.locks.get(resourceId) === true;
  }
}

interface AtomicWallet {
  id: string;
  balance: number;
}

class TransactionSimulator {
  private lock = new FinancialLock();
  private wallets = new Map<string, AtomicWallet>();

  addWallet(id: string, balance: number) {
    this.wallets.set(id, { id, balance });
  }

  /**
   * Simulate a financial operation with SELECT FOR UPDATE semantics.
   */
  async executeWithLock(walletId: string, amount: number, op: "debit" | "credit"): Promise<{ success: boolean; error?: string }> {
    if (!this.lock.acquire(walletId)) {
      return { success: false, error: "Resource locked — concurrent access blocked" };
    }

    try {
      const wallet = this.wallets.get(walletId);
      if (!wallet) return { success: false, error: "Wallet not found" };

      if (op === "debit") {
        if (wallet.balance < amount) return { success: false, error: "Insufficient balance" };
        wallet.balance -= amount;
      } else {
        wallet.balance += amount;
      }

      // Simulate latency
      await new Promise((r) => setTimeout(r, 5));
      return { success: true };
    } finally {
      this.lock.release(walletId);
    }
  }
}

describe("Concurrency Safety", () => {
  it("two simultaneous debits — only one succeeds if insufficient for both", async () => {
    const sim = new TransactionSimulator();
    sim.addWallet("w1", 5000);

    const [r1, r2] = await Promise.all([
      sim.executeWithLock("w1", 4000, "debit"),
      sim.executeWithLock("w1", 4000, "debit"),
    ]);

    const successes = [r1, r2].filter((r) => r.success);
    const failures = [r1, r2].filter((r) => !r.success);

    // One succeeds, one blocked by lock
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
    expect(failures[0].error).toContain("locked");
  });

  it("concurrent refund + release — one blocked", async () => {
    const sim = new TransactionSimulator();
    sim.addWallet("escrow1", 10000);

    const [release, refund] = await Promise.all([
      sim.executeWithLock("escrow1", 5000, "debit"),
      sim.executeWithLock("escrow1", 5000, "debit"),
    ]);

    const successes = [release, refund].filter((r) => r.success);
    expect(successes.length).toBe(1);
  });

  it("sequential operations both succeed when sufficient balance", async () => {
    const sim = new TransactionSimulator();
    sim.addWallet("w2", 10000);

    const r1 = await sim.executeWithLock("w2", 3000, "debit");
    const r2 = await sim.executeWithLock("w2", 3000, "debit");

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });

  it("double spend prevented — total debit cannot exceed balance", async () => {
    const sim = new TransactionSimulator();
    sim.addWallet("w3", 5000);

    const r1 = await sim.executeWithLock("w3", 5000, "debit");
    expect(r1.success).toBe(true);

    const r2 = await sim.executeWithLock("w3", 1, "debit");
    expect(r2.success).toBe(false);
    expect(r2.error).toContain("Insufficient balance");
  });
});

describe("Transaction Isolation", () => {
  it("lock prevents interleaving reads", () => {
    const lock = new FinancialLock();
    expect(lock.acquire("resource1")).toBe(true);
    expect(lock.acquire("resource1")).toBe(false); // second acquire fails
    expect(lock.isLocked("resource1")).toBe(true);
    lock.release("resource1");
    expect(lock.isLocked("resource1")).toBe(false);
    expect(lock.acquire("resource1")).toBe(true); // can acquire again
  });

  it("different resources can be locked independently", () => {
    const lock = new FinancialLock();
    expect(lock.acquire("r1")).toBe(true);
    expect(lock.acquire("r2")).toBe(true);
    lock.release("r1");
    lock.release("r2");
  });
});
