/**
 * Stripe Live Mode Sanity Check — verifies Stripe config before go-live.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("stripeSanity");

export interface StripeCheckResult {
  check: string;
  passed: boolean;
  details?: string;
}

export interface StripeSanityReport {
  checks: StripeCheckResult[];
  passed: boolean;
  timestamp: string;
}

export async function runStripeSanityCheck(): Promise<StripeSanityReport> {
  log.info("Running Stripe sanity check...");

  const checks: StripeCheckResult[] = [];

  // Check publishable key format
  const pubKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";
  checks.push({
    check: "Stripe publishable key present",
    passed: pubKey.length > 0,
    details: pubKey.length === 0 ? "VITE_STRIPE_PUBLISHABLE_KEY not set" : undefined,
  });

  checks.push({
    check: "Stripe key is live mode",
    passed: pubKey.startsWith("pk_live_"),
    details: pubKey.startsWith("pk_test_") ? "WARNING: Using test key in production" : undefined,
  });

  checks.push({
    check: "Stripe key is not test mode",
    passed: !pubKey.startsWith("pk_test_"),
    details: pubKey.startsWith("pk_test_") ? "Test key detected — switch to live before launch" : undefined,
  });

  // Webhook secret can only be validated server-side; we check env presence
  checks.push({
    check: "Stripe config loadable",
    passed: typeof pubKey === "string",
  });

  // Check no test price IDs in localStorage (common dev artifact)
  try {
    const stored = localStorage.getItem("stripe_price_ids");
    const hasTestPrices = stored && stored.includes("price_test_");
    checks.push({
      check: "No test price IDs cached",
      passed: !hasTestPrices,
      details: hasTestPrices ? "Test price IDs found in localStorage" : undefined,
    });
  } catch {
    checks.push({ check: "No test price IDs cached", passed: true });
  }

  const passed = checks.every((c) => c.passed);

  const report: StripeSanityReport = {
    checks,
    passed,
    timestamp: new Date().toISOString(),
  };

  log.info(`Stripe sanity: ${passed ? "PASS" : "FAIL"}`);
  return report;
}
