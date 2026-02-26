/**
 * Transaction wrapper — compensating rollback pattern for client-side atomicity.
 *
 * Since we cannot use true DB transactions from the Supabase JS client,
 * this implements an ordered-write + validation approach:
 *   1. Validate preconditions
 *   2. Execute ordered writes
 *   3. Re-validate final state
 *   4. If final validation fails, attempt compensating rollback
 */

import { FinancialInvariantError } from "./errors";
import { createLogger } from "./logger";

const log = createLogger("transaction");

interface AtomicOperation<T> {
  /** Validate preconditions before any writes */
  validate: () => Promise<void>;
  /** Execute the writes in order */
  execute: () => Promise<T>;
  /** Verify final state is consistent */
  verify?: () => Promise<void>;
  /** Compensating action if verify fails */
  compensate?: () => Promise<void>;
}

/**
 * Run an atomic operation with validation and optional compensating rollback.
 */
export async function runAtomic<T>(op: AtomicOperation<T>): Promise<T> {
  // Step 1: Validate preconditions
  await op.validate();

  // Step 2: Execute
  let result: T;
  try {
    result = await op.execute();
  } catch (err) {
    log.error("Atomic execute failed", err);
    throw err;
  }

  // Step 3: Verify (optional)
  if (op.verify) {
    try {
      await op.verify();
    } catch (verifyErr) {
      log.error("Atomic verify failed, attempting compensate", verifyErr);
      // Step 4: Compensate if possible
      if (op.compensate) {
        try {
          await op.compensate();
          log.warn("Compensating rollback succeeded");
        } catch (compErr) {
          log.error("CRITICAL: Compensating rollback also failed", compErr);
        }
      }
      throw new FinancialInvariantError(
        "Operation failed post-execution verification. State may be inconsistent.",
        { originalError: String(verifyErr) }
      );
    }
  }

  return result;
}

/**
 * Simple atomic wrapper for operations that don't need compensation.
 */
export async function runAtomicSimple<T>(
  validate: () => Promise<void>,
  execute: () => Promise<T>
): Promise<T> {
  return runAtomic({ validate, execute });
}
