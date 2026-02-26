/**
 * System Guard — production hardening utilities.
 *
 * Provides: error logging, retry wrapper, input validation,
 * file size validation, rate limiting, environment validation.
 */

// ─── Centralized Error Logger ───
export function logError(context: string, error: unknown, metadata?: Record<string, any>) {
  const msg = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(`[RCollab:${context}]`, msg, metadata ?? "", stack ?? "");
}

// ─── Retry Wrapper ───
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delayMs?: number; context?: string } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, context = "operation" } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        logError(context, error, { attempt, maxRetries });
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw new Error("Unreachable");
}

// ─── Input Validation ───
export function validateStringInput(
  value: string,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; pattern?: RegExp } = {}
): { valid: boolean; error?: string } {
  const { minLength = 1, maxLength = 5000, pattern } = options;
  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must be under ${maxLength} characters` };
  }
  if (pattern && !pattern.test(trimmed)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }
  return { valid: true };
}

// ─── File Validation ───
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
];

export function validateFileUpload(
  file: File,
  options: { maxSizeMB?: number; allowedTypes?: string[] } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 20, allowedTypes } = options;

  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File must be under ${maxSizeMB}MB` };
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }

  return { valid: true };
}

export function validateImageFile(file: File, maxSizeMB = 5) {
  return validateFileUpload(file, { maxSizeMB, allowedTypes: ALLOWED_IMAGE_TYPES });
}

export function validateDocumentFile(file: File, maxSizeMB = 20) {
  return validateFileUpload(file, { maxSizeMB, allowedTypes: [...ALLOWED_DOC_TYPES, ...ALLOWED_IMAGE_TYPES] });
}

// ─── Client-side Rate Limiter ───
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}

// ─── Environment Validation ───
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
  const missing = required.filter(key => !import.meta.env[key]);
  return { valid: missing.length === 0, missing };
}
