/**
 * Multi-Currency Service — conversion and enforcement.
 */

import { createLogger } from "@/lib/core/logger";

const log = createLogger("currencyService");

// Static exchange rates (production would use live API)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { PKR: 278.5, EUR: 0.92, GBP: 0.79, AED: 3.67, INR: 83.4, USD: 1 },
  PKR: { USD: 0.0036, EUR: 0.0033, GBP: 0.0028, AED: 0.013, INR: 0.30, PKR: 1 },
  EUR: { USD: 1.09, PKR: 303.0, GBP: 0.86, AED: 4.0, INR: 90.8, EUR: 1 },
  GBP: { USD: 1.27, PKR: 353.0, EUR: 1.16, AED: 4.66, INR: 105.8, GBP: 1 },
  AED: { USD: 0.27, PKR: 75.9, EUR: 0.25, GBP: 0.21, INR: 22.7, AED: 1 },
  INR: { USD: 0.012, PKR: 3.34, EUR: 0.011, GBP: 0.0094, AED: 0.044, INR: 1 },
};

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;

  const rates = EXCHANGE_RATES[fromCurrency];
  if (!rates || !rates[toCurrency]) {
    throw new Error(`Unsupported currency pair: ${fromCurrency} → ${toCurrency}`);
  }

  const converted = Math.round(amount * rates[toCurrency] * 100) / 100;
  log.info("Currency converted", { amount, fromCurrency, toCurrency, converted });
  return converted;
}

export function assertCurrencyMatch(dealCurrency: string, walletCurrency: string): void {
  if (dealCurrency !== walletCurrency) {
    throw new Error(
      `Currency mismatch: deal uses ${dealCurrency} but wallet uses ${walletCurrency}. Explicit conversion required.`
    );
  }
}

export function getSupportedCurrencies(): string[] {
  return Object.keys(EXCHANGE_RATES);
}

export function getExchangeRate(from: string, to: string): number {
  if (from === to) return 1;
  const rates = EXCHANGE_RATES[from];
  if (!rates || !rates[to]) throw new Error(`No rate for ${from} → ${to}`);
  return rates[to];
}
