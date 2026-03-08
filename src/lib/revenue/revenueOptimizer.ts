/**
 * Revenue Optimization Service — analyzes platform activity for revenue opportunities.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Revenue Signals ───
export async function getRevenueSignals(filters?: { signal_type?: string; status?: string }) {
  let q = supabase.from("rev_signals").select("*").order("created_at", { ascending: false }).limit(50);
  if (filters?.signal_type) q = q.eq("signal_type", filters.signal_type);
  if (filters?.status) q = q.eq("status", filters.status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function actionSignal(id: string, userId: string) {
  const { error } = await supabase.from("rev_signals").update({ status: "actioned", actioned_at: new Date().toISOString(), actioned_by: userId }).eq("id", id);
  if (error) throw error;
}

// ─── Sponsor Leads ───
export async function getSponsorLeads(status?: string) {
  let q = supabase.from("rev_sponsor_leads").select("*").order("match_score", { ascending: false }).limit(50);
  if (status) q = q.eq("outreach_status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function updateSponsorLead(id: string, updates: { outreach_status?: string; notes?: string }) {
  const { error } = await supabase.from("rev_sponsor_leads").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// ─── Premium Candidates ───
export async function getPremiumCandidates(status?: string) {
  let q = supabase.from("rev_premium_candidates").select("*").order("engagement_score", { ascending: false }).limit(50);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Pricing Experiments ───
export async function getPricingExperiments(status?: string) {
  let q = supabase.from("rev_pricing_experiments").select("*").order("created_at", { ascending: false }).limit(20);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createPricingExperiment(params: {
  experiment_name: string;
  target_segment: string;
  pricing_model: Record<string, any>;
  control_model?: Record<string, any>;
  hypothesis?: string;
  created_by?: string;
}) {
  const { error } = await supabase.from("rev_pricing_experiments").insert([params]);
  if (error) throw error;
}

export async function updateExperimentStatus(id: string, status: string) {
  const updates: Record<string, any> = { status };
  if (status === "running") updates.started_at = new Date().toISOString();
  if (status === "completed") updates.ended_at = new Date().toISOString();
  const { error } = await supabase.from("rev_pricing_experiments").update(updates).eq("id", id);
  if (error) throw error;
}

// ─── Forecasts ───
export async function getForecasts(type?: string) {
  let q = supabase.from("rev_forecasts").select("*").order("created_at", { ascending: false }).limit(20);
  if (type) q = q.eq("forecast_type", type);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

// ─── Alerts ───
export async function getRevenueAlerts(acknowledged?: boolean) {
  let q = supabase.from("rev_alerts").select("*").order("created_at", { ascending: false }).limit(50);
  if (acknowledged !== undefined) q = q.eq("acknowledged", acknowledged);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function acknowledgeAlert(id: string, userId: string) {
  const { error } = await supabase.from("rev_alerts").update({ acknowledged: true, acknowledged_by: userId, acknowledged_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// ─── AI Invocation ───
export async function invokeRevOptimizer(action: string, payload: Record<string, any>) {
  const { data, error } = await supabase.functions.invoke("rev-optimizer", {
    body: { action, payload },
  });
  if (error) throw error;
  return data?.result ?? data;
}

// ─── Dashboard Aggregation ───
export async function getRevenueDashboardData() {
  const [signals, leads, candidates, experiments, forecasts, alerts] = await Promise.all([
    getRevenueSignals({ status: "active" }),
    getSponsorLeads(),
    getPremiumCandidates(),
    getPricingExperiments(),
    getForecasts(),
    getRevenueAlerts(false),
  ]);

  const totalPotential = signals.reduce((s: number, sig: any) => s + (sig.revenue_potential ?? 0), 0);
  const totalEstimatedUpgrade = candidates.reduce((s: number, c: any) => s + (c.estimated_revenue ?? 0), 0);

  return {
    signals, leads, candidates, experiments, forecasts, alerts,
    summary: {
      activeSignals: signals.length,
      sponsorLeads: leads.length,
      premiumCandidates: candidates.length,
      activeExperiments: experiments.filter((e: any) => e.status === "running").length,
      pendingAlerts: alerts.length,
      totalRevenuePotential: totalPotential,
      totalUpgradeRevenue: totalEstimatedUpgrade,
    },
  };
}
