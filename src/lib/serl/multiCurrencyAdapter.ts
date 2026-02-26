/**
 * Multi-Currency Compatibility Layer — fiat, CBDC, stablecoin modeling.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("multiCurrencyAdapter");

export type CurrencyType = "fiat" | "cbdc" | "stablecoin";

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  currencyType: CurrencyType;
  conversionRate: number;
  fxRiskPercent: number;
  complianceCleared: boolean;
  escrowRouted: boolean;
}

const FX_RATES: Record<string, number> = {
  "RERU:USD": 1.0, "RERU:EUR": 0.92, "RERU:GBP": 0.79, "RERU:PKR": 278.5,
  "RERU:AED": 3.67, "RERU:CNY": 7.24, "RERU:JPY": 149.5,
};

export function modelCurrencyConversion(params: {
  amount: number; targetCurrency: string; currencyType: CurrencyType;
}): CurrencyConversion {
  const pair = `RERU:${params.targetCurrency}`;
  const rate = FX_RATES[pair] ?? 1.0;
  const fxRisk = params.currencyType === "cbdc" ? 2 : params.currencyType === "stablecoin" ? 5 : 8;

  log.info("Currency conversion modeled", { target: params.targetCurrency, rate });

  return {
    fromCurrency: "RERU", toCurrency: params.targetCurrency,
    currencyType: params.currencyType, conversionRate: rate,
    fxRiskPercent: fxRisk, complianceCleared: true, escrowRouted: true,
  };
}

export function getSupportedCurrencies(): string[] {
  return Object.keys(FX_RATES).map(k => k.split(":")[1]);
}
