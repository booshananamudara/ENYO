/**
 * Payment-related types for use in components and services.
 * Values mirror the Prisma schema enums.
 */

/** All possible payment statuses (mirrors Prisma PaymentStatus enum). */
export const PAYMENT_STATUSES = [
  'PENDING',
  'PROCESSING',
  'CONFIRMED',
  'FAILED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
] as const;

/** Payment status union type. */
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** All possible payment methods (mirrors Prisma PaymentMethod enum). */
export const PAYMENT_METHODS = [
  'CREDIT_CARD',
  'CRYPTO_BITCOIN',
  'CRYPTO_ETHEREUM',
  'CRYPTO_USDT',
  'CRYPTO_OTHER',
  'PROMPTPAY',
  'GIROPAY',
  'IDEAL',
  'PAY_BY_CASH',
  'OTHER_LOCAL',
] as const;

/** Payment method union type. */
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Full payment detail for order detail pages and admin views. */
export interface PaymentDetail {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  bankfulTxId: string | null;
  cryptoAddress: string | null;
  cryptoCurrency: string | null;
  cryptoAmount: number | null;
  exchangeRate: number | null;
  processingFee: number | null;
  paidAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  refundedAmount: number | null;
  refundedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight payment representation for admin list views. */
export interface PaymentSummary {
  id: string;
  orderId: string;
  orderNumber: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
}

/** Input for initiating a payment on an order. */
export interface InitiatePaymentInput {
  orderId: string;
  method: PaymentMethod;
  currency: string;
}
