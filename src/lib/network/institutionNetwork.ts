/**
 * Global Institution Network — Service layer.
 * Additive only. Does NOT mutate core systems.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Institution Nodes ──

export async function getInstitutionNodes(filters?: { country?: string; type?: string; domain?: string; status?: string }) {
  let q = (supabase as any).from("gin_institution_nodes").select("*").order("reputation_score", { ascending: false });
  if (filters?.country) q = q.eq("country", filters.country);
  if (filters?.type) q = q.eq("institution_type", filters.type);
  if (filters?.domain) q = q.contains("domains_of_expertise", [filters.domain]);
  if (filters?.status) q = q.eq("node_status", filters.status);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function registerInstitutionNode(input: {
  institution_name: string;
  country: string;
  region?: string;
  institution_type: string;
  domains_of_expertise?: string[];
  website_url?: string;
  registered_by: string;
}) {
  const { data, error } = await (supabase as any).from("gin_institution_nodes").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateInstitutionNode(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("gin_institution_nodes")
    .update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Collaborations ──

export async function getCollaborations(institutionId?: string) {
  let q = (supabase as any).from("gin_collaborations").select("*, institution_a:gin_institution_nodes!gin_collaborations_institution_a_id_fkey(*), institution_b:gin_institution_nodes!gin_collaborations_institution_b_id_fkey(*)").eq("is_active", true).order("strength_score", { ascending: false });
  if (institutionId) q = q.or(`institution_a_id.eq.${institutionId},institution_b_id.eq.${institutionId}`);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createCollaboration(input: {
  institution_a_id: string;
  institution_b_id: string;
  collaboration_type: string;
  title?: string;
  description?: string;
  shared_domains?: string[];
}) {
  const { data, error } = await (supabase as any).from("gin_collaborations").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── Challenges ──

export async function getChallenges(filters?: { institutionId?: string; status?: string }) {
  let q = (supabase as any).from("gin_challenges").select("*, gin_institution_nodes(institution_name, country)").order("created_at", { ascending: false });
  if (filters?.institutionId) q = q.eq("institution_id", filters.institutionId);
  if (filters?.status) q = q.eq("status", filters.status);
  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createChallenge(input: {
  institution_id: string;
  title: string;
  description?: string;
  challenge_type?: string;
  domains?: string[];
  funding_amount?: number;
  max_teams?: number;
  application_deadline?: string;
  created_by: string;
}) {
  const { data, error } = await (supabase as any).from("gin_challenges").insert({ ...input, status: "open" }).select().single();
  if (error) throw error;
  return data;
}

// ── Challenge Applications ──

export async function applyToChallenge(input: {
  challenge_id: string;
  applicant_id: string;
  institution_id?: string;
  team_name?: string;
  proposal_summary?: string;
  team_members?: any[];
}) {
  const { data, error } = await (supabase as any).from("gin_challenge_applications").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getChallengeApplications(challengeId: string) {
  const { data, error } = await (supabase as any).from("gin_challenge_applications")
    .select("*").eq("challenge_id", challengeId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Cross-Institution Teams ──

export async function getCrossTeams() {
  const { data, error } = await (supabase as any).from("gin_cross_teams")
    .select("*, gin_institution_nodes(institution_name)").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function createCrossTeam(input: {
  team_name: string;
  description?: string;
  lead_institution_id?: string;
  lead_user_id: string;
  domains?: string[];
}) {
  const { data, error } = await (supabase as any).from("gin_cross_teams").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function joinCrossTeam(input: { team_id: string; user_id: string; institution_id?: string; role?: string }) {
  const { data, error } = await (supabase as any).from("gin_cross_team_members").insert(input).select().single();
  if (error) throw error;
  return data;
}

// ── AI Discovery ──

export async function runInstitutionDiscovery(queryType: string, context: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("gin-discovery", {
    body: { queryType, context },
  });
  if (error) throw error;
  return data;
}

// ── Analytics ──

export async function getGINAnalytics() {
  const [{ data: nodes }, { data: collabs }, { data: challenges }] = await Promise.all([
    (supabase as any).from("gin_institution_nodes").select("*").limit(500),
    (supabase as any).from("gin_collaborations").select("*").eq("is_active", true).limit(500),
    (supabase as any).from("gin_challenges").select("*").limit(500),
  ]);

  const allNodes = nodes ?? [];
  const allCollabs = collabs ?? [];
  const allChallenges = challenges ?? [];

  const countryMap: Record<string, number> = {};
  const typeMap: Record<string, number> = {};
  allNodes.forEach((n: any) => {
    countryMap[n.country] = (countryMap[n.country] || 0) + 1;
    typeMap[n.institution_type] = (typeMap[n.institution_type] || 0) + 1;
  });

  return {
    totalInstitutions: allNodes.length,
    totalCollaborations: allCollabs.length,
    totalChallenges: allChallenges.length,
    totalFunding: allChallenges.reduce((s: number, c: any) => s + (c.funding_amount || 0), 0),
    avgReputation: allNodes.length > 0 ? Math.round(allNodes.reduce((s: number, n: any) => s + (n.reputation_score || 0), 0) / allNodes.length) : 0,
    byCountry: Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([country, count]) => ({ country, count })),
    byType: Object.entries(typeMap).map(([type, count]) => ({ type, count })),
  };
}

export const INSTITUTION_TYPES = ["university", "research_lab", "institute", "corporate_rd", "government_lab"];
export const COLLABORATION_TYPES = ["joint_research", "co_publication", "shared_dataset", "joint_venture", "faculty_exchange", "student_exchange"];
export const CHALLENGE_TYPES = ["research", "innovation", "hackathon", "industry", "social_impact"];
