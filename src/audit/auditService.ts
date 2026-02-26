/**
 * Audit Service — records every financial mutation.
 * Non-blocking: audit failures never block the main operation.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("auditService");

export const auditService = {
  async log(params: {
    entityType: string;
    entityId: string;
    action: string;
    actorId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await (supabase as any).from("financial_audit_logs").insert({
        entity_type: params.entityType,
        entity_id: params.entityId,
        action: params.action,
        actor_id: params.actorId ?? null,
        metadata: params.metadata ?? {},
      });
    } catch (err) {
      log.warn("Audit log insert failed (non-blocking)", { error: String(err), ...params });
    }
  },
};
