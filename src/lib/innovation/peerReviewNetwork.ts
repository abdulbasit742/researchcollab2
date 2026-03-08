import { supabase } from "@/integrations/supabase/client";

export interface ReviewRequest {
  id: string;
  submitter_id: string;
  title: string;
  abstract: string | null;
  research_domain: string;
  document_url: string | null;
  review_type: string;
  urgency: string;
  min_reviewer_trust_score: number;
  reward_amount: number;
  status: string;
  ai_pre_review: any;
  created_at: string;
}

export interface ReviewResponse {
  id: string;
  request_id: string;
  reviewer_id: string;
  overall_rating: number | null;
  methodology_score: number | null;
  novelty_score: number | null;
  rigor_score: number | null;
  feedback_text: string | null;
  recommendation: string;
  ai_assisted: boolean;
  status: string;
  created_at: string;
}

export async function fetchReviewRequests(status?: string) {
  let query = supabase.from("peer_review_requests").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data as ReviewRequest[];
}

export async function createReviewRequest(request: Partial<ReviewRequest>) {
  const { data, error } = await supabase.from("peer_review_requests").insert(request).select().single();
  if (error) throw error;
  return data;
}

export async function submitReview(response: Partial<ReviewResponse>) {
  const { data, error } = await supabase.from("peer_review_responses").insert({
    ...response,
    status: "submitted",
    submitted_at: new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return data;
}

export function getReviewAnalytics(requests: ReviewRequest[]) {
  const total = requests.length;
  const open = requests.filter(r => r.status === "open").length;
  const completed = requests.filter(r => r.status === "completed").length;
  const totalRewards = requests.reduce((s, r) => s + Number(r.reward_amount || 0), 0);
  const byDomain = requests.reduce((acc, r) => {
    acc[r.research_domain] = (acc[r.research_domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return { total, open, completed, totalRewards, byDomain };
}
