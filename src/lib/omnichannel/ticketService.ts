/**
 * Support Ticket Service — System 10
 */
import { supabase } from "@/integrations/supabase/client";

export async function getTickets(filters?: { status?: string; priority?: string; category?: string }) {
  let q = (supabase as any).from("omni_support_tickets").select("*, omni_contacts(display_name, email), omni_conversations(channel_type)").order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.priority) q = q.eq("priority", filters.priority);
  if (filters?.category) q = q.eq("category", filters.category);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createTicket(input: {
  conversation_id?: string; contact_id?: string; subject: string;
  description?: string; category?: string; priority?: string; assigned_to?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_support_tickets").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateTicket(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_support_tickets").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getTicketStats() {
  const { data, error } = await (supabase as any).from("omni_support_tickets").select("status, priority, category");
  if (error) throw error;
  const stats = { total: data?.length || 0, open: 0, resolved: 0, byPriority: {} as Record<string, number>, byCategory: {} as Record<string, number> };
  data?.forEach((t: any) => {
    if (t.status === "open" || t.status === "in_progress") stats.open++;
    if (t.status === "resolved") stats.resolved++;
    stats.byPriority[t.priority] = (stats.byPriority[t.priority] || 0) + 1;
    stats.byCategory[t.category] = (stats.byCategory[t.category] || 0) + 1;
  });
  return stats;
}

export const TICKET_CATEGORIES = ["general", "escrow", "milestones", "projects", "institutions", "sponsors", "billing", "technical", "account", "compliance"];
export const TICKET_PRIORITIES = ["low", "medium", "high", "critical"];
