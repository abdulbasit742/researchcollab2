/**
 * Century-Scale Governance Evolution Model — era simulation, voting recalibration.
 */

import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("governanceEvolution");

export interface GovernanceEra {
  id: string;
  eraNumber: number;
  eraName: string;
  startYear: number;
  endYear: number | null;
  riskProfile: number;
  trustShift: number;
  capitalEfficiency: number;
  innovationGrowth: number;
  governanceModel: string;
}

export async function getGovernanceEras(): Promise<GovernanceEra[]> {
  const { data } = await (supabase as any).from("governance_era_profiles").select("*").order("era_number");
  return (data ?? []).map((e: any) => ({
    id: e.id, eraNumber: e.era_number, eraName: e.era_name, startYear: e.start_year,
    endYear: e.end_year, riskProfile: e.risk_profile, trustShift: e.trust_shift,
    capitalEfficiency: e.capital_efficiency, innovationGrowth: e.innovation_growth,
    governanceModel: e.governance_model,
  }));
}

export async function simulateGovernanceEvolution(decades: number = 10): Promise<GovernanceEra[]> {
  const currentYear = new Date().getFullYear();
  const eras: GovernanceEra[] = [];

  const models = ["centralized", "federated", "sovereign", "autonomous", "constitutional"];
  let riskProfile = 60;
  let trustShift = 0;
  let capitalEfficiency = 50;
  let innovationGrowth = 40;

  for (let i = 0; i < decades; i++) {
    const decadeStart = currentYear + i * 10;
    const modelIndex = Math.min(models.length - 1, Math.floor(i / 2));

    // Evolve parameters
    riskProfile = Math.max(10, riskProfile - 5 + Math.round(Math.random() * 4 - 2));
    trustShift = Math.round(trustShift + 3 - Math.random() * 2);
    capitalEfficiency = Math.min(95, capitalEfficiency + 4);
    innovationGrowth = Math.min(95, innovationGrowth + 5);

    eras.push({
      id: `sim-era-${i + 1}`, eraNumber: i + 1, eraName: `Era ${i + 1}: ${models[modelIndex]}`,
      startYear: decadeStart, endYear: decadeStart + 9, riskProfile, trustShift,
      capitalEfficiency, innovationGrowth, governanceModel: models[modelIndex],
    });
  }

  log.info("Governance evolution simulated", { decades, finalModel: eras[eras.length - 1]?.governanceModel });
  return eras;
}

export async function seedGovernanceEras(): Promise<void> {
  const eras = [
    { era_number: 1, era_name: "Foundation Era", start_year: 2026, risk_profile: 65, trust_shift: 0, capital_efficiency: 40, innovation_growth: 30, governance_model: "centralized" },
    { era_number: 2, era_name: "Growth Era", start_year: 2031, risk_profile: 50, trust_shift: 15, capital_efficiency: 55, innovation_growth: 50, governance_model: "federated" },
    { era_number: 3, era_name: "Scale Era", start_year: 2041, risk_profile: 35, trust_shift: 30, capital_efficiency: 70, innovation_growth: 70, governance_model: "sovereign" },
    { era_number: 4, era_name: "Dominance Era", start_year: 2056, risk_profile: 25, trust_shift: 45, capital_efficiency: 85, innovation_growth: 85, governance_model: "autonomous" },
    { era_number: 5, era_name: "Civilization Era", start_year: 2076, risk_profile: 15, trust_shift: 60, capital_efficiency: 95, innovation_growth: 95, governance_model: "constitutional" },
  ];

  for (const era of eras) {
    await (supabase as any).from("governance_era_profiles").upsert(era, { onConflict: "era_number" });
  }
  log.info("Governance eras seeded", { count: eras.length });
}
