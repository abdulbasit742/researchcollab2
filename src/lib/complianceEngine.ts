import { supabase } from "@/integrations/supabase/client";

/**
 * Compliance Engine — KYC flags, AML checks, audit trail, exposure limits.
 *
 * Uses existing tables: admin_audit_logs, user_trust_profiles, capital_advances.
 * Provides compliance-layer validation before sensitive operations.
 */

export interface ComplianceStatus {
  kycVerified: boolean;
  amlCleared: boolean;
  capitalExposureOk: boolean;
  overallCompliant: boolean;
  issues: string[];
}

const MAX_CAPITAL_EXPOSURE = 500000; // PKR 500K max outstanding advances

export async function checkUserCompliance(userId: string): Promise<ComplianceStatus> {
  const issues: string[] = [];

  // KYC check — use is_verified_student/partner from user_trust_profiles
  const { data: trustProfile } = await supabase
    .from("user_trust_profiles")
    .select("is_verified_student, is_verified_partner, is_verified_researcher, is_frozen, is_under_review, dispute_rate, trust_score")
    .eq("user_id", userId)
    .maybeSingle();

  const kycVerified = trustProfile?.is_verified_student === true ||
    trustProfile?.is_verified_partner === true ||
    trustProfile?.is_verified_researcher === true;
  if (!kycVerified) issues.push("KYC verification incomplete");

  // AML basic — check for frozen/review flags
  const amlCleared = !(trustProfile?.is_frozen) && !(trustProfile?.is_under_review) && (trustProfile?.trust_score ?? 0) > 10;
  if (!amlCleared) issues.push("AML flag detected or trust score critically low");

  // Capital exposure limit
  const { data: advances } = await supabase
    .from("capital_advances")
    .select("approved_amount, repaid_amount")
    .eq("user_id", userId)
    .in("status", ["disbursed", "repaying"]);

  const totalOutstanding = (advances ?? []).reduce(
    (s, a) => s + ((a.approved_amount ?? 0) - (a.repaid_amount ?? 0)),
    0
  );
  const capitalExposureOk = totalOutstanding <= MAX_CAPITAL_EXPOSURE;
  if (!capitalExposureOk) issues.push(`Capital exposure (${totalOutstanding}) exceeds limit (${MAX_CAPITAL_EXPOSURE})`);

  return {
    kycVerified,
    amlCleared,
    capitalExposureOk,
    overallCompliant: kycVerified && amlCleared && capitalExposureOk,
    issues,
  };
}

export async function logAuditEvent(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
}) {
  const { error } = await supabase.from("admin_audit_logs").insert({
    admin_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    details: params.details ?? null,
  });
  if (error) throw error;
}

export async function getAuditTrail(params: {
  userId?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
}) {
  let query = supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 100);

  if (params.userId) query = query.eq("admin_id", params.userId);
  if (params.entityType) query = query.eq("entity_type", params.entityType);
  if (params.entityId) query = query.eq("entity_id", params.entityId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getComplianceSummary() {
  const [flaggedRes, advancesRes] = await Promise.all([
    supabase.from("user_trust_profiles").select("user_id").eq("is_frozen", true),
    supabase.from("capital_advances").select("approved_amount, repaid_amount").in("status", ["disbursed", "repaying"]),
  ]);

  const flaggedUsers = flaggedRes.data?.length ?? 0;
  const totalOutstanding = (advancesRes.data ?? []).reduce(
    (s, a) => s + ((a.approved_amount ?? 0) - (a.repaid_amount ?? 0)),
    0
  );

  return {
    flaggedUsers,
    totalCapitalOutstanding: totalOutstanding,
    overExposureCount: (advancesRes.data ?? []).filter(
      a => ((a.approved_amount ?? 0) - (a.repaid_amount ?? 0)) > MAX_CAPITAL_EXPOSURE
    ).length,
  };
}
