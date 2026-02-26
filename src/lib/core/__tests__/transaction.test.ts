import { describe, it, expect, vi } from "vitest";
import { runAtomic, runAtomicSimple } from "../transaction";
import { FinancialInvariantError } from "../errors";

describe("runAtomic", () => {
  it("executes successfully when validate passes", async () => {
    const result = await runAtomic({
      validate: async () => {},
      execute: async () => 42,
    });
    expect(result).toBe(42);
  });

  it("throws when validate fails", async () => {
    await expect(
      runAtomic({
        validate: async () => {
          throw new Error("precondition failed");
        },
        execute: async () => 42,
      })
    ).rejects.toThrow("precondition failed");
  });

  it("throws when execute fails", async () => {
    await expect(
      runAtomic({
        validate: async () => {},
        execute: async () => {
          throw new Error("write failed");
        },
      })
    ).rejects.toThrow("write failed");
  });

  it("runs compensate when verify fails", async () => {
    const compensate = vi.fn();

    await expect(
      runAtomic({
        validate: async () => {},
        execute: async () => "ok",
        verify: async () => {
          throw new Error("bad state");
        },
        compensate,
      })
    ).rejects.toThrow(FinancialInvariantError);

    expect(compensate).toHaveBeenCalledOnce();
  });

  it("still throws when compensate also fails", async () => {
    await expect(
      runAtomic({
        validate: async () => {},
        execute: async () => "ok",
        verify: async () => {
          throw new Error("bad");
        },
        compensate: async () => {
          throw new Error("compensate failed");
        },
      })
    ).rejects.toThrow(FinancialInvariantError);
  });
});

describe("runAtomicSimple", () => {
  it("works as shorthand", async () => {
    const result = await runAtomicSimple(
      async () => {},
      async () => "done"
    );
    expect(result).toBe("done");
  });
});
