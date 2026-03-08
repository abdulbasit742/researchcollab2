/**
 * Growth Automation Service — Nurture sequences, follow-ups, enrollment management
 */
import { supabase } from "@/integrations/supabase/client";

export interface AutomationSequence {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_conditions: any;
  target_segment: string;
  channel: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface AutomationStep {
  id: string;
  sequence_id: string;
  step_order: number;
  step_type: string;
  delay_minutes: number;
  content: any;
  conditions: any;
  created_at: string;
}

export interface AutomationEnrollment {
  id: string;
  sequence_id: string;
  contact_id: string;
  current_step: number;
  status: string;
  enrolled_at: string;
  completed_at: string | null;
  last_step_at: string | null;
}

export async function fetchSequences() {
  const { data, error } = await (supabase as any).from("omni_automation_sequences").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AutomationSequence[];
}

export async function createSequence(seq: Partial<AutomationSequence>) {
  const { data, error } = await (supabase as any).from("omni_automation_sequences").insert(seq).select().single();
  if (error) throw error;
  return data;
}

export async function updateSequence(id: string, updates: Partial<AutomationSequence>) {
  const { data, error } = await (supabase as any).from("omni_automation_sequences").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function fetchSteps(sequenceId: string) {
  const { data, error } = await (supabase as any).from("omni_automation_steps").select("*").eq("sequence_id", sequenceId).order("step_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as AutomationStep[];
}

export async function addStep(step: Partial<AutomationStep>) {
  const { data, error } = await (supabase as any).from("omni_automation_steps").insert(step).select().single();
  if (error) throw error;
  return data;
}

export async function fetchEnrollments(sequenceId?: string) {
  let q = (supabase as any).from("omni_automation_enrollments").select("*").order("enrolled_at", { ascending: false });
  if (sequenceId) q = q.eq("sequence_id", sequenceId);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return (data ?? []) as AutomationEnrollment[];
}

export async function enrollContact(sequenceId: string, contactId: string) {
  const { data, error } = await (supabase as any).from("omni_automation_enrollments").insert({
    sequence_id: sequenceId,
    contact_id: contactId,
    status: "active",
  }).select().single();
  if (error) throw error;
  return data;
}

export function getAutomationAnalytics(sequences: AutomationSequence[], enrollments: AutomationEnrollment[]) {
  const active = sequences.filter(s => s.is_active).length;
  const totalEnrollments = enrollments.length;
  const activeEnrollments = enrollments.filter(e => e.status === "active").length;
  const completedEnrollments = enrollments.filter(e => e.status === "completed").length;
  const byChannel = sequences.reduce((acc, s) => {
    acc[s.channel] = (acc[s.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return { active, totalSequences: sequences.length, totalEnrollments, activeEnrollments, completedEnrollments, byChannel };
}
