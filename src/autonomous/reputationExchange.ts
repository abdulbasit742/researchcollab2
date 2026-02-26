/**
 * Distributed Reputation Exchange — import/export reputation snapshots,
 * normalize cross-platform trust, maintain exchange rates.
 *
 * No direct overwrite of internal trust_score. Only additive weighting within caps.
 */

import { supabase } from "@/integrations/supabase/client";

export interface ReputationSnapshot {
  userId: string;
  platformId: string;
  externalScore: number;
  normalizedScore: number;
  exchangeRate: number;
  importedAt: string;
}

export interface ExchangeRate {
  platformId: string;
  platformName: string;
  rate: number; // multiplier to normalize to RCollab scale (0–100)
  confidence: number;
  lastUpdated: string;
}

const MAX_EXTERNAL_WEIGHT = 0.10; // External rep can contribute max 10% to trust
const exchangeRates = new Map<string, ExchangeRate>();
const importedSnapshots: ReputationSnapshot[] = [];

// Default exchange rates for known platforms
const DEFAULT_RATES: ExchangeRate[] = [
  { platformId: "linkedin", platformName: "LinkedIn", rate: 0.8, confidence: 70, lastUpdated: new Date().toISOString() },
  { platformId: "github", platformName: "GitHub", rate: 0.7, confidence: 65, lastUpdated: new Date().toISOString() },
  { platformId: "upwork", platformName: "Upwork", rate: 0.75, confidence: 60, lastUpdated: new Date().toISOString() },
  { platformId: "fiverr", platformName: "Fiverr", rate: 0.6, confidence: 55, lastUpdated: new Date().toISOString() },
];

// Initialize rates
DEFAULT_RATES.forEach(r => exchangeRates.set(r.platformId, r));

export function getExchangeRate(platformId: string): ExchangeRate | undefined {
  return exchangeRates.get(platformId);
}

export function setExchangeRate(rate: ExchangeRate): void {
  exchangeRates.set(rate.platformId, { ...rate, lastUpdated: new Date().toISOString() });
}

export function normalizeExternalScore(rawScore: number, platformId: string, maxScale = 100): number {
  const rate = exchangeRates.get(platformId);
  if (!rate) return 0;
  // Normalize to 0–100
  const normalized = (rawScore / maxScale) * 100 * rate.rate;
  return Math.round(Math.max(0, Math.min(100, normalized)) * 10) / 10;
}

export async function importReputation(params: {
  userId: string;
  platformId: string;
  externalScore: number;
  maxScale?: number;
}): Promise<{ snapshot: ReputationSnapshot; adjustedContribution: number }> {
  const normalizedScore = normalizeExternalScore(params.externalScore, params.platformId, params.maxScale ?? 100);
  const rate = exchangeRates.get(params.platformId);

  const snapshot: ReputationSnapshot = {
    userId: params.userId,
    platformId: params.platformId,
    externalScore: params.externalScore,
    normalizedScore,
    exchangeRate: rate?.rate ?? 0,
    importedAt: new Date().toISOString(),
  };

  importedSnapshots.push(snapshot);
  if (importedSnapshots.length > 10000) importedSnapshots.shift();

  // Calculate capped contribution
  const adjustedContribution = Math.round(normalizedScore * MAX_EXTERNAL_WEIGHT * 10) / 10;

  // Audit log
  await supabase.from("admin_audit_logs").insert({
    admin_id: "system",
    action: "reputation_import",
    entity_type: "user",
    entity_id: params.userId,
    details: { snapshot, adjustedContribution } as any,
  });

  return { snapshot, adjustedContribution };
}

export async function exportReputationSnapshot(userId: string): Promise<{
  userId: string;
  trustScore: number;
  successRate: number;
  completedProjects: number;
  exportedAt: string;
}> {
  const { data: trust } = await supabase
    .from("user_trust_profiles")
    .select("trust_score, successful_rate, total_projects_completed")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    userId,
    trustScore: trust?.trust_score ?? 0,
    successRate: trust?.successful_rate ?? 0,
    completedProjects: trust?.total_projects_completed ?? 0,
    exportedAt: new Date().toISOString(),
  };
}

export function getImportedSnapshots(userId?: string): ReputationSnapshot[] {
  if (userId) return importedSnapshots.filter(s => s.userId === userId);
  return [...importedSnapshots];
}

export function getAllExchangeRates(): ExchangeRate[] {
  return Array.from(exchangeRates.values());
}
