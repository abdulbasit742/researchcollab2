/**
 * AI Agent Memory Service
 */
import { supabase } from "@/integrations/supabase/client";

export async function getMemories(contactId: string) {
  const { data, error } = await (supabase as any).from("omni_agent_memory").select("*").eq("contact_id", contactId).order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function setMemory(contactId: string, key: string, value: string, type: string = "preference") {
  const { data: existing } = await (supabase as any).from("omni_agent_memory").select("id").eq("contact_id", contactId).eq("memory_key", key).maybeSingle();
  if (existing) {
    const { data, error } = await (supabase as any).from("omni_agent_memory").update({ memory_value: value, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await (supabase as any).from("omni_agent_memory").insert({ contact_id: contactId, memory_type: type, memory_key: key, memory_value: value }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMemory(id: string) {
  const { error } = await (supabase as any).from("omni_agent_memory").delete().eq("id", id);
  if (error) throw error;
}
