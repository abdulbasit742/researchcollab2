/**
 * Session audit logging — tracks login/logout events to security audit tables.
 * Fire-and-forget; must never break auth flow.
 */
import { supabase } from "@/integrations/supabase/client";

function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  if (/Mobile|Android/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "desktop";
}

export async function logSessionStart(userId: string) {
  try {
    await (supabase as any).from("session_audit_logs").insert({
      user_id: userId,
      login_time: new Date().toISOString(),
      device_info: getDeviceInfo(),
      user_agent: navigator.userAgent.slice(0, 500),
      suspicious_flag: false,
    });
  } catch {
    // Silent — audit logging must never crash auth
  }
}

export async function logSessionEnd(userId: string) {
  try {
    // Update most recent session for this user
    const { data } = await (supabase as any)
      .from("session_audit_logs")
      .select("id")
      .eq("user_id", userId)
      .is("logout_time", null)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data?.[0]) {
      await (supabase as any)
        .from("session_audit_logs")
        .update({ logout_time: new Date().toISOString() })
        .eq("id", data[0].id);
    }
  } catch {
    // Silent
  }
}

export async function logSecurityEvent(
  actorId: string | null,
  actionType: string,
  options?: {
    entityType?: string;
    entityId?: string;
    severity?: "info" | "warning" | "critical";
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await (supabase as any).from("security_audit_logs").insert({
      actor_id: actorId,
      action_type: actionType,
      entity_type: options?.entityType || null,
      entity_id: options?.entityId || null,
      severity: options?.severity || "info",
      user_agent: navigator.userAgent.slice(0, 500),
      metadata: options?.metadata || null,
    });
  } catch {
    // Silent
  }
}
