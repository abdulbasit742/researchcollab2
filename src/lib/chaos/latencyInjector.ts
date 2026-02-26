/**
 * Latency Injector — adds artificial delays to simulate network/DB lag.
 */

import { isChaosEnabled, chaosProbability } from "./chaosController";

/**
 * Inject a random delay (0–maxMs) if chaos is enabled.
 */
export async function injectLatency(maxMs = 1000, probability = 0.3): Promise<number> {
  if (!isChaosEnabled() || !chaosProbability(probability)) return 0;
  const delay = Math.floor(Math.random() * maxMs);
  await new Promise((resolve) => setTimeout(resolve, delay));
  return delay;
}

/**
 * Wrap an async function with optional latency injection.
 */
export async function withLatency<T>(fn: () => Promise<T>, maxMs = 1000): Promise<T> {
  await injectLatency(maxMs);
  return fn();
}
