/**
 * Policy Proposal Engine — propose, simulate, approve/reject governance policies.
 */

import { supabase } from "@/integrations/supabase/client";
import { assertGovernmentAdmin } from "@/lib/governance/governanceRoles";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("policyProposalEngine");

export interface PolicyProposal {
  policyId: string;
  name: string;
  description: string;
  policyType: string;
  currentValue: Record<string, unknown>;
  proposedValue: Record<string, unknown>;
  status: string;
  simulationReport: Record<string, unknown> | null;
}

export async function proposePolicyChange(
  name: string,
  description: string,
  policyType: string,
  proposedValue: Record<string, unknown>,
  createdBy: string,
  regionScope?: string,
  tenantScope?: string
): Promise<string> {
  const { data, error } = await (supabase as any).from("governance_policies").insert({
    name, description, policy_type: policyType,
    current_value: {}, proposed_value: proposedValue,
    region_scope: regionScope ?? null, tenant_scope: tenantScope ?? null,
    status: "proposed", created_by: createdBy,
  }).select("id").single();

  if (error) throw new Error(`Proposal failed: ${error.message}`);

  await (supabase as any).from("governance_audit_logs").insert({
    action: "policy_proposed", actor_id: createdBy,
    entity_type: "governance_policies", entity_id: data.id,
    details: { name, policyType, proposedValue },
  });

  log.info("Policy proposed", { id: data.id, name });
  return data.id;
}

export async function approvePolicy(policyId: string, approvedBy: string): Promise<void> {
  await assertGovernmentAdmin(approvedBy);

  const { data: policy } = await (supabase as any).from("governance_policies")
    .select("*").eq("id", policyId).single();
  if (!policy) throw new Error("Policy not found");
  if (policy.status !== "simulated") throw new Error("Policy must be simulated before approval");

  // Get version count
  const { data: versions } = await (supabase as any).from("policy_versions")
    .select("version_number").eq("policy_id", policyId).order("version_number", { ascending: false }).limit(1);
  const nextVersion = (versions?.[0]?.version_number ?? 0) + 1;

  // Create version record
  await (supabase as any).from("policy_versions").insert({
    policy_id: policyId, version_number: nextVersion,
    previous_value: policy.current_value, new_value: policy.proposed_value,
    changed_by: approvedBy,
  });

  // Activate
  await (supabase as any).from("governance_policies").update({
    status: "active", current_value: policy.proposed_value,
    activated_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", policyId);

  await (supabase as any).from("governance_audit_logs").insert({
    action: "policy_approved", actor_id: approvedBy,
    entity_type: "governance_policies", entity_id: policyId,
    details: { version: nextVersion },
  });

  log.info("Policy approved and activated", { policyId, version: nextVersion });
}

export async function rejectPolicy(policyId: string, rejectedBy: string, reason?: string): Promise<void> {
  await assertGovernmentAdmin(rejectedBy);

  await (supabase as any).from("governance_policies").update({
    status: "rejected", updated_at: new Date().toISOString(),
  }).eq("id", policyId);

  await (supabase as any).from("governance_audit_logs").insert({
    action: "policy_rejected", actor_id: rejectedBy,
    entity_type: "governance_policies", entity_id: policyId,
    details: { reason: reason ?? "No reason provided" },
  });

  log.info("Policy rejected", { policyId });
}

export async function getProposalStatus(policyId: string): Promise<PolicyProposal | null> {
  const { data } = await (supabase as any).from("governance_policies")
    .select("*").eq("id", policyId).single();
  if (!data) return null;
  return {
    policyId: data.id, name: data.name, description: data.description,
    policyType: data.policy_type, currentValue: data.current_value,
    proposedValue: data.proposed_value, status: data.status,
    simulationReport: data.simulation_report,
  };
}
