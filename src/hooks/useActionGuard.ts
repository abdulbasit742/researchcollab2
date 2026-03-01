/**
 * useActionGuard — Prevents double-click and duplicate submissions.
 * Wraps an async action with loading state and idempotency.
 */

import { useState, useCallback, useRef } from "react";

export function useActionGuard() {
  const [isProcessing, setIsProcessing] = useState(false);
  const activeKeyRef = useRef<string | null>(null);

  /**
   * Execute an action with double-click protection.
   * Returns the action result or undefined if blocked.
   */
  const guard = useCallback(
    async <T>(
      action: () => Promise<T>,
      options?: { key?: string }
    ): Promise<T | undefined> => {
      if (isProcessing) return undefined;

      const key = options?.key || "default";
      if (activeKeyRef.current === key) return undefined;

      activeKeyRef.current = key;
      setIsProcessing(true);

      try {
        const result = await action();
        return result;
      } finally {
        setIsProcessing(false);
        activeKeyRef.current = null;
      }
    },
    [isProcessing]
  );

  return { isProcessing, guard };
}

/**
 * Generate a client-side idempotency key for financial operations.
 */
export function generateIdempotencyKey(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
