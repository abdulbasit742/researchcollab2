/**
 * Investor Narrative Mode Switch — controls external positioning.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("investorNarrative");

export type NarrativeLayer = 1 | 2 | 3 | 4 | 5;

export interface NarrativeProfile {
  layer: NarrativeLayer;
  title: string;
  positioning: string;
  targetInvestors: string[];
  keyMetrics: string[];
  riskDisclosure: string;
}

const NARRATIVES: NarrativeProfile[] = [
  {
    layer: 1, title: "SaaS Productivity Platform",
    positioning: "Cloud-based project management and collaboration for academic institutions",
    targetInvestors: ["Angel investors", "Pre-seed funds", "EdTech accelerators"],
    keyMetrics: ["MAU", "Retention", "Institutional signups", "NPS"],
    riskDisclosure: "Standard SaaS execution risk",
  },
  {
    layer: 2, title: "Institutional Escrow Infrastructure",
    positioning: "Trust-backed execution platform with escrow-secured academic collaborations",
    targetInvestors: ["Seed funds", "FinTech investors", "Impact investors"],
    keyMetrics: ["GMV", "Escrow volume", "Completion rate", "Trust scores"],
    riskDisclosure: "Financial services compliance requirements",
  },
  {
    layer: 3, title: "Academic Capital Coordination Network",
    positioning: "Multi-institution capital coordination with credit scoring and structured pools",
    targetInvestors: ["Series A funds", "Institutional investors", "Development banks"],
    keyMetrics: ["Capital deployed", "Credit ratings issued", "Pool performance", "Cross-border volume"],
    riskDisclosure: "Capital markets regulatory exposure in multiple jurisdictions",
  },
  {
    layer: 4, title: "Research Capital Market System",
    positioning: "Structured research bond issuance with innovation-indexed capital instruments",
    targetInvestors: ["Growth equity", "Sovereign wealth funds", "DFIs"],
    keyMetrics: ["Bond issuance volume", "Default rate", "Innovation ROI", "Market stability index"],
    riskDisclosure: "Securities regulation, cross-border settlement compliance",
  },
  {
    layer: 5, title: "Sovereign Reserve-Grade Institutional Backbone",
    positioning: "Research-backed reserve unit system for cross-border academic settlement",
    targetInvestors: ["Sovereign funds", "Central bank partnerships", "Multilateral institutions"],
    keyMetrics: ["Reserve backing ratio", "Global reserve index", "Settlement volume", "Stability score"],
    riskDisclosure: "Monetary policy coordination, sovereign compliance frameworks",
  },
];

let activeLayer: NarrativeLayer = 1;

export function getNarrativeProfile(layer?: NarrativeLayer): NarrativeProfile {
  return NARRATIVES[(layer ?? activeLayer) - 1];
}

export function setActiveNarrative(layer: NarrativeLayer): void {
  log.info("Narrative layer switched", { from: activeLayer, to: layer });
  activeLayer = layer;
}

export function getActiveNarrative(): NarrativeProfile {
  return NARRATIVES[activeLayer - 1];
}

export function getAllNarratives(): NarrativeProfile[] {
  return [...NARRATIVES];
}

export function recommendNarrative(params: {
  fundingStage: string; regulatoryClarity: number; investorSophistication: string; phaseMaturity: number;
}): NarrativeLayer {
  if (params.phaseMaturity >= 7 && params.regulatoryClarity > 80) return 5;
  if (params.phaseMaturity >= 5 && params.regulatoryClarity > 60) return 4;
  if (params.phaseMaturity >= 3) return 3;
  if (params.phaseMaturity >= 1) return 2;
  return 1;
}
