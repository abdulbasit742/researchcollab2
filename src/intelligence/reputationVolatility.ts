/**
 * Reputation Volatility Monitor — tracks sudden trust changes,
 * dispute frequency spikes, and reputation instability.
 */

import { supabase } from "@/integrations/supabase/client";

export interface VolatilityReport {
  userId: string;
  volatilityIndex: number;
  stability: "stable" | "moderate" | "volatile" | "critical";
  signals: Array<{ type: string; value: number; description: string }>;
  computedAt: string;
}

export async function computeReputationVolatility(userId: string): Promise<VolatilityReport> {
  const [trustRes, historyRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("trust_score, trust_velocity_24h, dispute_rate, successful_rate").eq("user_id", userId).maybeSingle(),
    supabase.from("trust_score_history").select("new_score, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
  ]);

  const trust = trustRes.data;
  const history = historyRes.data ?? [];
  const signals: VolatilityReport["signals"] = [];

  // Velocity signal
  const velocity = trust?.trust_velocity_24h ?? 0;
  const velocityAbs = Math.abs(velocity);
  if (velocityAbs > 2) {
    signals.push({ type: "velocity_spike", value: velocity, description: `Trust velocity: ${velocity > 0 ? "+" : ""}${velocity}/24h` });
  }

  // Score variance from history
  let variance = 0;
  if (history.length >= 3) {
    const scores = history.map(h => h.new_score ?? 0);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    variance = Math.sqrt(scores.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / scores.length);
    if (variance > 5) {
      signals.push({ type: "score_variance", value: Math.round(variance * 10) / 10, description: `Trust score standard deviation: ${Math.round(variance * 10) / 10}` });
    }
  }

  // Dispute rate signal
  const disputeRate = trust?.dispute_rate ?? 0;
  if (disputeRate > 0.1) {
    signals.push({ type: "dispute_frequency", value: Math.round(disputeRate * 100), description: `Dispute rate: ${Math.round(disputeRate * 100)}%` });
  }

  // Composite volatility index (0–100)
  const volatilityIndex = Math.min(100, Math.round(
    Math.min(40, velocityAbs * 8) +
    Math.min(30, variance * 3) +
    Math.min(30, disputeRate * 200)
  ));

  const stability = volatilityIndex >= 70 ? "critical" : volatilityIndex >= 45 ? "volatile" : volatilityIndex >= 20 ? "moderate" : "stable";

  return { userId, volatilityIndex, stability, signals, computedAt: new Date().toISOString() };
}
