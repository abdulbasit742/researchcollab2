/**
 * useRealtimeManager — Central realtime subscription manager.
 * Prevents duplicate subscriptions and ensures cleanup on unmount.
 */
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeConfig {
  channelName: string;
  table: string;
  schema?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onPayload: (payload: any) => void;
  enabled?: boolean;
  /** Debounce ms for high-frequency updates */
  debounceMs?: number;
}

export function useRealtimeManager(config: RealtimeConfig) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (config.enabled === false) {
      cleanup();
      return;
    }

    // Prevent duplicate subscription
    if (channelRef.current) cleanup();

    const pgConfig: any = {
      event: config.event || "*",
      schema: config.schema || "public",
      table: config.table,
    };
    if (config.filter) pgConfig.filter = config.filter;

    const handler = config.debounceMs
      ? (payload: any) => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => config.onPayload(payload), config.debounceMs);
        }
      : config.onPayload;

    const channel = supabase
      .channel(config.channelName)
      .on("postgres_changes" as any, pgConfig, handler)
      .subscribe();

    channelRef.current = channel;

    return cleanup;
  }, [config.channelName, config.table, config.event, config.filter, config.enabled]);

  return { cleanup };
}
