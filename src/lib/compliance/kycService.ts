/**
 * KYC Verification Service — submit, verify, reject, enforce.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("kycService");

export type KYCStatus = "pending" | "verified" | "rejected";
export type RiskLevel = "low" | "medium" | "high";

export interface KYCProfile {
  id: string;
  userId: string;
  tenantId: string | null;
  regionId: string | null;
  documentType: string;
  verificationStatus: KYCStatus;
  riskLevel: RiskLevel;
  verifiedAt: string | null;
  createdAt: string;
}

async function logCompliance(action: string, entityType: string, entityId: string, userId: string, regionId?: string, details?: Record<string, unknown>) {
  await (supabase as any).from("compliance_audit_logs").insert({
    action, entity_type: entityType, entity_id: entityId, user_id: userId,
    region_id: regionId ?? null, compliance_flag: true, details: details ?? null,
  });
}

export async function submitKYC(
  userId: string, tenantId: string, regionId: string | null, documentType: string, documentHash: string
): Promise<string> {
  const { data, error } = await (supabase as any)
    .from("kyc_profiles")
    .insert({ user_id: userId, tenant_id: tenantId, region_id: regionId, document_type: documentType, document_hash: documentHash })
    .select("id")
    .single();

  if (error) throw new Error(`KYC submission failed: ${error.message}`);
  await logCompliance("kyc_submitted", "kyc_profiles", data.id, userId, regionId ?? undefined);
  log.info("KYC submitted", { userId, documentType });
  return data.id;
}

export async function verifyKYC(kycId: string, verifiedBy: string): Promise<void> {
  const { data: kyc, error: fetchErr } = await (supabase as any)
    .from("kyc_profiles").select("user_id, region_id").eq("id", kycId).single();
  if (fetchErr || !kyc) throw new Error("KYC profile not found");

  const { error } = await (supabase as any)
    .from("kyc_profiles")
    .update({ verification_status: "verified", verified_at: new Date().toISOString(), verified_by: verifiedBy, updated_at: new Date().toISOString() })
    .eq("id", kycId);

  if (error) throw new Error(`KYC verification failed: ${error.message}`);
  await logCompliance("kyc_verified", "kyc_profiles", kycId, kyc.user_id, kyc.region_id);
  log.info("KYC verified", { kycId, verifiedBy });
}

export async function rejectKYC(kycId: string, reason: string, rejectedBy: string): Promise<void> {
  const { data: kyc } = await (supabase as any).from("kyc_profiles").select("user_id, region_id").eq("id", kycId).single();

  const { error } = await (supabase as any)
    .from("kyc_profiles")
    .update({ verification_status: "rejected", rejection_reason: reason, updated_at: new Date().toISOString() })
    .eq("id", kycId);

  if (error) throw new Error(`KYC rejection failed: ${error.message}`);
  await logCompliance("kyc_rejected", "kyc_profiles", kycId, kyc?.user_id, kyc?.region_id, { reason });
  log.info("KYC rejected", { kycId, reason });
}

export async function getKYCStatus(userId: string): Promise<KYCProfile | null> {
  const { data } = await (supabase as any)
    .from("kyc_profiles")
    .select("id, user_id, tenant_id, region_id, document_type, verification_status, risk_level, verified_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id, userId: data.user_id, tenantId: data.tenant_id, regionId: data.region_id,
    documentType: data.document_type, verificationStatus: data.verification_status,
    riskLevel: data.risk_level, verifiedAt: data.verified_at, createdAt: data.created_at,
  };
}

export async function assertVerifiedForFinancialAction(userId: string): Promise<void> {
  const kyc = await getKYCStatus(userId);
  if (!kyc || kyc.verificationStatus !== "verified") {
    throw new Error("KYC verification required before performing financial operations");
  }
}
