/**
 * Security Engine — rate limiting, IP throttling, suspicious pattern detection,
 * token validation, input sanitization, audit integrity, financial double-verification.
 */

// ─── Rate Limiting ───
const rateLimits = new Map<string, { count: number; windowStart: number }>();

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs?: number } {
  const now = Date.now();
  const entry = rateLimits.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimits.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterMs = windowMs - (now - entry.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

// ─── IP Throttling ───
const ipHistory = new Map<string, number[]>();

export function throttleIP(ip: string, maxPerMinute = 60): boolean {
  const now = Date.now();
  const history = ipHistory.get(ip) ?? [];
  const recent = history.filter(t => now - t < 60000);
  recent.push(now);
  ipHistory.set(ip, recent);
  return recent.length <= maxPerMinute;
}

// ─── Suspicious Pattern Detection ───
export interface SuspiciousActivity {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: string;
  userId?: string;
}

const suspiciousLog: SuspiciousActivity[] = [];

export function detectRapidActions(userId: string, actionType: string, windowMs = 10000, threshold = 10): boolean {
  const key = `rapid_${userId}_${actionType}`;
  const result = rateLimit(key, threshold, windowMs);

  if (!result.allowed) {
    suspiciousLog.push({
      type: "rapid_actions",
      severity: "medium",
      description: `User ${userId} exceeded ${threshold} ${actionType} actions in ${windowMs}ms`,
      detectedAt: new Date().toISOString(),
      userId,
    });
    return true;
  }
  return false;
}

export function getSuspiciousActivityLog(limit = 100): SuspiciousActivity[] {
  return suspiciousLog.slice(-limit);
}

// ─── Input Sanitization ───
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/<iframe[^>]*>/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export function validateUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function validateAmount(amount: number, min = 0, max = 10000000): boolean {
  return typeof amount === "number" && !isNaN(amount) && amount >= min && amount <= max;
}

// ─── Financial Double-Verification ───
const pendingVerifications = new Map<string, { amount: number; expiresAt: number; verified: boolean }>();

export function requestFinancialVerification(operationId: string, amount: number, ttlMs = 300000): string {
  const token = `verify_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  pendingVerifications.set(token, {
    amount,
    expiresAt: Date.now() + ttlMs,
    verified: false,
  });
  return token;
}

export function confirmFinancialVerification(token: string, expectedAmount: number): boolean {
  const entry = pendingVerifications.get(token);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    pendingVerifications.delete(token);
    return false;
  }
  if (entry.amount !== expectedAmount) return false;
  entry.verified = true;
  pendingVerifications.delete(token);
  return true;
}

// ─── Token Validation ───
export function validateBearerToken(authHeader?: string): { valid: boolean; token?: string } {
  if (!authHeader?.startsWith("Bearer ")) return { valid: false };
  const token = authHeader.slice(7);
  if (token.length < 10) return { valid: false };
  return { valid: true, token };
}

// ─── Cleanup ───
export function cleanupExpired(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of pendingVerifications) {
    if (now > entry.expiresAt) {
      pendingVerifications.delete(key);
      cleaned++;
    }
  }

  for (const [ip, timestamps] of ipHistory) {
    const recent = timestamps.filter(t => now - t < 60000);
    if (recent.length === 0) {
      ipHistory.delete(ip);
      cleaned++;
    } else {
      ipHistory.set(ip, recent);
    }
  }

  return cleaned;
}
