/**
 * Milestone Invariant Tests
 * Validates milestone constraints against escrow totals.
 */
import { describe, it, expect } from "vitest";

interface Milestone {
  id: string;
  amount: number;
  status: "pending" | "submitted" | "approved" | "released" | "rejected";
}

function validateMilestoneSum(milestones: Milestone[], escrowTotal: number): { valid: boolean; sum: number; error?: string } {
  const sum = milestones.reduce((acc, m) => acc + m.amount, 0);
  if (sum > escrowTotal) {
    return { valid: false, sum, error: `Milestone sum (${sum}) exceeds escrow total (${escrowTotal})` };
  }
  return { valid: true, sum };
}

function canApproveMilestone(milestone: Milestone, escrowStatus: string): { allowed: boolean; reason?: string } {
  if (milestone.status === "released") return { allowed: false, reason: "Already released — double approval prevented" };
  if (milestone.status !== "submitted") return { allowed: false, reason: `Status "${milestone.status}" cannot be approved` };
  if (!["funded", "locked", "partially_released"].includes(escrowStatus)) {
    return { allowed: false, reason: `Escrow status "${escrowStatus}" does not permit approval` };
  }
  if (milestone.amount <= 0) return { allowed: false, reason: "Invalid milestone amount" };
  return { allowed: true };
}

describe("Milestone Sum Constraint", () => {
  it("milestones within escrow total pass", () => {
    const ms: Milestone[] = [
      { id: "m1", amount: 3000, status: "pending" },
      { id: "m2", amount: 4000, status: "pending" },
      { id: "m3", amount: 3000, status: "pending" },
    ];
    const result = validateMilestoneSum(ms, 10000);
    expect(result.valid).toBe(true);
    expect(result.sum).toBe(10000);
  });

  it("milestones exceeding escrow total fail", () => {
    const ms: Milestone[] = [
      { id: "m1", amount: 6000, status: "pending" },
      { id: "m2", amount: 5000, status: "pending" },
    ];
    const result = validateMilestoneSum(ms, 10000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exceeds escrow total");
  });

  it("empty milestones are valid", () => {
    expect(validateMilestoneSum([], 10000).valid).toBe(true);
  });
});

describe("Milestone Approval Guard", () => {
  it("submitted milestone with funded escrow can be approved", () => {
    expect(canApproveMilestone({ id: "m1", amount: 5000, status: "submitted" }, "funded").allowed).toBe(true);
  });

  it("already released milestone cannot be approved again", () => {
    const result = canApproveMilestone({ id: "m1", amount: 5000, status: "released" }, "funded");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("double approval");
  });

  it("pending milestone cannot be approved", () => {
    const result = canApproveMilestone({ id: "m1", amount: 5000, status: "pending" }, "funded");
    expect(result.allowed).toBe(false);
  });

  it("milestone with unfunded escrow cannot be approved", () => {
    const result = canApproveMilestone({ id: "m1", amount: 5000, status: "submitted" }, "created");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("does not permit");
  });

  it("zero amount milestone cannot be approved", () => {
    const result = canApproveMilestone({ id: "m1", amount: 0, status: "submitted" }, "funded");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Invalid milestone amount");
  });
});
