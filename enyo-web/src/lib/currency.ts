/**
 * Currency formatting and foreign exchange calculation utilities.
 */

/** Map of ISO 4217 currency codes to their display symbols. */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
  THB: '\u0E3F',
  AUD: 'A$',
  CAD: 'C$',
  JPY: '\u00A5',
  CNY: '\u00A5',
};

/**
 * Format a numeric amount as a locale-aware currency string.
 *
 * @param amount  - The numeric amount to format.
 * @param currency - ISO 4217 currency code (default: 'USD').
 * @returns A formatted currency string, e.g. "$1,234.56".
 */
export function formatCurrencyAmount(amount: number, currency: string = 'USD'): string {
  // JPY has no minor unit, so we use 0 fraction digits
  const fractionDigits = currency === 'JPY' ? 0 : 2;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

/**
 * Calculate the FX surcharge amount for a given base amount and surcharge percent.
 *
 * @param amount           - The base amount in the target currency.
 * @param surchargePercent - The surcharge percentage (e.g. 3 for 3%).
 * @returns The surcharge amount, rounded to 2 decimal places.
 */
export function calculateFxSurcharge(amount: number, surchargePercent: number): number {
  return Math.round(amount * (surchargePercent / 100) * 100) / 100;
}

/**
 * Convert an amount from one currency to another using exchange rates,
 * optionally applying an FX surcharge.
 *
 * Rates are expressed as "1 unit of base currency = X units of this currency",
 * so to convert from currency A to currency B:
 *   result = amount * (toRate / fromRate)
 *
 * @param amount           - The amount in the source currency.
 * @param fromRate         - Exchange rate of the source currency (relative to base).
 * @param toRate           - Exchange rate of the target currency (relative to base).
 * @param surchargePercent - Optional FX surcharge percentage (default: 0).
 * @returns An object with the converted amount and the surcharge amount.
 */
export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number,
  surchargePercent: number = 0
): { convertedAmount: number; surcharge: number } {
  if (fromRate <= 0 || toRate <= 0) {
    throw new Error('Exchange rates must be positive numbers');
  }

  const raw = amount * (toRate / fromRate);
  const converted = Math.round(raw * 100) / 100;
  const surcharge = calculateFxSurcharge(converted, surchargePercent);

  return {
    convertedAmount: converted,
    surcharge,
  };
}
