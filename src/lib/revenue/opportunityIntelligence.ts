/**
 * Opportunity Intelligence Engine — detects revenue opportunities from platform activity.
 * Read-only advisory layer. Does NOT mutate financial systems.
 */
import { supabase } from "@/integrations/supabase/client";

export type OpportunityType = "funding" | "commercialization" | "startup" | "hiring" | "licensing" | "partnership";
export type OpportunityStatus = "detected" | "reviewed" | "actioned" | "dismissed" | "expired";

export async function getOpportunities(filters?: {
  type?: OpportunityType;
  status?: OpportunityStatus;
  minConfidence?: number;
}) {
  let q = (supabase as any)
    .from("revenue_opportunities")
    .select("*")
    .order("confidence_score", { ascending: false });

  if (filters?.type) q = q.eq("opportunity_type", filters.type);
  if (filters?.status) q = q.eq("status", filters.status);
  if (filters?.minConfidence) q = q.gte("confidence_score", filters.minConfidence);

  const { data, error } = await q.limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getOpportunity(id: string) {
  const { data, error } = await (supabase as any)
    .from("revenue_opportunities")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createOpportunity(input: {
  opportunity_type: OpportunityType;
  title: string;
  description?: string;
  source_entity_type?: string;
  source_entity_id?: string;
  target_entity_type?: string;
  target_entity_id?: string;
  confidence_score?: number;
  estimated_value?: number;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await (supabase as any)
    .from("revenue_opportunities")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOpportunityStatus(id: string, status: OpportunityStatus, reviewedBy?: string) {
  const updates: Record<string, unknown> = { status };
  if (status === "reviewed" || status === "actioned") {
    updates.reviewed_at = new Date().toISOString();
    if (reviewedBy) updates.reviewed_by = reviewedBy;
  }
  const { data, error } = await (supabase as any)
    .from("revenue_opportunities")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getOpportunityStats() {
  const { data } = await (supabase as any)
    .from("revenue_opportunities")
    .select("opportunity_type, status, estimated_value, confidence_score");

  const opportunities = data ?? [];
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalValue = 0;
  let avgConfidence = 0;

  opportunities.forEach((o: any) => {
    byType[o.opportunity_type] = (byType[o.opportunity_type] || 0) + 1;
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    totalValue += o.estimated_value || 0;
    avgConfidence += o.confidence_score || 0;
  });

  return {
    total: opportunities.length,
    byType,
    byStatus,
    totalEstimatedValue: totalValue,
    avgConfidence: opportunities.length ? avgConfidence / opportunities.length : 0,
  };
}

export const OPPORTUNITY_TYPES: { value: OpportunityType; label: string }[] = [
  { value: "funding", label: "Funding Opportunity" },
  { value: "commercialization", label: "Commercialization" },
  { value: "startup", label: "Startup Potential" },
  { value: "hiring", label: "Hiring Opportunity" },
  { value: "licensing", label: "Licensing" },
  { value: "partnership", label: "Partnership" },
];
