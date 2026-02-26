/**
 * useRealtimeSubscription — safe realtime hook with automatic cleanup.
 * Prevents duplicate channels and memory leaks.
 */

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface SubscriptionConfig {
  channelName: string;
  table: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onPayload: (payload: unknown) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription(config: SubscriptionConfig) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (config.enabled === false) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const pgConfig: Record<string, string> = {
      event: config.event ?? "*",
      schema: "public",
      table: config.table,
    };
    if (config.filter) pgConfig.filter = config.filter;

    const channel = supabase
      .channel(config.channelName)
      .on("postgres_changes" as any, pgConfig, config.onPayload as any)
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [config.channelName, config.table, config.event, config.filter, config.enabled]);
}

export function useMultiRealtimeSubscription(configs: SubscriptionConfig[]) {
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
    channelsRef.current = [];

    const activeConfigs = configs.filter((c) => c.enabled !== false);

    for (const config of activeConfigs) {
      const pgConfig: Record<string, string> = {
        event: config.event ?? "*",
        schema: "public",
        table: config.table,
      };
      if (config.filter) pgConfig.filter = config.filter;

      const channel = supabase
        .channel(config.channelName)
        .on("postgres_changes" as any, pgConfig, config.onPayload as any)
        .subscribe();

      channelsRef.current.push(channel);
    }

    return () => {
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [configs.map((c) => c.channelName).join(",")]);
}
