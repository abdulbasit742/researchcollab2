/**
 * AI Lead Intelligence Service — Predictive lead scoring and qualification
 */
import { supabase } from "@/integrations/supabase/client";

export interface LeadScore {
  id: string;
  contact_id: string;
  score_type: string;
  score_value: number;
  factors: any;
  computed_at: string;
}

export async function fetchLeadScores(contactId?: string) {
  let q = (supabase as any).from("omni_lead_scores").select("*").order("computed_at", { ascending: false });
  if (contactId) q = q.eq("contact_id", contactId);
  const { data, error } = await q.limit(500);
  if (error) throw error;
  return (data ?? []) as LeadScore[];
}

export async function computeLeadScore(contactId: string, signals: {
  messageCount?: number;
  responseRate?: number;
  channelCount?: number;
  hasInstitution?: boolean;
  hasBudget?: boolean;
  intentSignals?: string[];
  sentimentAvg?: number;
}) {
  let score = 0;
  const factors: Record<string, number> = {};

  // Engagement signals (max 30)
  const engagement = Math.min(30, (signals.messageCount || 0) * 2);
  factors.engagement = engagement;
  score += engagement;

  // Response rate (max 15)
  const responsiveness = Math.round((signals.responseRate || 0) * 15);
  factors.responsiveness = responsiveness;
  score += responsiveness;

  // Multi-channel presence (max 10)
  const channelBreadth = Math.min(10, (signals.channelCount || 1) * 3);
  factors.channel_breadth = channelBreadth;
  score += channelBreadth;

  // Institution affiliation (max 15)
  const institutional = signals.hasInstitution ? 15 : 0;
  factors.institutional = institutional;
  score += institutional;

  // Budget intent (max 20)
  const budgetIntent = signals.hasBudget ? 20 : 0;
  factors.budget_intent = budgetIntent;
  score += budgetIntent;

  // Sentiment (max 10)
  const sentiment = Math.round(((signals.sentimentAvg || 0.5) + 0.5) * 5);
  factors.sentiment = Math.min(10, sentiment);
  score += factors.sentiment;

  score = Math.min(100, score);

  const { data, error } = await (supabase as any).from("omni_lead_scores").insert({
    contact_id: contactId,
    score_type: "predictive",
    score_value: score,
    factors,
  }).select().single();
  if (error) throw error;
  return data;
}

export function getLeadIntelligenceAnalytics(scores: LeadScore[]) {
  if (!scores.length) return { avgScore: 0, hotLeads: 0, warmLeads: 0, coldLeads: 0, distribution: [] };
  const avgScore = scores.reduce((s, l) => s + Number(l.score_value), 0) / scores.length;
  const hotLeads = scores.filter(s => s.score_value >= 70).length;
  const warmLeads = scores.filter(s => s.score_value >= 40 && s.score_value < 70).length;
  const coldLeads = scores.filter(s => s.score_value < 40).length;
  const distribution = [
    { name: "Hot (70+)", value: hotLeads },
    { name: "Warm (40-69)", value: warmLeads },
    { name: "Cold (<40)", value: coldLeads },
  ];
  return { avgScore: Math.round(avgScore), hotLeads, warmLeads, coldLeads, distribution };
}
