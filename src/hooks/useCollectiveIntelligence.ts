import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface SwarmDecision {
  id: string;
  created_by?: string;
  title: string;
  description: string;
  decision_type: string;
  context_type?: string;
  context_id?: string;
  options: Array<{ id: string; label: string; description?: string }>;
  voting_method: "simple" | "weighted" | "quadratic";
  min_participants: number;
  quorum_percentage: number;
  status: "open" | "voting" | "closed" | "executed";
  opens_at: string;
  closes_at: string;
  result?: { winning_option_id: string; vote_breakdown: Record<string, number>; confidence_score: number };
  created_at: string;
  updated_at: string;
}

export interface SwarmVote {
  id: string;
  decision_id: string;
  voter_id: string;
  option_id: string;
  weight: number;
  confidence: number;
  reasoning?: string;
  created_at: string;
}

export interface PredictionMarket {
  id: string;
  created_by?: string;
  project_id?: string;
  question: string;
  description?: string;
  market_type: "binary" | "categorical" | "scalar";
  outcomes: Array<{ id: string; label: string; current_probability: number }>;
  initial_liquidity: number;
  current_liquidity: number;
  status: "active" | "resolved" | "cancelled";
  resolution_criteria?: string;
  resolution_date?: string;
  resolved_outcome?: string;
  created_at: string;
}

export interface PredictionPosition {
  id: string;
  market_id: string;
  user_id: string;
  outcome_id: string;
  shares: number;
  average_price: number;
  realized_pnl: number;
}

export interface DueDiligenceRequest {
  id: string;
  requester_id: string;
  target_type: "user" | "project" | "organization";
  target_id: string;
  title: string;
  scope: string;
  required_checks: Array<{ type: string; description: string; required: boolean }>;
  reward_amount: number;
  max_investigators: number;
  status: "pending" | "in_progress" | "completed" | "flagged";
  deadline?: string;
  created_at: string;
}

export interface DueDiligenceContribution {
  id: string;
  request_id: string;
  investigator_id: string;
  check_type: string;
  findings: string;
  evidence_urls?: string[];
  risk_level: "low" | "medium" | "high" | "critical";
  confidence_score?: number;
  reward_earned: number;
  created_at: string;
}

export function useSwarmDecisions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [decisions, setDecisions] = useState<SwarmDecision[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDecisions = useCallback(async (filters?: { status?: string }) => {
    setLoading(true);
    let query = supabase.from("swarm_decisions").select("*").order("created_at", { ascending: false });
    if (filters?.status) query = query.eq("status", filters.status as "open" | "voting" | "closed" | "executed");
    const { data } = await query;
    if (data) {
      setDecisions(data.map(d => ({
        id: d.id, title: d.title, description: d.description, decision_type: d.decision_type,
        min_participants: d.min_participants, quorum_percentage: d.quorum_percentage,
        opens_at: d.opens_at, closes_at: d.closes_at, created_at: d.created_at, updated_at: d.updated_at,
        created_by: d.created_by || undefined, context_type: d.context_type || undefined, context_id: d.context_id || undefined,
        options: (d.options as SwarmDecision["options"]) || [],
        voting_method: d.voting_method as SwarmDecision["voting_method"],
        status: d.status as SwarmDecision["status"],
        result: d.result as SwarmDecision["result"],
      })));
    }
    setLoading(false);
  }, []);

  const castVote = useCallback(async (decisionId: string, optionId: string, confidence = 1, reasoning?: string) => {
    if (!user?.id) return false;
    const { error } = await supabase.from("swarm_votes").upsert({
      decision_id: decisionId, voter_id: user.id, option_id: optionId, weight: 1, confidence, reasoning,
    });
    if (error) { toast({ title: "Error", description: "Failed to cast vote", variant: "destructive" }); return false; }
    toast({ title: "Vote Cast", description: "Your vote has been recorded" });
    return true;
  }, [user?.id, toast]);

  const getVotes = useCallback(async (decisionId: string): Promise<SwarmVote[]> => {
    const { data } = await supabase.from("swarm_votes").select("*").eq("decision_id", decisionId);
    return (data || []) as SwarmVote[];
  }, []);

  return { decisions, loading, fetchDecisions, castVote, getVotes };
}

