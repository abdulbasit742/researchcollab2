/**
 * Financial invariant tests — ensures wallet math is never broken.
 */
import { describe, it, expect } from "vitest";

describe("Financial Invariants (Pure Logic)", () => {
  const applyDeposit = (balance: number, amount: number) => {
    if (amount <= 0) throw new Error("Deposit must be positive");
    return balance + amount;
  };

  const applyWithdrawal = (balance: number, amount: number) => {
    if (amount <= 0) throw new Error("Withdrawal must be positive");
    if (balance < amount) throw new Error("Insufficient balance");
    return balance - amount;
  };

  const applyEscrowLock = (available: number, escrow: number, amount: number) => {
    if (available < amount) throw new Error("Insufficient for escrow");
    return { available: available - amount, escrow: escrow + amount };
  };

  const applyEscrowRelease = (
    clientEscrow: number,
    executorAvailable: number,
    amount: number
  ) => {
    if (clientEscrow < amount) throw new Error("Insufficient escrow");
    return {
      clientEscrow: clientEscrow - amount,
      executorAvailable: executorAvailable + amount,
    };
  };

  describe("Balance never negative", () => {
    it("deposit always increases balance", () => {
      expect(applyDeposit(0, 100)).toBe(100);
      expect(applyDeposit(500, 1)).toBe(501);
    });

    it("withdrawal never goes below zero", () => {
      expect(applyWithdrawal(100, 100)).toBe(0);
      expect(() => applyWithdrawal(50, 100)).toThrow("Insufficient");
    });

    it("cannot withdraw zero or negative", () => {
      expect(() => applyWithdrawal(100, 0)).toThrow("positive");
      expect(() => applyWithdrawal(100, -10)).toThrow("positive");
    });
  });

  describe("Escrow lock/release conservation", () => {
    it("total funds conserved during lock", () => {
      const { available, escrow } = applyEscrowLock(5000, 0, 2000);
      expect(available + escrow).toBe(5000); // Conservation law
    });

    it("total funds conserved during release", () => {
      const clientBefore = 3000;
      const execBefore = 1000;
      const total = clientBefore + execBefore;

      const { clientEscrow, executorAvailable } = applyEscrowRelease(clientBefore, execBefore, 1000);
      expect(clientEscrow + executorAvailable).toBe(total);
    });

    it("cannot lock more than available", () => {
      expect(() => applyEscrowLock(100, 0, 500)).toThrow("Insufficient");
    });

    it("cannot release more than escrowed", () => {
      expect(() => applyEscrowRelease(100, 0, 500)).toThrow("Insufficient");
    });
  });

  describe("Double-operation prevention", () => {
    it("two sequential withdrawals respect remaining balance", () => {
      let balance = 1000;
      balance = applyWithdrawal(balance, 600);
      expect(balance).toBe(400);
      expect(() => applyWithdrawal(balance, 600)).toThrow("Insufficient");
    });

    it("full escrow → release cycle is balanced", () => {
      let clientAvailable = 10000;
      let clientEscrow = 0;
      let executorBalance = 0;

      // Lock
      const lock = applyEscrowLock(clientAvailable, clientEscrow, 5000);
      clientAvailable = lock.available;
      clientEscrow = lock.escrow;

      // Release
      const release = applyEscrowRelease(clientEscrow, executorBalance, 5000);
      clientEscrow = release.clientEscrow;
      executorBalance = release.executorAvailable;

      expect(clientAvailable).toBe(5000);
      expect(clientEscrow).toBe(0);
      expect(executorBalance).toBe(5000);
      expect(clientAvailable + clientEscrow + executorBalance).toBe(10000);
    });
  });

  describe("Milestone double-release prevention", () => {
    it("cannot release same milestone twice", () => {
      const releasedMilestones = new Set<string>();
      
      const releaseMilestone = (id: string, escrow: number, amount: number) => {
        if (releasedMilestones.has(id)) throw new Error("Already released");
        if (escrow < amount) throw new Error("Insufficient escrow");
        releasedMilestones.add(id);
        return escrow - amount;
      };

      let escrow = 5000;
      escrow = releaseMilestone("ms-1", escrow, 2000);
      expect(escrow).toBe(3000);

      expect(() => releaseMilestone("ms-1", escrow, 2000)).toThrow("Already released");
    });
  });
});
