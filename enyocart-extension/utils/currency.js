/**
 * @fileoverview Currency utility — price formatting and conversion helpers.
 * Exchange rates are 1:1 placeholders until Bankful.com API integration is live.
 */

/** @type {Object.<string, string>} Currency code → symbol map */
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  THB: '฿',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  KRW: '₩',
  INR: '₹',
  BRL: 'R$',
  MXN: 'MX$',
  SGD: 'S$',
  HKD: 'HK$',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  NZD: 'NZ$',
  ZAR: 'R',
};

/**
 * Exchange rates relative to USD (placeholder — all 1:1 until Bankful.com API).
 * TODO: Replace with live rates from Bankful.com exchange rate API.
 * @type {Object.<string, number>}
 */
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 1,
  GBP: 1,
  JPY: 1,
  CNY: 1,
  THB: 1,
  AUD: 1,
  CAD: 1,
  CHF: 1,
  KRW: 1,
  INR: 1,
  BRL: 1,
  MXN: 1,
  SGD: 1,
  HKD: 1,
};

/**
 * Get the currency symbol for a given currency code.
 * @param {string} currencyCode - ISO 4217 currency code.
 * @returns {string} Currency symbol, or the code itself as fallback.
 */
export function getCurrencySymbol(currencyCode) {
  return CURRENCY_SYMBOLS[currencyCode?.toUpperCase()] || currencyCode || '$';
}

/**
 * Format a numeric price with its currency symbol.
 * @param {number} amount - Numeric price value.
 * @param {string} [currencyCode='USD'] - ISO 4217 currency code.
 * @param {Object} [options] - Formatting options.
 * @param {number} [options.decimals=2] - Number of decimal places.
 * @returns {string} Formatted price string (e.g. "$29.99", "฿999").
 */
export function formatPrice(amount, currencyCode = 'USD', options = {}) {
  const { decimals = 2 } = options;
  const symbol = getCurrencySymbol(currencyCode);
  const code = currencyCode?.toUpperCase() || 'USD';

  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0.${'0'.repeat(decimals)}`;
  }

  const formatted = Number(amount).toFixed(decimals);

  // Some currencies display symbol after the amount
  const suffixCurrencies = ['SEK', 'NOK', 'DKK'];
  if (suffixCurrencies.includes(code)) {
    return `${formatted} ${symbol}`;
  }

  return `${symbol}${formatted}`;
}

/**
 * Parse a price string (with symbols, commas, spaces) into a float.
 * @param {string} priceStr - Raw price string from a webpage (e.g. "$1,234.56", "฿999").
 * @returns {number} Parsed numeric value, or 0 if parsing fails.
 */
export function parsePrice(priceStr) {
  if (!priceStr) return 0;
  // Remove all non-numeric characters except period and comma
  const cleaned = String(priceStr).replace(/[^\d.,]/g, '');
  if (!cleaned) return 0;

  // Handle formats like "1.234,56" (European) vs "1,234.56" (US)
  const lastComma = cleaned.lastIndexOf(',');
  const lastPeriod = cleaned.lastIndexOf('.');

  let normalized;
  if (lastComma > lastPeriod) {
    // European format: 1.234,56 → 1234.56
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // US format: 1,234.56 → 1234.56
    normalized = cleaned.replace(/,/g, '');
  }

  const value = parseFloat(normalized);
  return isNaN(value) ? 0 : value;
}

/**
 * Convert an amount from one currency to another.
 * NOTE: Currently returns 1:1 conversion for all currencies.
 * TODO: Integrate Bankful.com exchange rate API for live rates.
 *
 * @param {number} amount - Source amount.
 * @param {string} fromCurrency - Source currency code.
 * @param {string} toCurrency - Target currency code.
 * @returns {number} Converted amount.
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = EXCHANGE_RATES[fromCurrency?.toUpperCase()] || 1;
  const toRate = EXCHANGE_RATES[toCurrency?.toUpperCase()] || 1;

  // Convert to USD base, then to target
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

/**
 * Calculate cart subtotal in a given currency.
 * @param {ProductData[]} cartItems - Array of cart items.
 * @param {string} [targetCurrency='USD'] - Currency to display in.
 * @returns {{subtotal: number, formatted: string}}
 */
export function calculateSubtotal(cartItems, targetCurrency = 'USD') {
  const subtotal = cartItems.reduce((sum, item) => {
    const converted = convertCurrency(item.price || 0, item.currency || 'USD', targetCurrency);
    return sum + converted * (item.quantity || 1);
  }, 0);

  return {
    subtotal,
    formatted: formatPrice(subtotal, targetCurrency),
  };
}

/**
 * Detect the currency code from a price string by scanning for known symbols.
 * @param {string} priceStr - Raw price string.
 * @returns {string} Detected currency code, defaulting to 'USD'.
 */
export function detectCurrency(priceStr) {
  if (!priceStr) return 'USD';
  const str = String(priceStr).trim();

  if (str.startsWith('£') || str.endsWith('£')) return 'GBP';
  if (str.startsWith('€') || str.endsWith('€')) return 'EUR';
  if (str.startsWith('¥') || str.endsWith('¥')) return 'JPY';
  if (str.startsWith('฿') || str.endsWith('฿')) return 'THB';
  if (str.startsWith('₹') || str.endsWith('₹')) return 'INR';
  if (str.startsWith('₩') || str.endsWith('₩')) return 'KRW';
  if (str.startsWith('A$')) return 'AUD';
  if (str.startsWith('C$')) return 'CAD';
  if (str.startsWith('S$')) return 'SGD';
  if (str.startsWith('HK$')) return 'HKD';
  if (str.startsWith('NZ$')) return 'NZD';

  return 'USD';
}
