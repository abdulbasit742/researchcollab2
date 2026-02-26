/**
 * GIAB Silent Mode Phase — controls GIAB operational mode.
 */

import { isPhaseActive } from "./phaseManager";
import { createLogger } from "@/lib/core/logger";

const log = createLogger("giabMode");

export type GIABMode = "silent" | "advisory" | "institutional" | "public";

let currentMode: GIABMode = "silent";

export async function getGIABMode(): Promise<GIABMode> {
  // Auto-determine based on phase
  const phase4 = await isPhaseActive(4);
  const phase5 = await isPhaseActive(5);
  const phase9 = await isPhaseActive(9);

  if (phase9) return "public";
  if (phase5) return "institutional";
  if (phase4) return "advisory";
  return "silent";
}

export function getGIABModeSync(): GIABMode {
  return currentMode;
}

export function setGIABMode(mode: GIABMode): void {
  log.info("GIAB mode changed", { from: currentMode, to: mode });
  currentMode = mode;
}

export function isGIABVisible(requiredMode: GIABMode): boolean {
  const modeOrder: GIABMode[] = ["silent", "advisory", "institutional", "public"];
  return modeOrder.indexOf(currentMode) >= modeOrder.indexOf(requiredMode);
}

export function getGIABModeDescription(mode: GIABMode): string {
  switch (mode) {
    case "silent": return "Internal optimization only — no visibility";
    case "advisory": return "Governance-visible recommendations";
    case "institutional": return "Credit-rated institutional advisory";
    case "public": return "Aggregated public insights";
  }
}
