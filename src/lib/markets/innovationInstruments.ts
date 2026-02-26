/**
 * Innovation-Backed Capital Instruments — structured, escrow-backed, risk-scored.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("innovationInstruments");

export type InstrumentType = "innovation_bond" | "milestone_revenue_note" | "cross_border_research_note" | "institutional_participation_unit";

export interface CapitalInstrument {
  type: InstrumentType;
  principal: number;
  escrowBacking: number;
  maturityDays: number;
  riskScore: number;
  expectedYield: number;
  defaultHandling: string;
  simulationPassed: boolean;
}

export function structureInstrument(params: {
  type: InstrumentType; principal: number; escrowBacking: number; maturityDays: number;
}): CapitalInstrument {
  if (params.escrowBacking < params.principal * 0.5) {
    throw new Error("Minimum 50% escrow collateralization required for all instruments");
  }

  const collateralRatio = params.principal > 0 ? params.escrowBacking / params.principal : 0;
  const typeRisk: Record<InstrumentType, number> = {
    innovation_bond: 35, milestone_revenue_note: 45, cross_border_research_note: 55, institutional_participation_unit: 30,
  };

  const riskScore = Math.min(100, Math.round(typeRisk[params.type] + (1 - collateralRatio) * 25));
  const expectedYield = Math.round((2 + riskScore * 0.06) * Math.min(2, params.maturityDays / 365) * 100) / 100;

  const defaultHandling: Record<InstrumentType, string> = {
    innovation_bond: "escrow_liquidation_then_pool_recovery",
    milestone_revenue_note: "milestone_clawback_then_escrow",
    cross_border_research_note: "cross_border_arbitration_then_escrow",
    institutional_participation_unit: "pro_rata_escrow_distribution",
  };

  const instrument: CapitalInstrument = {
    type: params.type, principal: params.principal, escrowBacking: params.escrowBacking,
    maturityDays: params.maturityDays, riskScore, expectedYield,
    defaultHandling: defaultHandling[params.type], simulationPassed: false,
  };

  // Run simulation
  instrument.simulationPassed = simulateInstrument(instrument);
  log.info("Instrument structured", { type: params.type, riskScore, simulationPassed: instrument.simulationPassed });
  return instrument;
}

function simulateInstrument(instrument: CapitalInstrument): boolean {
  if (instrument.riskScore > 85) return false;
  if (instrument.escrowBacking < instrument.principal * 0.5) return false;
  if (instrument.maturityDays < 30) return false;
  if (instrument.maturityDays > 3650) return false;
  return true;
}
