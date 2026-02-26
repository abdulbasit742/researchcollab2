/**
 * Policy Activation Guardrails — blocks unsafe policy activation.
 */

import { runSimulation } from "./simulationSandbox";
import { projectRisk } from "./riskProjectionEngine";
import { runStressTest } from "./networkStressTest";
import { createLogger } from "@/lib/core/logger";
import { supabase } from "@/integrations/supabase/client";

const log = createLogger("policyGuardrails");

const MIN_RESILIENCE_SCORE = 50;
const MAX_RISK_PROJECTION = 70;

export interface GuardrailResult {
  passed: boolean;
  simulationOk: boolean;
  riskOk: boolean;
  stressOk: boolean;
  blockReasons: string[];
}

export async function validatePolicyActivation(policyId: string): Promise<GuardrailResult> {
  const result: GuardrailResult = { passed: true, simulationOk: true, riskOk: true, stressOk: true, blockReasons: [] };

  // Get policy
  const { data: policy } = await (supabase as any).from("governance_policies").select("*").eq("id", policyId).single();
  if (!policy) { result.passed = false; result.blockReasons.push("Policy not found"); return result; }

  // 1. Simulation check
  if (!policy.simulation_report) {
    result.simulationOk = false;
    result.passed = false;
    result.blockReasons.push("No simulation report found — simulation required before activation");
  } else {
    const simReport = policy.simulation_report as any;
    if (simReport.riskAssessment === "high") {
      result.simulationOk = false;
      result.passed = false;
      result.blockReasons.push("Simulation shows high risk assessment");
    }
  }

  // 2. Risk projection
  const risk = await projectRisk();
  if (risk.riskProjectionScore > MAX_RISK_PROJECTION) {
    result.riskOk = false;
    result.passed = false;
    result.blockReasons.push(`Risk projection score ${risk.riskProjectionScore} exceeds threshold ${MAX_RISK_PROJECTION}`);
  }

  // 3. Stress test (dispute spike as baseline)
  const stress = await runStressTest("dispute_spike");
  if (stress.resilienceScore < MIN_RESILIENCE_SCORE) {
    result.stressOk = false;
    result.passed = false;
    result.blockReasons.push(`Resilience score ${stress.resilienceScore} below threshold ${MIN_RESILIENCE_SCORE}`);
  }

  // Log guardrail result
  await (supabase as any).from("governance_audit_logs").insert({
    action: result.passed ? "guardrail_passed" : "guardrail_blocked",
    entity_type: "governance_policies", entity_id: policyId,
    details: { ...result },
  });

  log.info("Policy guardrail check", { policyId, passed: result.passed });
  return result;
}
