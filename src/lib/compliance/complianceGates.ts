/**
 * Compliance Enforcement Gates — blocks non-compliant financial actions.
 */

import { supabase } from "@/integrations/supabase/client";
import { getKYCStatus } from "./kycService";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("complianceGates");

export async function assertComplianceCleared(userId: string): Promise<void> {
  // 1. KYC check
  const kyc = await getKYCStatus(userId);
  if (!kyc || kyc.verificationStatus !== "verified") {
    throw new Error("Compliance block: KYC verification required");
  }

  // 2. AML risk check
  const { data: riskProfile } = await (supabase as any)
    .from("compliance_risk_profiles")
    .select("aml_score, compliance_risk_score, flagged")
    .eq("user_id", userId)
    .maybeSingle();

  if (riskProfile?.flagged) {
    throw new Error("Compliance block: account flagged for high risk");
  }

  if ((riskProfile?.aml_score ?? 0) >= 75) {
    throw new Error("Compliance block: AML risk score exceeds threshold");
  }

  // 3. Unresolved compliance alerts
  const { data: alerts } = await (supabase as any)
    .from("compliance_alerts")
    .select("id, severity")
    .eq("user_id", userId)
    .eq("resolved", false)
    .in("severity", ["high", "critical"]);

  if (alerts && alerts.length > 0) {
    throw new Error(`Compliance block: ${alerts.length} unresolved high-severity alert(s)`);
  }

  log.info("Compliance cleared", { userId });
}

export async function assertWithdrawalCompliant(userId: string, amount: number): Promise<void> {
  await assertComplianceCleared(userId);

  if (amount > 100000) {
    const { data: riskProfile } = await (supabase as any)
      .from("compliance_risk_profiles")
      .select("compliance_risk_score")
      .eq("user_id", userId)
      .maybeSingle();

    if ((riskProfile?.compliance_risk_score ?? 0) >= 40) {
      throw new Error("Compliance block: high-value withdrawal requires lower risk score");
    }
  }
}

export async function assertPoolContributionCompliant(userId: string, amount: number): Promise<void> {
  await assertComplianceCleared(userId);

  // Capital source must be declared for large contributions
  if (amount > 25000) {
    const { data: source } = await (supabase as any)
      .from("capital_source_profiles")
      .select("source_verified")
      .eq("contributor_id", userId)
      .eq("source_verified", true)
      .limit(1)
      .maybeSingle();

    if (!source) {
      throw new Error("Compliance block: verified capital source required for contributions > 25,000");
    }
  }
}
