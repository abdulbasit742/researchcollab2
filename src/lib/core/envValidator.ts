/**
 * Environment Validator — ensures required config exists at startup.
 * Call from main.tsx or App.tsx initialization.
 */

import { createLogger } from "./logger";

const log = createLogger("envValidator");

interface EnvRequirement {
  key: string;
  required: boolean;
  description: string;
}

const ENV_REQUIREMENTS: EnvRequirement[] = [
  { key: "VITE_SUPABASE_URL", required: true, description: "Backend URL" },
  { key: "VITE_SUPABASE_PUBLISHABLE_KEY", required: true, description: "Backend public key" },
];

/**
 * Validate that all required environment variables are present.
 * Logs warnings for missing optional vars, throws for missing required ones.
 */
export function validateEnvironment(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const req of ENV_REQUIREMENTS) {
    const value = import.meta.env[req.key];
    if (!value || value === "undefined" || value === "") {
      if (req.required) {
        missing.push(`${req.key} (${req.description})`);
      } else {
        warnings.push(`${req.key} (${req.description})`);
      }
    }
  }

  if (warnings.length > 0) {
    log.warn("Optional environment variables missing", {
      variables: warnings,
    });
  }

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(", ")}`;
    log.error(msg);
    if (import.meta.env.MODE === "production") {
      throw new Error(msg);
    }
  }
}
