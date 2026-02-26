import { supabase } from "@/integrations/supabase/client";

/**
 * Reputation Graph — composite reputation score from:
 *   - Endorsements received (25%)
 *   - Network centrality / connections (25%)
 *   - Cross-deal collaboration diversity (25%)
 *   - Repeat client ratio (25%)
 */

export interface ReputationData {
  reputation_score: number;
  endorsement_score: number;
  centrality_score: number;
  collaboration_score: number;
  repeat_client_score: number;
}

export async function computeReputationScore(userId: string): Promise<ReputationData> {
  // Fetch endorsement count from user_skills
  const skillsRes = await supabase.from("user_skills").select("endorsement_count").eq("user_id", userId);
  const totalEndorsements = (skillsRes.data ?? []).reduce((sum, s) => sum + (s.endorsement_count ?? 0), 0);

  // Accepted connections
  const connectionsRes = await supabase.from("connection_requests")
    .select("id", { count: "exact", head: true })
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .eq("status", "accepted");

  // Deals this user was part of
  const dealsRes = await supabase.from("deal_rooms")
    .select("buyer_id, seller_id, status")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .in("status", ["completed", "in_progress"]);

  // Endorsement score: 0→0, 5→30, 15→60, 30+→100
  const endorsement_score = Math.min(100, Math.round((totalEndorsements / 30) * 100));

  // Centrality score: connections count normalized
  const connections = connectionsRes.count ?? 0;
  const centrality_score = Math.min(100, Math.round((connections / 50) * 100));

  // Collaboration diversity: unique counterparties
  const deals = dealsRes.data ?? [];
  const counterparties = new Set<string>();
  for (const d of deals) {
    const other = d.buyer_id === userId ? d.seller_id : d.buyer_id;
    if (other) counterparties.add(other);
  }
  const collaboration_score = Math.min(100, Math.round((counterparties.size / 20) * 100));

  // Repeat client ratio: how many counterparties appear 2+ times
  const counterpartyCounts = new Map<string, number>();
  for (const d of deals) {
    const other = d.buyer_id === userId ? d.seller_id : d.buyer_id;
    if (other) counterpartyCounts.set(other, (counterpartyCounts.get(other) ?? 0) + 1);
  }
  const repeatClients = [...counterpartyCounts.values()].filter(c => c >= 2).length;
  const repeat_client_score = counterparties.size > 0
    ? Math.min(100, Math.round((repeatClients / counterparties.size) * 100))
    : 0;

  const reputation_score = Math.round(
    endorsement_score * 0.25 +
    centrality_score * 0.25 +
    collaboration_score * 0.25 +
    repeat_client_score * 0.25
  );

  return {
    reputation_score: Math.min(100, reputation_score),
    endorsement_score,
    centrality_score,
    collaboration_score,
    repeat_client_score,
  };
}
