/**
 * AI Talent Matching Engine — Additive service layer.
 * Matches organisations with execution-verified talent using
 * capability graph, trust score, and collaboration signals.
 */
import { supabase } from "@/integrations/supabase/client";

export interface TalentMatch {
  userId: string;
  displayName: string;
  trustScore: number;
  completedMilestones: number;
  domains: string[];
  topSkills: string[];
  matchScore: number;
  matchReasons: string[];
}

/**
 * Score talent against a contract's requirements.
 * Pure read-only — no mutations.
 */
export async function matchTalentForContract(contractId: string): Promise<TalentMatch[]> {
  // Fetch the contract requirements
  const { data: contract } = await (supabase as any)
    .from("execution_exchange_contracts")
    .select("*")
    .eq("id", contractId)
    .single();

  if (!contract) return [];

  // Fetch talent profiles
  const { data: profiles } = await supabase
    .from("talent_discovery_profiles")
    .select("*")
    .order("discovery_score", { ascending: false })
    .limit(50);

  if (!profiles?.length) return [];

  // Score each profile
  const matches: TalentMatch[] = profiles.map((p: any) => {
    let score = 0;
    const reasons: string[] = [];

    // Domain match
    const domainMatch = (p.domains ?? []).some(
      (d: string) => d.toLowerCase() === (contract.domain ?? "").toLowerCase()
    );
    if (domainMatch) { score += 30; reasons.push("Domain expertise match"); }

    // Skill overlap
    const reqSkills = contract.required_skills ?? [];
    const overlap = (p.top_skills ?? []).filter((s: string) =>
      reqSkills.some((r: string) => r.toLowerCase() === s.toLowerCase())
    );
    if (overlap.length > 0) {
      score += Math.min(25, overlap.length * 8);
      reasons.push(`${overlap.length} required skill(s) matched`);
    }

    // Trust score threshold
    const trust = Number(p.discovery_score ?? 0);
    if (trust >= (contract.min_trust_score ?? 0)) {
      score += Math.min(20, trust / 5);
      reasons.push("Meets trust threshold");
    }

    // Milestone reliability
    const milestones = Number(p.completed_milestones ?? 0);
    if (milestones >= 5) { score += 15; reasons.push("Strong milestone track record"); }
    else if (milestones >= 1) { score += 8; reasons.push("Has milestone history"); }

    // Cross-border bonus
    if ((p.cross_border_collaborations ?? 0) >= 2) {
      score += 10; reasons.push("Cross-border collaboration experience");
    }

    return {
      userId: p.user_id,
      displayName: `User ${(p.user_id as string).slice(0, 8)}`,
      trustScore: trust,
      completedMilestones: milestones,
      domains: p.domains ?? [],
      topSkills: p.top_skills ?? [],
      matchScore: Math.min(100, score),
      matchReasons: reasons,
    };
  });

  return matches.filter((m) => m.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get global execution exchange analytics — extended version.
 */
export async function getGlobalExecutionTrends() {
  const [
    { data: contracts },
    { data: pools },
    { data: profiles },
    { data: opportunities },
  ] = await Promise.all([
    (supabase as any).from("execution_exchange_contracts").select("*").limit(500),
    (supabase as any).from("institutional_talent_pools").select("*").limit(200),
    supabase.from("talent_discovery_profiles").select("*").limit(500),
    (supabase as any).from("professional_opportunities").select("*").limit(500),
  ]);

  const allContracts = contracts ?? [];
  const allPools = pools ?? [];
  const allProfiles = profiles ?? [];
  const allOpps = opportunities ?? [];

  // Top institutions by pool count
  const instMap: Record<string, number> = {};
  allPools.forEach((p: any) => {
    const name = p.institution_id ?? "Independent";
    instMap[name] = (instMap[name] || 0) + (p.member_count || 0);
  });
  const topInstitutions = Object.entries(instMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([institution, members]) => ({ institution, members }));

  // Domain demand from contracts + opportunities
  const demandMap: Record<string, number> = {};
  allContracts.forEach((c: any) => {
    if (c.domain) demandMap[c.domain] = (demandMap[c.domain] || 0) + 1;
  });
  allOpps.forEach((o: any) => {
    if (o.domain) demandMap[o.domain] = (demandMap[o.domain] || 0) + 1;
  });
  const domainDemand = Object.entries(demandMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, demand]) => ({ domain, demand }));

  // Talent supply by availability
  const availMap: Record<string, number> = {};
  allProfiles.forEach((p: any) => {
    const av = p.availability ?? "unknown";
    availMap[av] = (availMap[av] || 0) + 1;
  });

  return {
    totalTalent: allProfiles.length,
    totalContracts: allContracts.length,
    openContracts: allContracts.filter((c: any) => c.status === "open").length,
    totalBudget: allContracts.reduce((s: number, c: any) => s + (c.budget_amount || 0), 0),
    totalPools: allPools.length,
    totalOpportunities: allOpps.length,
    topInstitutions,
    domainDemand,
    talentAvailability: availMap,
  };
}
