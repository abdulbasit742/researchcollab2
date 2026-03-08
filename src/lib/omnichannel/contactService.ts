/**
 * Omnichannel Contact & Identity Resolution Service
 */
import { supabase } from "@/integrations/supabase/client";

export async function getContacts(filters?: { lead_status?: string; contact_type?: string }) {
  let q = (supabase as any).from("omni_contacts").select("*").order("updated_at", { ascending: false });
  if (filters?.lead_status) q = q.eq("lead_status", filters.lead_status);
  if (filters?.contact_type) q = q.eq("contact_type", filters.contact_type);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function getContact(id: string) {
  const { data, error } = await (supabase as any).from("omni_contacts").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createContact(input: {
  display_name?: string; email?: string; phone?: string;
  contact_type?: string; preferred_channel?: string; country?: string;
}) {
  const { data, error } = await (supabase as any).from("omni_contacts").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateContact(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("omni_contacts").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

/** Identity resolution: find existing contact by email or phone */
export async function resolveIdentity(signals: { email?: string; phone?: string; linked_user_id?: string }) {
  if (signals.linked_user_id) {
    const { data } = await (supabase as any).from("omni_contacts").select("*").eq("linked_user_id", signals.linked_user_id).maybeSingle();
    if (data) return data;
  }
  if (signals.email) {
    const { data } = await (supabase as any).from("omni_contacts").select("*").eq("email", signals.email).maybeSingle();
    if (data) return data;
  }
  if (signals.phone) {
    const { data } = await (supabase as any).from("omni_contacts").select("*").eq("phone", signals.phone).maybeSingle();
    if (data) return data;
  }
  return null;
}

export async function updateLeadScore(contactId: string, delta: number) {
  const contact = await getContact(contactId);
  const newScore = Math.max(0, Math.min(100, (contact.lead_score || 0) + delta));
  return updateContact(contactId, { lead_score: newScore });
}

export const LEAD_STATUSES = ["new", "qualified", "demo_scheduled", "proposal_sent", "negotiating", "won", "lost"];
export const CONTACT_TYPES = ["anonymous", "student", "researcher", "supervisor", "sponsor", "institution_admin", "enterprise", "government"];
