/**
 * Log Redaction — strips sensitive data before logging.
 */

const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, replacement: "[JWT_REDACTED]" },
  { pattern: /sk_(test|live)_[A-Za-z0-9]{20,}/g, replacement: "[STRIPE_KEY_REDACTED]" },
  { pattern: /whsec_[A-Za-z0-9]{20,}/g, replacement: "[WEBHOOK_SECRET_REDACTED]" },
  { pattern: /"(password|secret|token|api_key|private_key)"\s*:\s*"[^"]+"/gi, replacement: '"$1":"[REDACTED]"' },
  { pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, replacement: "[CARD_REDACTED]" },
];

/**
 * Redact sensitive values from a string.
 */
export function redactString(input: string): string {
  let result = input;
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Redact sensitive fields from an object (shallow).
 */
export function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const SENSITIVE_KEYS = new Set([
    "password", "secret", "token", "api_key", "private_key",
    "stripe_key", "webhook_secret", "bank_account", "card_number",
    "balance", "available_balance", "escrow_balance", "pending_balance",
  ]);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = "[REDACTED]";
    } else if (typeof value === "string") {
      result[key] = redactString(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