export function usePredictionMarkets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [positions, setPositions] = useState<PredictionPosition[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMarkets = useCallback(async (projectId?: string) => {
    setLoading(true);
    let query = supabase.from("prediction_markets").select("*").order("created_at", { ascending: false });
    if (projectId) query = query.eq("project_id", projectId);
    const { data } = await query;
    if (data) {
      setMarkets(data.map(m => ({
        ...m,
        outcomes: (m.outcomes as PredictionMarket["outcomes"]) || [],
        market_type: m.market_type as PredictionMarket["market_type"],
        status: m.status as PredictionMarket["status"],
      })));
    }
    setLoading(false);
  }, []);

  const fetchMyPositions = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from("prediction_positions").select("*").eq("user_id", user.id);
    setPositions((data || []) as PredictionPosition[]);
  }, [user?.id]);

  const trade = useCallback(async (marketId: string, outcomeId: string, tradeType: "buy" | "sell", shares: number) => {
    if (!user?.id) return false;
    const market = markets.find(m => m.id === marketId);
    if (!market) return false;
    const outcome = market.outcomes.find(o => o.id === outcomeId);
    if (!outcome) return false;
    const price = outcome.current_probability;
    const { error } = await supabase.from("prediction_trades").insert({
      market_id: marketId, user_id: user.id, outcome_id: outcomeId, trade_type: tradeType, shares, price, total_cost: shares * price,
    });
    if (error) { toast({ title: "Error", description: "Trade failed", variant: "destructive" }); return false; }
    toast({ title: "Trade Executed", description: `${tradeType === "buy" ? "Bought" : "Sold"} ${shares} shares` });
    await fetchMyPositions();
    return true;
  }, [user?.id, markets, toast, fetchMyPositions]);

  return { markets, positions, loading, fetchMarkets, fetchMyPositions, trade };
}

export function useDueDiligence() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<DueDiligenceRequest[]>([]);
  const [contributions, setContributions] = useState<DueDiligenceContribution[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = useCallback(async (filters?: { status?: string }) => {
    setLoading(true);
    let query = supabase.from("due_diligence_requests").select("*").order("created_at", { ascending: false });
    if (filters?.status) query = query.eq("status", filters.status as "pending" | "in_progress" | "completed" | "flagged");
    const { data } = await query;
    if (data) {
      setRequests(data.map(r => ({
        ...r,
        required_checks: (r.required_checks as DueDiligenceRequest["required_checks"]) || [],
        target_type: r.target_type as DueDiligenceRequest["target_type"],
        status: r.status as DueDiligenceRequest["status"],
      })));
    }
    setLoading(false);
  }, []);

  const contribute = useCallback(async (requestId: string, contribution: {
    check_type: string; findings: string; evidence_urls?: string[]; risk_level: "low" | "medium" | "high" | "critical"; confidence_score?: number;
  }) => {
    if (!user?.id) return null;
    const { data, error } = await supabase.from("due_diligence_contributions").insert({ request_id: requestId, investigator_id: user.id, ...contribution }).select().single();
    if (error) { toast({ title: "Error", description: "Failed to submit contribution", variant: "destructive" }); return null; }
    toast({ title: "Success", description: "Contribution submitted" });
    return data;
  }, [user?.id, toast]);

  const fetchContributions = useCallback(async (requestId: string) => {
    const { data } = await supabase.from("due_diligence_contributions").select("*").eq("request_id", requestId);
    setContributions((data || []).map(c => ({ ...c, risk_level: c.risk_level as DueDiligenceContribution["risk_level"] })));
  }, []);

  return { requests, contributions, loading, fetchRequests, contribute, fetchContributions };
}
