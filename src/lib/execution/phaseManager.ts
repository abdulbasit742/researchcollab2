/**
 * Phase-Based Activation Framework — enforces sequential feature rollout.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("phaseManager");

export interface PlatformPhase {
  id: number;
  name: string;
  description: string | null;
  phaseOrder: number;
  activatedAt: string | null;
  stabilityScore: number;
  regulatoryRiskScore: number;
  publicExposureLevel: string;
  isActive: boolean;
  prerequisites: string[];
}

export async function getAllPhases(): Promise<PlatformPhase[]> {
  const { data } = await (supabase as any).from("platform_phases").select("*").order("phase_order");
  return (data ?? []).map(mapPhase);
}

export async function getActivePhase(): Promise<PlatformPhase | null> {
  const phases = await getAllPhases();
  const active = phases.filter(p => p.isActive).sort((a, b) => b.phaseOrder - a.phaseOrder);
  return active[0] ?? null;
}

export async function getMaxActivePhaseOrder(): Promise<number> {
  const phase = await getActivePhase();
  return phase?.phaseOrder ?? 0;
}

export async function isPhaseActive(phaseOrder: number): Promise<boolean> {
  const { data } = await (supabase as any).from("platform_phases")
    .select("is_active").eq("phase_order", phaseOrder).maybeSingle();
  return data?.is_active ?? false;
}

export async function activatePhase(phaseOrder: number, stabilityScore: number): Promise<void> {
  // Ensure previous phase is active
  if (phaseOrder > 0) {
    const prevActive = await isPhaseActive(phaseOrder - 1);
    if (!prevActive) throw new Error(`Phase ${phaseOrder - 1} must be active before activating phase ${phaseOrder}`);
  }

  // Stability check
  if (stabilityScore < 70) throw new Error(`Stability score ${stabilityScore} below minimum 70 for phase activation`);

  const { error } = await (supabase as any).from("platform_phases").update({
    is_active: true, activated_at: new Date().toISOString(),
    stability_score: stabilityScore, updated_at: new Date().toISOString(),
  }).eq("phase_order", phaseOrder);

  if (error) throw new Error(`Phase activation failed: ${error.message}`);
  log.info("Phase activated", { phaseOrder, stabilityScore });
}

export async function deactivatePhase(phaseOrder: number): Promise<void> {
  // Deactivate this and all higher phases
  const { error } = await (supabase as any).from("platform_phases").update({
    is_active: false, updated_at: new Date().toISOString(),
  }).gte("phase_order", phaseOrder);

  if (error) throw new Error(`Phase deactivation failed: ${error.message}`);
  log.warn("Phase deactivated (cascade)", { fromPhase: phaseOrder });
}

export async function isFeatureAccessible(requiredPhase: number): Promise<boolean> {
  const maxActive = await getMaxActivePhaseOrder();
  return maxActive >= requiredPhase;
}

function mapPhase(d: any): PlatformPhase {
  return {
    id: d.id, name: d.name, description: d.description, phaseOrder: d.phase_order,
    activatedAt: d.activated_at, stabilityScore: d.stability_score ?? 0,
    regulatoryRiskScore: d.regulatory_risk_score ?? 0,
    publicExposureLevel: d.public_exposure_level, isActive: d.is_active,
    prerequisites: d.prerequisites ?? [],
  };
}
