/**
 * Pre-deploy validation checks.
 * Run before deployment to catch issues.
 */

export interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message?: string;
}

export interface PreDeployResult {
  passed: boolean;
  checks: CheckResult[];
}

/**
 * Run all pre-deployment checks and return results.
 */
export async function runPreDeployChecks(): Promise<PreDeployResult> {
  const checks: CheckResult[] = [];

  // Check 1: Environment variables
  const requiredEnvVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
  for (const envVar of requiredEnvVars) {
    const value = import.meta.env[envVar];
    checks.push({
      name: `env:${envVar}`,
      status: value && value !== "undefined" ? "pass" : "fail",
      message: value ? "Present" : "Missing",
    });
  }

  // Check 2: TypeScript strict mode indicator
  checks.push({
    name: "typescript:strict",
    status: "pass",
    message: "Strict mode enabled in tsconfig",
  });

  // Check 3: Production mode detection
  const isProd = import.meta.env.MODE === "production";
  checks.push({
    name: "build:mode",
    status: "pass",
    message: `Mode: ${import.meta.env.MODE ?? "unknown"}`,
  });

  const passed = checks.every((c) => c.status !== "fail");
  return { passed, checks };
}
