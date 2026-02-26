/**
 * Governance Engine — policy enforcement, threshold restrictions,
 * automatic freezes, and configurable governance rules.
 */

import { supabase } from "@/integrations/supabase/client";

export interface GovernancePolicy {
  id: string;
  policyName: string;
  threshold: number;
  action: "warn" | "restrict" | "freeze" | "suspend";
  entityType: "user" | "org" | "deal" | "advance";
  isActive: boolean;
}

// Default policies (can be overridden via DB)
const DEFAULT_POLICIES: GovernancePolicy[] = [
  { id: "p1", policyName: "high_fraud_risk_freeze", threshold: 80, action: "freeze", entityType: "user", isActive: true },
  { id: "p2", policyName: "capital_overexposure_restrict", threshold: 500000, action: "restrict", entityType: "advance", isActive: true },
  { id: "p3", policyName: "dispute_rate_warn", threshold: 30, action: "warn", entityType: "user", isActive: true },
  { id: "p4", policyName: "trust_collapse_suspend", threshold: 10, action: "suspend", entityType: "user", isActive: true },
  { id: "p5", policyName: "escrow_anomaly_freeze", threshold: 3, action: "freeze", entityType: "deal", isActive: true },
];

export function getPolicies(): GovernancePolicy[] {
  return [...DEFAULT_POLICIES];
}

export async function evaluateUserPolicies(userId: string): Promise<{
  violations: Array<{ policy: GovernancePolicy; currentValue: number }>;
  actions: string[];
}> {
  const { data: trust } = await supabase
    .from("user_trust_profiles")
    .select("trust_score, dispute_rate, is_frozen")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: advances } = await supabase
    .from("capital_advances")
    .select("approved_amount, repaid_amount")
    .eq("user_id", userId)
    .in("status", ["disbursed", "repaying"]);

  const violations: Array<{ policy: GovernancePolicy; currentValue: number }> = [];
  const actions: string[] = [];

  const disputePercent = (trust?.dispute_rate ?? 0) * 100;
  const trustScore = trust?.trust_score ?? 50;
  const capitalOutstanding = (advances ?? []).reduce(
    (s, a) => s + ((a.approved_amount ?? 0) - (a.repaid_amount ?? 0)), 0
  );

  for (const policy of DEFAULT_POLICIES.filter(p => p.isActive)) {
    let currentValue = 0;
    let violated = false;

    switch (policy.policyName) {
      case "dispute_rate_warn":
        currentValue = disputePercent;
        violated = currentValue > policy.threshold;
        break;
      case "trust_collapse_suspend":
        currentValue = trustScore;
        violated = currentValue < policy.threshold;
        break;
      case "capital_overexposure_restrict":
        currentValue = capitalOutstanding;
        violated = currentValue > policy.threshold;
        break;
    }

    if (violated) {
      violations.push({ policy, currentValue });
      actions.push(`${policy.action}: ${policy.policyName}`);
    }
  }

  return { violations, actions };
}

export async function freezeEscrow(dealId: string, reason: string) {
  const { error } = await supabase
    .from("deal_rooms")
    .update({ escrow_status: "frozen", metadata: { freeze_reason: reason, frozen_at: new Date().toISOString() } })
    .eq("id", dealId);

  if (error) throw error;

  await supabase.from("admin_audit_logs").insert([{
    admin_id: "system",
    action: "escrow_frozen",
    entity_type: "deal",
    entity_id: dealId,
    details: { reason } as any,
  }]);
}

export async function freezeUserCapital(userId: string, reason: string) {
  const { error } = await supabase
    .from("user_trust_profiles")
    .update({ is_frozen: true, frozen_reason: reason, frozen_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) throw error;

  await supabase.from("admin_audit_logs").insert([{
    admin_id: "system",
    action: "user_capital_frozen",
    entity_type: "user",
    entity_id: userId,
    details: { reason } as any,
  }]);
}
