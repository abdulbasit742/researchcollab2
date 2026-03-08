/**
 * Dataset & Knowledge Exchange — Comprehensive Service Layer
 */
import { supabase } from "@/integrations/supabase/client";

// ─── Dataset Registry ───

export async function getDatasets(filters?: { domain_category?: string; status?: string; license_type?: string; access_level?: string }) {
  let q = (supabase as any).from("dke_dataset_registry").select("*").order("created_at", { ascending: false });
  if (filters?.domain_category) q = q.eq("domain_category", filters.domain_category);
  if (filters?.status) q = q.eq("status", filters.status);
  else q = q.eq("status", "published");
  if (filters?.license_type) q = q.eq("license_type", filters.license_type);
  if (filters?.access_level) q = q.eq("access_level", filters.access_level);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function getDataset(id: string) {
  const { data, error } = await (supabase as any).from("dke_dataset_registry").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createDataset(input: {
  title: string; description?: string; domain_category: string; sub_domain?: string;
  data_type?: string; data_format?: string; dataset_size_mb?: number; record_count?: number;
  feature_count?: number; institution_id?: string; creator_id?: string; creator_seid?: string;
  license_type?: string; access_level?: string; price_amount?: number; tags?: string[];
  schema_definition?: Record<string, unknown>; sample_preview?: Record<string, unknown>;
}) {
  const { data, error } = await (supabase as any).from("dke_dataset_registry")
    .insert({ ...input, status: "draft" }).select().single();
  if (error) throw error;
  return data;
}

export async function updateDataset(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("dke_dataset_registry")
    .update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function publishDataset(id: string) {
  return updateDataset(id, { status: "published", published_at: new Date().toISOString() });
}

// ─── Knowledge Objects ───

export async function getKnowledgeObjects(filters?: { object_type?: string; domain?: string; status?: string }) {
  let q = (supabase as any).from("dke_knowledge_objects").select("*").order("created_at", { ascending: false });
  if (filters?.object_type) q = q.eq("object_type", filters.object_type);
  if (filters?.domain) q = q.eq("domain", filters.domain);
  if (filters?.status) q = q.eq("status", filters.status);
  else q = q.eq("status", "published");
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

export async function createKnowledgeObject(input: {
  title: string; description?: string; object_type: string; domain?: string;
  author_id?: string; author_seid?: string; institution_id?: string;
  linked_dataset_ids?: string[]; linked_project_ids?: string[];
  license_type?: string; access_level?: string; price_amount?: number;
  tags?: string[]; content_url?: string;
}) {
  const { data, error } = await (supabase as any).from("dke_knowledge_objects")
    .insert({ ...input, status: "draft" }).select().single();
  if (error) throw error;
  return data;
}

export async function updateKnowledgeObject(id: string, updates: Record<string, unknown>) {
  const { data, error } = await (supabase as any).from("dke_knowledge_objects")
    .update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ─── Licensing ───

export async function createLicenseTransaction(input: {
  asset_type: string; asset_id: string; licensee_id: string; licensor_id?: string;
  license_type: string; amount_paid: number;
}) {
  const platformFee = input.amount_paid * 0.20;
  const { data, error } = await (supabase as any).from("dke_license_transactions")
    .insert({ ...input, platform_fee: platformFee, fee_rate: 0.20, status: "active" }).select().single();
  if (error) throw error;
  return data;
}

export async function getLicenseTransactions(filters?: { asset_id?: string; licensee_id?: string }) {
  let q = (supabase as any).from("dke_license_transactions").select("*").order("created_at", { ascending: false });
  if (filters?.asset_id) q = q.eq("asset_id", filters.asset_id);
  if (filters?.licensee_id) q = q.eq("licensee_id", filters.licensee_id);
  const { data, error } = await q.limit(200);
  if (error) throw error;
  return data ?? [];
}

// ─── Quality Reviews ───

export async function getQualityReviews(assetId: string) {
  const { data, error } = await (supabase as any).from("dke_quality_reviews").select("*")
    .eq("asset_id", assetId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function submitQualityReview(input: {
  asset_type: string; asset_id: string; reviewer_id: string; reviewer_role?: string;
  quality_score: number; completeness_score?: number; accuracy_score?: number;
  documentation_score?: number; review_notes?: string; recommendation: string;
}) {
  const { data, error } = await (supabase as any).from("dke_quality_reviews")
    .insert({ ...input, status: "completed", completed_at: new Date().toISOString() }).select().single();
  if (error) throw error;
  return data;
}

// ─── AI Discovery ───

export async function discoverAssets(userId: string, researchDomain?: string, projectDescription?: string, capabilities?: string[]) {
  const { data, error } = await supabase.functions.invoke("dke-ai-discovery", {
    body: { user_id: userId, research_domain: researchDomain, project_description: projectDescription, capabilities },
  });
  if (error) throw error;
  return data;
}

export async function getRecommendations(userId: string) {
  const { data, error } = await (supabase as any).from("dke_ai_recommendations").select("*")
    .eq("user_id", userId).order("match_score", { ascending: false }).limit(20);
  if (error) throw error;
  return data ?? [];
}

// ─── Analytics ───

export async function getDKEAnalytics() {
  const [datasetsRes, knowledgeRes, licensesRes] = await Promise.all([
    (supabase as any).from("dke_dataset_registry").select("domain_category, status, license_type, download_count, price_amount, quality_score"),
    (supabase as any).from("dke_knowledge_objects").select("object_type, domain, status, download_count, price_amount"),
    (supabase as any).from("dke_license_transactions").select("asset_type, amount_paid, platform_fee, license_type"),
  ]);

  const datasets = datasetsRes.data ?? [];
  const knowledge = knowledgeRes.data ?? [];
  const licenses = licensesRes.data ?? [];

  return {
    datasets: {
      total: datasets.length,
      published: datasets.filter((d: any) => d.status === "published").length,
      byDomain: datasets.reduce((a: Record<string, number>, d: any) => { a[d.domain_category] = (a[d.domain_category] || 0) + 1; return a; }, {}),
      totalDownloads: datasets.reduce((s: number, d: any) => s + (d.download_count || 0), 0),
      avgQuality: datasets.length > 0 ? Math.round(datasets.reduce((s: number, d: any) => s + (Number(d.quality_score) || 0), 0) / datasets.length) : 0,
    },
    knowledge: {
      total: knowledge.length,
      byType: knowledge.reduce((a: Record<string, number>, k: any) => { a[k.object_type] = (a[k.object_type] || 0) + 1; return a; }, {}),
      totalDownloads: knowledge.reduce((s: number, k: any) => s + (k.download_count || 0), 0),
    },
    licensing: {
      totalTransactions: licenses.length,
      totalRevenue: licenses.reduce((s: number, l: any) => s + (Number(l.amount_paid) || 0), 0),
      platformRevenue: licenses.reduce((s: number, l: any) => s + (Number(l.platform_fee) || 0), 0),
      byType: licenses.reduce((a: Record<string, number>, l: any) => { a[l.license_type] = (a[l.license_type] || 0) + 1; return a; }, {}),
    },
  };
}

// ─── Constants ───

export const DKE_DOMAINS = [
  "AI & Machine Learning", "Biomedical", "Climate & Environment", "Agriculture",
  "Energy", "Healthcare", "Education", "Urban Planning", "Cybersecurity",
  "Materials Science", "Economics", "Social Science", "Genomics", "IoT & Sensors",
];

export const DKE_DATA_TYPES = ["tabular", "image", "text", "audio", "video", "geospatial", "time_series", "graph", "multimodal"];

export const DKE_LICENSE_TYPES = ["open_access", "research_only", "commercial", "restricted", "custom"];

export const DKE_OBJECT_TYPES = ["report", "algorithm", "benchmark", "methodology", "pipeline", "tool", "documentation", "evaluation"];

export const DKE_ACCESS_LEVELS = ["public", "institutional", "restricted", "private"];
