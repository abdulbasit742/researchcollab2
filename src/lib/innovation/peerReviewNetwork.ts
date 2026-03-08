import { supabase } from "@/integrations/supabase/client";

export interface ReviewRequest {
  id: string;
  requester_id: string;
  target_type: string;
  target_id: string;
  title: string | null;
  abstract: string | null;
  research_domain: string | null;
  document_url: string | null;
  review_type: string;
  urgency: string;
  instructions: string | null;
  min_reviewer_trust_score: number;
  reward_amount: number;
  status: string;
  ai_pre_review: any;
  created_at: string;
}

export async function fetchReviewRequests(status?: string) {
  let query = supabase.from("peer_review_requests").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ReviewRequest[];
}

export async function createReviewRequest(request: Record<string, any>) {
  const { data, error } = await supabase.from("peer_review_requests").insert([request]).select().single();
  if (error) throw error;
  return data;
}

export async function submitReview(response: Record<string, any>) {
  const { data, error } = await supabase.from("peer_review_responses").insert([{
    ...response,
    status: "submitted",
    submitted_at: new Date().toISOString(),
  }]).select().single();
  if (error) throw error;
  return data;
}

export function getReviewAnalytics(requests: ReviewRequest[]) {
  const total = requests.length;
  const open = requests.filter(r => r.status === "open").length;
  const completed = requests.filter(r => r.status === "completed").length;
  const totalRewards = requests.reduce((s, r) => s + Number(r.reward_amount || 0), 0);
  const byDomain = requests.reduce((acc, r) => {
    const domain = r.research_domain || "Unknown";
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return { total, open, completed, totalRewards, byDomain };
}
