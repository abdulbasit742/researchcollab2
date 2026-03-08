/**
 * AI Innovation Advisor — Client-side service.
 * Calls the innovation-advisor edge function to generate proposals via Lovable AI.
 */
import { supabase } from "@/integrations/supabase/client";

export interface InnovationProposal {
  title: string;
  summary: string;
  core_components: { name: string; description: string }[];
  revenue_model: string;
  estimated_impact: string;
  integration_points: string[];
}

export async function generateInnovationProposal(input: {
  domain?: string;
  category?: string;
  platform_context?: string;
}): Promise<InnovationProposal> {
  const { data, error } = await supabase.functions.invoke("innovation-advisor", {
    body: input,
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.proposal;
}

export async function saveProposal(input: {
  requested_by: string;
  context_domain?: string;
  innovation_category?: string;
  proposal_title?: string;
  proposal_summary?: string;
  core_components?: any;
  revenue_model?: string;
  estimated_impact?: string;
  ai_model_used?: string;
}) {
  const { data, error } = await (supabase as any).from("ai_innovation_proposals")
    .insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function getMyProposals(userId: string) {
  const { data, error } = await (supabase as any).from("ai_innovation_proposals")
    .select("*").eq("requested_by", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const INNOVATION_DOMAINS = [
  "AI & Machine Learning", "Biotechnology", "Climate & Energy", "Space & Aerospace",
  "Healthcare", "Education", "Fintech", "Quantum Computing", "Materials Science",
  "Robotics", "Cybersecurity", "Agriculture",
];

export const INNOVATION_CATEGORIES = [
  "Marketplace", "Analytics Platform", "Coordination System", "Funding Mechanism",
  "AI Agent", "Data Exchange", "Governance Tool", "Compliance Engine",
];
