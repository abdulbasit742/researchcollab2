/**
 * Risk Scoring Engine — composite compliance risk score.
 */

import { supabase } from "@/integrations/supabase/client";
import { calculateAMLRiskScore } from "./amlEngine";
import { getKYCStatus } from "./kycService";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("riskScoring");

export interface ComplianceRiskAssessment {
  userId: string;
  complianceRiskScore: number;
  kycStatus: string;
  amlScore: number;
  disputeRate: number;
  refundRate: number;
  flagged: boolean;
}

export async function calculateComplianceRiskScore(userId: string): Promise<ComplianceRiskAssessment> {
  // KYC component
  const kyc = await getKYCStatus(userId);
  const kycScore = kyc?.verificationStatus === "verified" ? 0 : kyc?.verificationStatus === "pending" ? 15 : 30;

  // AML component
  const aml = await calculateAMLRiskScore(userId);

  // Dispute rate
  const { data: deals } = await supabase.from("deal_rooms").select("status").or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
  const allDeals = deals ?? [];
  const disputeRate = allDeals.length > 0 ? allDeals.filter((d) => d.status === "disputed").length / allDeals.length : 0;

  // Refund rate
  const { data: txs } = await (supabase as any)
    .from("wallet_transactions").select("type").eq("user_id", userId);
  const allTxs = txs ?? [];
  const refundRate = allTxs.length > 0 ? allTxs.filter((t: any) => t.type === "refund").length / allTxs.length : 0;

  // Unresolved compliance alerts
  const { data: alerts } = await (supabase as any)
    .from("compliance_alerts").select("id").eq("user_id", userId).eq("resolved", false);
  const alertPenalty = Math.min(20, (alerts?.length ?? 0) * 5);

  // Composite score
  const composite = Math.min(100, Math.round(
    kycScore * 0.2 + aml.amlScore * 0.35 + disputeRate * 100 * 0.15 + refundRate * 100 * 0.15 + alertPenalty * 0.15
  ));

  const flagged = composite >= 50;

  // Update risk profile
  const { data: existing } = await (supabase as any)
    .from("compliance_risk_profiles").select("id").eq("user_id", userId).maybeSingle();

  if (existing) {
    await (supabase as any).from("compliance_risk_profiles").update({
      compliance_risk_score: composite, flagged, last_assessed_at: new Date().toISOString(),
    }).eq("user_id", userId);
  } else {
    await (supabase as any).from("compliance_risk_profiles").insert({
      user_id: userId, aml_score: aml.amlScore, compliance_risk_score: composite, flagged,
    });
  }

  log.info("Compliance risk scored", { userId, composite, flagged });

  return {
    userId, complianceRiskScore: composite, kycStatus: kyc?.verificationStatus ?? "none",
    amlScore: aml.amlScore, disputeRate: Math.round(disputeRate * 100), refundRate: Math.round(refundRate * 100), flagged,
  };
}
