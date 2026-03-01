import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useSuperAdminAudit() {
  const { user } = useAuth();

  const logAction = useCallback(async (
    actionType: string,
    targetEntityType?: string,
    targetEntityId?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;
    try {
      await (supabase as any).from("super_admin_activity_log").insert({
        super_admin_id: user.id,
        action_type: actionType,
        target_entity_type: targetEntityType ?? null,
        target_entity_id: targetEntityId ?? null,
        metadata: metadata ?? {},
      });
    } catch (err) {
      console.error("Super admin audit log failed:", err);
    }
  }, [user]);

  return { logAction };
}
