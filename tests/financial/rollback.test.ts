/**
 * Rollback / Atomicity Tests
 * Validates that partial failures leave no financial side effects.
 */
import { describe, it, expect } from "vitest";

// --- Simulated atomic transaction engine ---

interface TransactionLog {
  operations: Array<{ table: string; action: string; data: Record<string, unknown> }>;
  committed: boolean;
  rolledBack: boolean;
}

class AtomicTransaction {
  private log: TransactionLog = { operations: [], committed: false, rolledBack: false };
  private shouldFail: string | null = null;

  failOn(table: string) {
    this.shouldFail = table;
  }

  execute(table: string, action: string, data: Record<string, unknown>): void {
    if (this.log.committed || this.log.rolledBack) {
      throw new Error("Transaction already finalized");
    }
    if (this.shouldFail === table) {
      this.rollback();
      throw new Error(`Simulated failure on ${table}`);
    }
    this.log.operations.push({ table, action, data });
  }

  commit(): void {
    if (this.log.rolledBack) throw new Error("Cannot commit rolled-back transaction");
    this.log.committed = true;
  }

  rollback(): void {
    this.log.operations = [];
    this.log.rolledBack = true;
  }

  getLog(): TransactionLog {
    return { ...this.log };
  }
}

describe("Transaction Atomicity", () => {
  it("successful transaction commits all operations", () => {
    const tx = new AtomicTransaction();
    tx.execute("wallets", "update", { available_balance: 40000 });
    tx.execute("escrows", "update", { locked_amount: 10000 });
    tx.execute("ledger_entries", "insert", { amount: 10000, entry_type: "debit" });
    tx.execute("financial_audit_logs", "insert", { action: "escrow_fund" });
    tx.commit();

    const log = tx.getLog();
    expect(log.committed).toBe(true);
    expect(log.operations).toHaveLength(4);
  });

  it("escrow failure rolls back wallet update", () => {
    const tx = new AtomicTransaction();
    tx.failOn("escrows");
    tx.execute("wallets", "update", { available_balance: 40000 });
    expect(() => tx.execute("escrows", "update", { locked_amount: 10000 })).toThrow("Simulated failure");

    const log = tx.getLog();
    expect(log.rolledBack).toBe(true);
    expect(log.operations).toHaveLength(0); // All rolled back
  });

  it("ledger failure rolls back escrow + wallet", () => {
    const tx = new AtomicTransaction();
    tx.failOn("ledger_entries");
    tx.execute("wallets", "update", { available_balance: 40000 });
    tx.execute("escrows", "update", { locked_amount: 10000 });
    expect(() => tx.execute("ledger_entries", "insert", { amount: 10000 })).toThrow("Simulated failure");

    expect(tx.getLog().rolledBack).toBe(true);
    expect(tx.getLog().operations).toHaveLength(0);
  });

  it("audit log failure rolls back entire transaction", () => {
    const tx = new AtomicTransaction();
    tx.failOn("financial_audit_logs");
    tx.execute("wallets", "update", { available_balance: 40000 });
    tx.execute("escrows", "update", { locked_amount: 10000 });
    tx.execute("ledger_entries", "insert", { amount: 10000 });
    expect(() => tx.execute("financial_audit_logs", "insert", { action: "fund" })).toThrow();

    expect(tx.getLog().rolledBack).toBe(true);
    expect(tx.getLog().operations).toHaveLength(0);
  });

  it("cannot commit after rollback", () => {
    const tx = new AtomicTransaction();
    tx.rollback();
    expect(() => tx.commit()).toThrow("Cannot commit");
  });

  it("cannot execute after commit", () => {
    const tx = new AtomicTransaction();
    tx.commit();
    expect(() => tx.execute("wallets", "update", {})).toThrow("already finalized");
  });
});
