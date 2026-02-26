/**
 * Ledger Invariant Layer — validates ledger consistency.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("ledgerInvariant");

export async function verifyLedgerIntegrity(): Promise<{ valid: boolean; details: Record<string, unknown> }> {
  try {
    const { data, error } = await supabase.rpc("verify_ledger_chain" as any);
    if (error) {
      log.error("Ledger integrity check failed", error);
      return { valid: false, details: { error: error.message } };
    }
    return { valid: (data as any)?.valid ?? false, details: data as Record<string, unknown> };
  } catch (err) {
    return { valid: false, details: { error: String(err) } };
  }
}
