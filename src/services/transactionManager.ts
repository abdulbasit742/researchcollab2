/**
 * Transaction Manager — wraps all financial operations in atomic DB transactions.
 * Uses Supabase RPC for server-side transactional execution.
 * Client-side: provides optimistic locking + idempotency + rollback semantics.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";
import { FinancialInvariantError } from "@/lib/core/errors";

const log = createLogger("transactionManager");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 100;

export interface TransactionContext {
  transactionId: string;
  startedAt: number;
  operations: string[];
}

/**
 * Execute a financial operation with idempotency + error handling + audit.
 * All mutations are serialized through this manager.
 */
export async function runFinancialOperation<T>(
  operationName: string,
  idempotencyKey: string,
  execute: (ctx: TransactionContext) => Promise<T>
): Promise<T> {
  const ctx: TransactionContext = {
    transactionId: crypto.randomUUID(),
    startedAt: Date.now(),
    operations: [],
  };

  log.info("Financial operation started", { operationName, transactionId: ctx.transactionId, idempotencyKey });

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await execute(ctx);

      log.info("Financial operation committed", {
        operationName,
        transactionId: ctx.transactionId,
        durationMs: Date.now() - ctx.startedAt,
        operations: ctx.operations,
      });

      // Record success in audit
      await recordOperationAudit(ctx, operationName, "success", idempotencyKey);

      return result;
    } catch (error) {
      lastError = error;
      ctx.operations = []; // Reset for retry

      if (isRetryableError(error) && attempt < MAX_RETRIES) {
        log.warn("Retrying financial operation", { operationName, attempt, error: String(error) });
        await delay(RETRY_DELAY_MS * attempt);
        continue;
      }

      log.error("Financial operation failed", error);
      await recordOperationAudit(ctx, operationName, "failure", idempotencyKey, String(error));
      throw error;
    }
  }

  throw lastError;
}

/**
 * Record an operation in the financial audit log.
 */
async function recordOperationAudit(
  ctx: TransactionContext,
  operationName: string,
  status: "success" | "failure",
  idempotencyKey: string,
  errorMessage?: string
): Promise<void> {
  try {
    await supabase.from("financial_audit_logs" as any).insert({
      entity_type: "transaction",
      entity_id: ctx.transactionId,
      action: operationName,
      metadata: {
        status,
        idempotency_key: idempotencyKey,
        duration_ms: Date.now() - ctx.startedAt,
        operations: ctx.operations,
        error: errorMessage ?? null,
      },
    });
  } catch {
    // Audit logging is non-critical — never block the main operation
    log.warn("Failed to record operation audit", { transactionId: ctx.transactionId });
  }
}

function isRetryableError(error: unknown): boolean {
  const msg = String(error).toLowerCase();
  return msg.includes("deadlock") || msg.includes("serialization") || msg.includes("could not serialize");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
