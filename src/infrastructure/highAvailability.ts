/**
 * High Availability — region fallback, graceful degradation,
 * circuit breaker pattern, and read-only fallback mode.
 */

import { resolveRegion, isRegionAvailable, type Region } from "./regionManager";

export type SystemMode = "full" | "read_only" | "degraded" | "maintenance";

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: "closed" | "open" | "half_open";
  threshold: number;
  resetTimeMs: number;
}

let currentMode: SystemMode = "full";
const circuitBreakers = new Map<string, CircuitBreakerState>();

// ─── System Mode ───
export function getSystemMode(): SystemMode {
  return currentMode;
}

export function setSystemMode(mode: SystemMode): void {
  currentMode = mode;
}

export function isWriteAllowed(): boolean {
  return currentMode === "full";
}

export function isReadAllowed(): boolean {
  return currentMode !== "maintenance";
}

// ─── Circuit Breaker ───
export function getCircuitBreaker(service: string, threshold = 5, resetTimeMs = 30000): CircuitBreakerState {
  if (!circuitBreakers.has(service)) {
    circuitBreakers.set(service, { failures: 0, lastFailure: 0, state: "closed", threshold, resetTimeMs });
  }
  const cb = circuitBreakers.get(service)!;

  // Auto-reset check
  if (cb.state === "open" && Date.now() - cb.lastFailure > cb.resetTimeMs) {
    cb.state = "half_open";
  }

  return cb;
}

export function recordSuccess(service: string): void {
  const cb = getCircuitBreaker(service);
  cb.failures = 0;
  cb.state = "closed";
}

export function recordFailure(service: string): void {
  const cb = getCircuitBreaker(service);
  cb.failures++;
  cb.lastFailure = Date.now();
  if (cb.failures >= cb.threshold) {
    cb.state = "open";
  }
}

export function isCircuitOpen(service: string): boolean {
  const cb = getCircuitBreaker(service);
  return cb.state === "open";
}

// ─── Resilient Execution ───
export async function withResilience<T>(
  service: string,
  fn: () => Promise<T>,
  fallback?: () => T
): Promise<T> {
  if (isCircuitOpen(service)) {
    if (fallback) return fallback();
    throw new Error(`Circuit breaker open for service: ${service}`);
  }

  try {
    const result = await fn();
    recordSuccess(service);
    return result;
  } catch (err) {
    recordFailure(service);
    if (fallback) return fallback();
    throw err;
  }
}

// ─── Region Fallback ───
export function getAvailableRegion(): Region {
  return resolveRegion();
}

export function checkRegionHealth(): { region: Region; available: boolean } {
  const region = resolveRegion();
  return { region, available: isRegionAvailable(region) };
}

// ─── Graceful Degradation ───
export function enterDegradedMode(reason: string): void {
  currentMode = "degraded";
  console.warn(`[HA] Entering degraded mode: ${reason}`);
}

export function enterMaintenanceMode(): void {
  currentMode = "maintenance";
}

export function restoreFullMode(): void {
  currentMode = "full";
}

export function getCircuitBreakerStatus(): Record<string, CircuitBreakerState> {
  const result: Record<string, CircuitBreakerState> = {};
  for (const [service, state] of circuitBreakers) {
    result[service] = { ...state };
  }
  return result;
}
