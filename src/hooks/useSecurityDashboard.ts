/**
 * Hooks for the admin security dashboard.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRateLimitLogs() {
  return useQuery({
    queryKey: ["rate-limit-logs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("rate_limit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Array<{
        id: string;
        user_id: string | null;
        endpoint: string;
        blocked: boolean;
        request_count: number;
        created_at: string;
      }>;
    },
    staleTime: 30_000,
  });
}

export function useSessionAuditLogs() {
  return useQuery({
    queryKey: ["session-audit-logs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("session_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Array<{
        id: string;
        user_id: string;
        login_time: string;
        logout_time: string | null;
        device_info: string | null;
        suspicious_flag: boolean;
        suspicious_reason: string | null;
        created_at: string;
      }>;
    },
    staleTime: 30_000,
  });
}

export function useSecurityAuditLogs() {
  return useQuery({
    queryKey: ["security-audit-logs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("security_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Array<{
        id: string;
        actor_id: string | null;
        action_type: string;
        entity_type: string | null;
        entity_id: string | null;
        severity: string;
        user_agent: string | null;
        created_at: string;
      }>;
    },
    staleTime: 30_000,
  });
}

export function useStorageSecurityLogs() {
  return useQuery({
    queryKey: ["storage-security-logs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("storage_security_logs")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Array<{
        id: string;
        artifact_id: string | null;
        file_name: string | null;
        mime_verified: boolean;
        size_valid: boolean;
        signature_valid: boolean;
        rejection_reason: string | null;
        checked_at: string;
      }>;
    },
    staleTime: 60_000,
  });
}

export function useRlsAuditHistory() {
  return useQuery({
    queryKey: ["rls-audit-history"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("rls_audit_history")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Array<{
        id: string;
        table_name: string;
        issue_detected: string | null;
        severity: string;
        checked_at: string;
      }>;
    },
    staleTime: 60_000,
  });
}
