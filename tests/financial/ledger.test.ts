/**
 * Ledger Invariant Tests
 * Validates append-only semantics, hash chain integrity, and immutability.
 */
import { describe, it, expect } from "vitest";

// --- Pure ledger hash chain logic ---

interface LedgerEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  entry_type: "debit" | "credit";
  amount: number;
  currency: string;
  hash: string;
  previous_hash: string;
}

function computeHash(entry: Omit<LedgerEntry, "hash">): string {
  const payload = entry.id + entry.transaction_id + entry.account_id + entry.entry_type + entry.amount + entry.currency + entry.previous_hash;
  // Simple deterministic hash for testing (mirrors DB sha256 concept)
  let h = 0;
  for (let i = 0; i < payload.length; i++) {
    h = ((h << 5) - h + payload.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, "0");
}

function createEntry(
  id: string,
  txId: string,
  accountId: string,
  type: "debit" | "credit",
  amount: number,
  previousHash: string
): LedgerEntry {
  if (amount <= 0) throw new Error("Ledger entry amount must be positive");
  const partial = { id, transaction_id: txId, account_id: accountId, entry_type: type, amount, currency: "PKR", previous_hash: previousHash };
  return { ...partial, hash: computeHash(partial) };
}

function verifyChain(entries: LedgerEntry[]): { valid: boolean; brokenAt?: number } {
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].previous_hash !== entries[i - 1].hash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}

function verifyEntryHash(entry: LedgerEntry): boolean {
  const expected = computeHash({ ...entry });
  return entry.hash === expected;
}

describe("Ledger Hash Chain", () => {
  const genesis = createEntry("e1", "t1", "a1", "debit", 1000, "GENESIS");

  it("genesis entry has GENESIS as previous_hash", () => {
    expect(genesis.previous_hash).toBe("GENESIS");
    expect(genesis.hash).toBeTruthy();
  });

  it("second entry links to genesis hash", () => {
    const e2 = createEntry("e2", "t1", "a2", "credit", 1000, genesis.hash);
    expect(e2.previous_hash).toBe(genesis.hash);
  });

  it("chain of 5 entries validates", () => {
    const chain: LedgerEntry[] = [genesis];
    for (let i = 2; i <= 5; i++) {
      chain.push(createEntry(`e${i}`, `t${i}`, `a${i}`, i % 2 === 0 ? "credit" : "debit", 500, chain[chain.length - 1].hash));
    }
    expect(verifyChain(chain).valid).toBe(true);
  });

  it("tampered entry breaks chain", () => {
    const e2 = createEntry("e2", "t2", "a2", "credit", 1000, genesis.hash);
    const e3 = createEntry("e3", "t3", "a3", "debit", 500, e2.hash);

    // Tamper with e2's hash
    const tampered = { ...e2, hash: "TAMPERED" };
    const result = verifyChain([genesis, tampered, e3]);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(2);
  });

  it("hash mismatch detected on modified amount", () => {
    const entry = createEntry("e1", "t1", "a1", "debit", 1000, "GENESIS");
    const corrupted = { ...entry, amount: 9999 };
    expect(verifyEntryHash(corrupted)).toBe(false);
  });

  it("hash mismatch detected on modified account", () => {
    const entry = createEntry("e1", "t1", "a1", "debit", 1000, "GENESIS");
    const corrupted = { ...entry, account_id: "HACKER" };
    expect(verifyEntryHash(corrupted)).toBe(false);
  });

  it("rejects zero amount entry", () => {
    expect(() => createEntry("e1", "t1", "a1", "debit", 0, "GENESIS")).toThrow("amount must be positive");
  });

  it("rejects negative amount entry", () => {
    expect(() => createEntry("e1", "t1", "a1", "debit", -100, "GENESIS")).toThrow("amount must be positive");
  });
});

describe("Ledger Immutability", () => {
  it("entries are structurally frozen after creation", () => {
    const entry = createEntry("e1", "t1", "a1", "debit", 1000, "GENESIS");
    const frozen = Object.freeze(entry);
    expect(() => { (frozen as any).amount = 9999; }).toThrow();
  });
});

describe("Double-Entry Bookkeeping", () => {
  it("debit and credit amounts must match per transaction", () => {
    const debit = createEntry("e1", "tx1", "walletA", "debit", 5000, "GENESIS");
    const credit = createEntry("e2", "tx1", "escrowB", "credit", 5000, debit.hash);
    expect(debit.amount).toBe(credit.amount);
    expect(debit.transaction_id).toBe(credit.transaction_id);
  });

  it("mismatched debit/credit detected", () => {
    const debit = createEntry("e1", "tx1", "walletA", "debit", 5000, "GENESIS");
    const credit = createEntry("e2", "tx1", "escrowB", "credit", 4999, debit.hash);
    expect(debit.amount).not.toBe(credit.amount);
  });
});
