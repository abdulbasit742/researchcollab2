import { supabase } from "@/integrations/supabase/client";

/**
 * Macro Risk Engine — country/national/global scoring and risk modeling.
 *
 * Uses existing tables: countries, country_economic_profiles (if exists),
 * user_trust_profiles, deal_rooms, organizations.
 *
 * Computes:
 *   - Country completion rates
 *   - Average trust per country
 *   - Capital density
 *   - Dispute frequency
 *   - Institutional strength index
 *   - National score (0–100)
 */

export interface CountryRiskProfile {
  countryId: string;
  countryName: string;
  nationalScore: number;
  avgTrustScore: number;
  completionRate: number;
  disputeFrequency: number;
  capitalDensity: number;
  institutionalStrength: number;
  userCount: number;
}

export async function computeNationalScores(): Promise<CountryRiskProfile[]> {
  // Get countries with organizations
  const { data: countries } = await supabase
    .from("countries")
    .select("id, name, code")
    .order("name");

  if (!countries || countries.length === 0) return [];

  // Get org counts per country
  const { data: orgs } = await supabase
    .from("organizations")
    .select("country, status")
    .not("country", "is", null);

  const orgsByCountry: Record<string, number> = {};
  const verifiedByCountry: Record<string, number> = {};
  for (const org of orgs ?? []) {
    if (!org.country) continue;
    orgsByCountry[org.country] = (orgsByCountry[org.country] ?? 0) + 1;
    if (org.status === "verified") {
      verifiedByCountry[org.country] = (verifiedByCountry[org.country] ?? 0) + 1;
    }
  }

  // Get profiles with location (use location field as country proxy)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, location")
    .not("location", "is", null);

  const usersByCountry: Record<string, string[]> = {};
  for (const p of profiles ?? []) {
    if (!p.location) continue;
    if (!usersByCountry[p.location]) usersByCountry[p.location] = [];
    usersByCountry[p.location].push(p.id);
  }

  // Batch trust data
  const { data: allTrust } = await supabase
    .from("user_trust_profiles")
    .select("user_id, trust_score, successful_rate, dispute_rate")
    .limit(1000);

  const trustByUser: Record<string, any> = {};
  for (const t of allTrust ?? []) {
    trustByUser[t.user_id] = t;
  }

  const results: CountryRiskProfile[] = [];

  for (const country of countries) {
    const name = country.name;
    const users = usersByCountry[name] ?? [];
    if (users.length === 0) continue;

    const trustProfiles = users.map(u => trustByUser[u]).filter(Boolean);

    const avgTrustScore = trustProfiles.length > 0
      ? Math.round(trustProfiles.reduce((s: number, t: any) => s + (t.trust_score ?? 0), 0) / trustProfiles.length)
      : 0;

    const completionRate = trustProfiles.length > 0
      ? Math.round(trustProfiles.reduce((s: number, t: any) => s + (t.successful_rate ?? 0), 0) / trustProfiles.length * 100)
      : 0;

    const disputeFrequency = trustProfiles.length > 0
      ? Math.round(trustProfiles.reduce((s: number, t: any) => s + (t.dispute_rate ?? 0), 0) / trustProfiles.length * 100)
      : 0;

    const institutionalStrength = Math.min(100, Math.round(((verifiedByCountry[name] ?? 0) / 10) * 100));
    const capitalDensity = Math.min(100, Math.round((users.length / 100) * 100));

    const nationalScore = Math.round(
      avgTrustScore * 0.25 +
      completionRate * 0.20 +
      Math.max(0, 100 - disputeFrequency) * 0.20 +
      capitalDensity * 0.15 +
      institutionalStrength * 0.20
    );

    results.push({
      countryId: country.id,
      countryName: name,
      nationalScore: Math.min(100, nationalScore),
      avgTrustScore,
      completionRate,
      disputeFrequency,
      capitalDensity,
      institutionalStrength,
      userCount: users.length,
    });
  }

  return results.sort((a, b) => b.nationalScore - a.nationalScore);
}

export async function getGlobalRiskSummary() {
  const countryScores = await computeNationalScores();

  const totalCountries = countryScores.length;
  const avgNationalScore = totalCountries > 0
    ? Math.round(countryScores.reduce((s, c) => s + c.nationalScore, 0) / totalCountries)
    : 0;
  const totalUsers = countryScores.reduce((s, c) => s + c.userCount, 0);
  const avgDisputeRate = totalCountries > 0
    ? Math.round(countryScores.reduce((s, c) => s + c.disputeFrequency, 0) / totalCountries)
    : 0;

  return {
    totalCountries,
    avgNationalScore,
    totalUsers,
    avgDisputeRate,
    topCountries: countryScores.slice(0, 10),
    riskCountries: countryScores.filter(c => c.nationalScore < 30),
  };
}
