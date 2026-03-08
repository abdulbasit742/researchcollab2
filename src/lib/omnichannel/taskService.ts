/**
 * Task & Follow-Up Engine — System 29
 */
import { supabase } from "@/integrations/supabase/client";

export async function getTasks(filters?: { status?: string; task_type?: string }) {
  let q = (supabase as any).from("omni_tasks").select("*, omni_contacts(display_name), omni_conversations(channel_type)").order("due_at", { ascending: true });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.task_type) q = q.eq("task_type", filters.task_type);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createTask(input: {
  conversation_id?: string; contact_id?: string; lead_id?: string;
  task_type?: string; title: string; description?: string;
  priority?: string; assigned_to?: string; due_at?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_tasks").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_tasks").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function completeTask(id: string) {
  return updateTask(id, { status: "completed", completed_at: new Date().toISOString() });
}

export const TASK_TYPES = ["follow_up", "call_back", "send_brochure", "schedule_demo", "remind_admin", "chase_onboarding", "check_resolution", "handoff_sales", "handoff_success"];
