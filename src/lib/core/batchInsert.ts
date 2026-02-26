/**
 * Batch insert utility — reduces DB round-trips for bulk operations.
 * Used for notifications, audit logs, and transaction records.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("batchInsert");

/**
 * Batch insert rows into a table. Falls back to sequential inserts on error.
 */
export async function batchInsert<T extends Record<string, unknown>>(
  table: string,
  rows: T[]
): Promise<{ inserted: number; errors: number }> {
  if (rows.length === 0) return { inserted: 0, errors: 0 };

  // Try single batch insert first
  const { error } = await (supabase as any).from(table).insert(rows);

  if (!error) {
    return { inserted: rows.length, errors: 0 };
  }

  // Fallback: insert one by one
  log.warn(`Batch insert to ${table} failed, falling back to sequential`, { count: rows.length });
  let inserted = 0;
  let errors = 0;

  for (const row of rows) {
    const { error: rowErr } = await (supabase as any).from(table).insert(row);
    if (rowErr) {
      errors++;
      log.error(`Sequential insert failed for ${table}`, rowErr);
    } else {
      inserted++;
    }
  }

  return { inserted, errors };
}

/**
 * Batch insert with chunking — for large sets, chunk into groups to avoid payload limits.
 */
export async function batchInsertChunked<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  chunkSize = 50
): Promise<{ inserted: number; errors: number }> {
  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const result = await batchInsert(table, chunk);
    totalInserted += result.inserted;
    totalErrors += result.errors;
  }

  return { inserted: totalInserted, errors: totalErrors };
}
