/**
 * Wallet Domain Service — unit tests.
 * Tests business logic in isolation by mocking the repository layer.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Must use inline factory for vi.mock hoisting
vi.mock("../repository", () => ({
  findByUserId: vi.fn(),
  createWallet: vi.fn(),
  updateBalances: vi.fn(),
  insertTransaction: vi.fn(),
  listTransactions: vi.fn(),
}));

vi.mock("@/lib/core/transaction", () => ({
  runAtomic: vi.fn(async (op: { validate: () => Promise<void>; execute: () => Promise<unknown> }) => {
    await op.validate();
    return op.execute();
  }),
}));

vi.mock("@/lib/core/validation", () => ({
  validateWalletAmount: vi.fn((n: number) => {
    if (n <= 0 || !Number.isFinite(n)) throw new Error("Invalid amount");
    return n;
  }),
}));

vi.mock("@/lib/security/invariants", () => ({
  assertNonNegativeBalance: vi.fn((b: number) => {
    if (b < 0) throw new Error("Negative balance");
  }),
  assertSufficientBalance: vi.fn((a: number, r: number) => {
    if (a < r) throw new Error("Insufficient balance");
  }),
}));

vi.mock("@/lib/core/logger", () => ({
  createLogger: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

vi.mock("@/lib/security/guards", () => ({
  logAudit: vi.fn(),
}));

// Import after mocks
import * as repo from "../repository";
import * as walletService from "../walletDomainService";

const mockRepo = vi.mocked(repo);

const makeWallet = (overrides = {}) => ({
  id: "wallet-1",
  user_id: "user-1",
  available_balance: 5000,
  escrow_balance: 0,
  pending_balance: 0,
  total_earned: 5000,
  total_spent: 0,
  currency: "PKR",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  circular_flow_score: 0,
  fraud_flags: null,
  frozen_reason: null,
  is_frozen: false,
  last_activity_at: null,
  lifetime_volume: 0,
  risk_score: 0,
  total_withdrawn: 0,
  trust_multiplier: 1,
  wallet_health_score: 100,
  ...overrides,
} as any);

describe("walletDomainService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreateWallet", () => {
    it("returns existing wallet", async () => {
      const w = makeWallet();
      mockRepo.findByUserId.mockResolvedValue(w);
      const result = await walletService.getOrCreateWallet("user-1");
      expect(result).toBe(w);
      expect(mockRepo.createWallet).not.toHaveBeenCalled();
    });

    it("creates wallet if none exists", async () => {
      const w = makeWallet();
      mockRepo.findByUserId.mockResolvedValue(null);
      mockRepo.createWallet.mockResolvedValue(w);
      const result = await walletService.getOrCreateWallet("user-1");
      expect(result).toBe(w);
      expect(mockRepo.createWallet).toHaveBeenCalledWith("user-1");
    });
  });

  describe("deposit", () => {
    it("deposits and updates balance + transaction", async () => {
      const w = makeWallet({ available_balance: 1000, total_earned: 1000 });
      mockRepo.findByUserId.mockResolvedValue(null);
      mockRepo.createWallet.mockResolvedValue(w);
      mockRepo.updateBalances.mockResolvedValue(undefined);
      mockRepo.insertTransaction.mockResolvedValue(undefined);

      const result = await walletService.deposit("user-1", 500);
      expect(result).toEqual({ success: true, newBalance: 1500 });
    });
  });

  describe("requestWithdrawal", () => {
    it("throws if wallet not found in validate", async () => {
      mockRepo.findByUserId.mockResolvedValue(null);
      await expect(walletService.requestWithdrawal("user-1", 100)).rejects.toThrow();
    });

    it("moves from available to pending", async () => {
      const w = makeWallet({ available_balance: 2000, pending_balance: 0 });
      mockRepo.findByUserId.mockResolvedValue(w);
      mockRepo.updateBalances.mockResolvedValue(undefined);
      mockRepo.insertTransaction.mockResolvedValue(undefined);

      const result = await walletService.requestWithdrawal("user-1", 500);
      expect(result).toEqual({ success: true, newBalance: 1500 });
    });
  });

  describe("lockForEscrow", () => {
    it("locks funds from available to escrow", async () => {
      const w = makeWallet({ available_balance: 3000 });
      mockRepo.findByUserId.mockResolvedValue(null);
      mockRepo.createWallet.mockResolvedValue(w);
      mockRepo.updateBalances.mockResolvedValue(undefined);
      mockRepo.insertTransaction.mockResolvedValue(undefined);

      await walletService.lockForEscrow("user-1", 1000, "deal-1", "Test Deal");

      expect(mockRepo.updateBalances).toHaveBeenCalledWith("wallet-1", {
        available_balance: 2000,
        escrow_balance: 1000,
        total_spent: 1000,
      });
    });

    it("throws if insufficient balance", async () => {
      const w = makeWallet({ available_balance: 100 });
      mockRepo.findByUserId.mockResolvedValue(null);
      mockRepo.createWallet.mockResolvedValue(w);

      await expect(
        walletService.lockForEscrow("user-1", 5000, "deal-1", "Deal")
      ).rejects.toThrow("Insufficient balance");
    });
  });

  describe("releaseEscrowToExecutor", () => {
    it("moves funds from client escrow to executor available", async () => {
      const clientWallet = makeWallet({ id: "cw", escrow_balance: 2000, available_balance: 0 });
      const executorWallet = makeWallet({ id: "ew", user_id: "exec-1", available_balance: 500, total_earned: 500 });

      mockRepo.findByUserId
        .mockResolvedValueOnce(clientWallet)
        .mockResolvedValueOnce(executorWallet);
      mockRepo.updateBalances.mockResolvedValue(undefined);
      mockRepo.insertTransaction.mockResolvedValue(undefined);

      await walletService.releaseEscrowToExecutor("user-1", "exec-1", 1000, "ms-1", "Milestone 1");

      expect(mockRepo.updateBalances).toHaveBeenCalledTimes(2);
    });

    it("throws if client escrow insufficient", async () => {
      const clientWallet = makeWallet({ id: "cw", escrow_balance: 100 });
      mockRepo.findByUserId.mockResolvedValue(clientWallet);

      await expect(
        walletService.releaseEscrowToExecutor("user-1", "exec-1", 500, "ms-1", "MS")
      ).rejects.toThrow("Insufficient");
    });
  });

  describe("refundEscrow", () => {
    it("returns funds to client available balance", async () => {
      const w = makeWallet({ available_balance: 1000, escrow_balance: 2000 });
      mockRepo.findByUserId.mockResolvedValue(w);
      mockRepo.updateBalances.mockResolvedValue(undefined);
      mockRepo.insertTransaction.mockResolvedValue(undefined);

      await walletService.refundEscrow("user-1", 2000, "deal-1", "Deal");

      expect(mockRepo.updateBalances).toHaveBeenCalledWith("wallet-1", {
        available_balance: 3000,
        escrow_balance: 0,
      });
    });

    it("skips zero amount refund", async () => {
      await walletService.refundEscrow("user-1", 0, "deal-1", "Deal");
      expect(mockRepo.updateBalances).not.toHaveBeenCalled();
    });
  });
});
