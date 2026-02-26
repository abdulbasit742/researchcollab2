/**
 * Environment utilities — typed access to env vars with validation.
 */

const REQUIRED_VARS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

const OPTIONAL_VARS = [
  "VITE_STRIPE_PUBLISHABLE_KEY",
  "VITE_APP_ENV",
  "VITE_APP_VERSION",
  "VITE_SUPABASE_PROJECT_ID",
] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];
type OptionalVar = (typeof OPTIONAL_VARS)[number];

/**
 * Get an env var or throw if missing.
 */
export function getEnvOrThrow(key: RequiredVar): string {
  const value = import.meta.env[key];
  if (!value || value === "undefined") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get an optional env var with fallback.
 */
export function getEnvOptional(key: OptionalVar, fallback = ""): string {
  return import.meta.env[key] ?? fallback;
}

/**
 * Current application environment.
 */
export function getAppEnv(): "development" | "staging" | "production" {
  const env = import.meta.env.MODE;
  if (env === "production") return "production";
  if (env === "staging") return "staging";
  return "development";
}

/**
 * Whether we're in production mode.
 */
export function isProduction(): boolean {
  return getAppEnv() === "production";
}

/**
 * Application version from env or fallback.
 */
export function getAppVersion(): string {
  return getEnvOptional("VITE_APP_VERSION", "0.0.0");
}

/**
 * Validate all required env vars at startup. Call from main.tsx.
 */
export function validateEnvironmentVars(): void {
  const missing: string[] = [];
  for (const key of REQUIRED_VARS) {
    const val = import.meta.env[key];
    if (!val || val === "undefined") {
      missing.push(key);
    }
  }
  if (missing.length > 0 && isProduction()) {
    throw new Error(
      `Fatal: missing required env vars in production: ${missing.join(", ")}`
    );
  }
}
