/**
 * Intake Service — Sponsor Problem Capture, Institution Onboarding, Opportunity Matching
 */
import { supabase } from "@/integrations/supabase/client";

// ─── Sponsor Intake ───

export async function getSponsorIntakeSessions(filters?: { intake_status?: string }) {
  let q = (supabase as any).from("omni_sponsor_intake_sessions").select("*").order("created_at", { ascending: false });
  if (filters?.intake_status) q = q.eq("intake_status", filters.intake_status);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function captureSponsorProblem(rawInput: string, contactId?: string, conversationId?: string, channelType?: string) {
  const { data, error } = await supabase.functions.invoke("sponsor-intake-agent", {
    body: { raw_input: rawInput, contact_id: contactId, conversation_id: conversationId, channel_type: channelType },
  });
  if (error) throw error;
  return data;
}

export async function updateIntakeStatus(id: string, status: string, notes?: string) {
  const { data, error } = await (supabase as any).from("omni_sponsor_intake_sessions").update({
    intake_status: status,
    operator_notes: notes,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getIntakeStats() {
  const { data, error } = await (supabase as any).from("omni_sponsor_intake_sessions").select("intake_status, domain_category, ai_confidence, clarity_score, fundability_score");
  if (error) throw error;
  const stats = {
    total: data?.length || 0,
    byStatus: {} as Record<string, number>,
    byDomain: {} as Record<string, number>,
    avgClarity: 0,
    avgFundability: 0,
    avgConfidence: 0,
  };
  let cSum = 0, fSum = 0, confSum = 0;
  data?.forEach((s: any) => {
    stats.byStatus[s.intake_status] = (stats.byStatus[s.intake_status] || 0) + 1;
    if (s.domain_category) stats.byDomain[s.domain_category] = (stats.byDomain[s.domain_category] || 0) + 1;
    cSum += Number(s.clarity_score) || 0;
    fSum += Number(s.fundability_score) || 0;
    confSum += Number(s.ai_confidence) || 0;
  });
  if (stats.total > 0) {
    stats.avgClarity = Math.round(cSum / stats.total);
    stats.avgFundability = Math.round(fSum / stats.total);
    stats.avgConfidence = Math.round(confSum / stats.total);
  }
  return stats;
}

// ─── Institution Onboarding ───

export async function getOnboardingSessions(filters?: { onboarding_step?: string }) {
  let q = (supabase as any).from("omni_institution_onboarding_sessions").select("*").order("created_at", { ascending: false });
  if (filters?.onboarding_step) q = q.eq("onboarding_step", filters.onboarding_step);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function startOnboarding(userMessage: string, contactId?: string, conversationId?: string, channelType?: string) {
  const { data, error } = await supabase.functions.invoke("institution-onboarding-agent", {
    body: { user_message: userMessage, contact_id: contactId, conversation_id: conversationId, channel_type: channelType },
  });
  if (error) throw error;
  return data;
}

export async function continueOnboarding(sessionId: string, userMessage: string) {
  const { data, error } = await supabase.functions.invoke("institution-onboarding-agent", {
    body: { session_id: sessionId, user_message: userMessage },
  });
  if (error) throw error;
  return data;
}

// ─── Opportunity Matching ───

export async function getOpportunityMatches(filters?: { contact_id?: string; converted?: boolean }) {
  let q = (supabase as any).from("omni_opportunity_matches").select("*").order("match_score", { ascending: false });
  if (filters?.contact_id) q = q.eq("contact_id", filters.contact_id);
  if (filters?.converted !== undefined) q = q.eq("converted", filters.converted);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function getMatchStats() {
  const { data, error } = await (supabase as any).from("omni_opportunity_matches").select("opportunity_type, match_score, notified, clicked, converted");
  if (error) throw error;
  const stats = {
    total: data?.length || 0,
    notified: 0,
    clicked: 0,
    converted: 0,
    avgScore: 0,
    byType: {} as Record<string, number>,
  };
  let scoreSum = 0;
  data?.forEach((m: any) => {
    if (m.notified) stats.notified++;
    if (m.clicked) stats.clicked++;
    if (m.converted) stats.converted++;
    scoreSum += Number(m.match_score) || 0;
    stats.byType[m.opportunity_type] = (stats.byType[m.opportunity_type] || 0) + 1;
  });
  stats.avgScore = stats.total > 0 ? Math.round(scoreSum / stats.total) : 0;
  return stats;
}

export const INTAKE_STATUSES = ["captured", "structuring", "review", "approved", "submitted_to_gpe", "rejected"];
export const ONBOARDING_STEPS = ["intro", "institution_details", "departments", "labs", "faculty", "verification", "complete"];
