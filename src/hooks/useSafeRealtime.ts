/**
 * useSafeRealtime — realtime hook with automatic cleanup on deps change and unmount.
 * Prevents subscription stacking and memory leaks.
 */

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface SafeRealtimeConfig {
  /** Unique channel name */
  channel: string;
  /** Table to subscribe to */
  table: string;
  /** Event filter */
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  /** Row-level filter (e.g., "user_id=eq.abc") */
  filter?: string;
  /** Callback on change */
  onMessage: (payload: unknown) => void;
  /** Disable subscription */
  disabled?: boolean;
}

/**
 * Safe realtime subscription — cleans up on every dep change and unmount.
 * Only one active channel per instance, guaranteed.
 */
export function useSafeRealtime(config: SafeRealtimeConfig) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cleanupRef = useRef(false);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    cleanupRef.current = false;

    if (config.disabled) {
      cleanup();
      return;
    }

    // Always clean previous before creating new
    cleanup();

    const pgConfig: Record<string, string> = {
      event: config.event ?? "*",
      schema: "public",
      table: config.table,
    };
    if (config.filter) pgConfig.filter = config.filter;

    const channel = supabase
      .channel(config.channel)
      .on("postgres_changes" as any, pgConfig, (payload: unknown) => {
        if (!cleanupRef.current) {
          config.onMessage(payload);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      cleanupRef.current = true;
      cleanup();
    };
  }, [config.channel, config.table, config.event, config.filter, config.disabled]);
}
