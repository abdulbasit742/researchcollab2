/**
 * Request Queue — lightweight client-side queue for heavy operations.
 * No business logic mutation.
 */

import { supabase } from "@/integrations/supabase/client";

export type QueueStatus = "queued" | "processing" | "completed" | "failed";

interface QueueEntry {
  request_type: string;
  entity_id?: string;
  priority?: number;
}

export async function enqueue(entry: QueueEntry): Promise<string | null> {
  try {
    const { data } = await (supabase as any).from("request_processing_queue").insert({
      request_type: entry.request_type,
      entity_id: entry.entity_id ?? null,
      status: "queued",
      priority: entry.priority ?? 5,
    }).select("id").single();
    return data?.id ?? null;
  } catch {
    return null;
  }
}

export async function getQueueStatus(id: string): Promise<QueueStatus | null> {
  try {
    const { data } = await (supabase as any)
      .from("request_processing_queue")
      .select("status")
      .eq("id", id)
      .single();
    return data?.status ?? null;
  } catch {
    return null;
  }
}

export async function getQueueDepth(): Promise<number> {
  try {
    const { count } = await (supabase as any)
      .from("request_processing_queue")
      .select("id", { count: "exact", head: true })
      .in("status", ["queued", "processing"]);
    return count ?? 0;
  } catch {
    return 0;
  }
}
