import { describe, it, expect } from "vitest";
import { runPreDeployChecks, type PreDeployResult } from "../preDeployCheck";

describe("preDeployCheck", () => {
  it("returns a result object with checks array", async () => {
    const result = await runPreDeployChecks();
    expect(result).toHaveProperty("passed");
    expect(result).toHaveProperty("checks");
    expect(Array.isArray(result.checks)).toBe(true);
  });

  it("each check has name and status", async () => {
    const result = await runPreDeployChecks();
    for (const check of result.checks) {
      expect(check).toHaveProperty("name");
      expect(check).toHaveProperty("status");
      expect(["pass", "fail", "warn"]).toContain(check.status);
    }
  });
});
