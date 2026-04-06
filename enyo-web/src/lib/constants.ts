import type { OrderStatus } from '@/lib/types/order';
import type { PaymentStatus, PaymentMethod } from '@/lib/types/payment';
import type { ReturnStatus } from '@/lib/types/return';

// ---------------------------------------------------------------------------
// Business rules
// ---------------------------------------------------------------------------

/** Service fee percentage applied to order subtotals. */
export const SERVICE_FEE_PERCENT = 5;

/** Maximum number of items allowed in a single cart. */
export const MAX_CART_ITEMS = 50;

/** Number of days after delivery within which a return can be requested. */
export const RETURN_WINDOW_DAYS = 30;

/** Default number of items per page in paginated queries. */
export const DEFAULT_PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Supported currencies (mirrors Prisma Currency enum)
// ---------------------------------------------------------------------------

/** All currencies supported by the platform. */
export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'THB',
  'AUD',
  'CAD',
  'JPY',
  'CNY',
] as const;

/** Currency union type. */
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

// ---------------------------------------------------------------------------
// Payment method registry
// ---------------------------------------------------------------------------

/** Configuration for a single payment method. */
export interface PaymentMethodConfig {
  /** Machine-readable key matching the Prisma PaymentMethod enum. */
  key: PaymentMethod;
  /** Human-readable label for UI display. */
  label: string;
  /** Category grouping for the payment method selector. */
  category: 'card' | 'crypto' | 'bank_transfer' | 'cash' | 'other';
  /** Lucide icon name for rendering in the UI. */
  icon: string;
  /** Whether this method is currently enabled platform-wide. */
  enabledByDefault: boolean;
  /** Currencies this method supports. Empty array means all currencies. */
  supportedCurrencies: Currency[];
}

/** Registry of all payment methods with their configuration. */
export const PAYMENT_METHOD_REGISTRY: Record<PaymentMethod, PaymentMethodConfig> = {
  CREDIT_CARD: {
    key: 'CREDIT_CARD',
    label: 'Credit / Debit Card',
    category: 'card',
    icon: 'CreditCard',
    enabledByDefault: true,
    supportedCurrencies: [],
  },
  CRYPTO_BITCOIN: {
    key: 'CRYPTO_BITCOIN',
    label: 'Bitcoin (BTC)',
    category: 'crypto',
    icon: 'Bitcoin',
    enabledByDefault: true,
    supportedCurrencies: [],
  },
  CRYPTO_ETHEREUM: {
    key: 'CRYPTO_ETHEREUM',
    label: 'Ethereum (ETH)',
    category: 'crypto',
    icon: 'Coins',
    enabledByDefault: true,
    supportedCurrencies: [],
  },
  CRYPTO_USDT: {
    key: 'CRYPTO_USDT',
    label: 'Tether (USDT)',
    category: 'crypto',
    icon: 'DollarSign',
    enabledByDefault: true,
    supportedCurrencies: [],
  },
  CRYPTO_OTHER: {
    key: 'CRYPTO_OTHER',
    label: 'Other Cryptocurrency',
    category: 'crypto',
    icon: 'Coins',
    enabledByDefault: false,
    supportedCurrencies: [],
  },
  PROMPTPAY: {
    key: 'PROMPTPAY',
    label: 'PromptPay',
    category: 'bank_transfer',
    icon: 'QrCode',
    enabledByDefault: true,
    supportedCurrencies: ['THB'],
  },
  GIROPAY: {
    key: 'GIROPAY',
    label: 'Giropay',
    category: 'bank_transfer',
    icon: 'Landmark',
    enabledByDefault: true,
    supportedCurrencies: ['EUR'],
  },
  IDEAL: {
    key: 'IDEAL',
    label: 'iDEAL',
    category: 'bank_transfer',
    icon: 'Landmark',
    enabledByDefault: true,
    supportedCurrencies: ['EUR'],
  },
  PAY_BY_CASH: {
    key: 'PAY_BY_CASH',
    label: 'Pay by Cash',
    category: 'cash',
    icon: 'Banknote',
    enabledByDefault: false,
    supportedCurrencies: [],
  },
  OTHER_LOCAL: {
    key: 'OTHER_LOCAL',
    label: 'Other Local Payment',
    category: 'other',
    icon: 'Wallet',
    enabledByDefault: false,
    supportedCurrencies: [],
  },
};

// ---------------------------------------------------------------------------
// Status display configs
// ---------------------------------------------------------------------------

/** Display configuration for a status value. */
export interface StatusDisplayConfig {
  /** Human-readable label. */
  label: string;
  /** Tailwind CSS classes for the status badge background and text. */
  color: string;
  /** Lucide icon name. */
  icon: string;
}

/** Display configuration for each order status. */
export const STATUS_CONFIG: Record<OrderStatus, StatusDisplayConfig> = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'Clock',
  },
  PAYMENT_CONFIRMED: {
    label: 'Payment Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: 'CheckCircle',
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800',
    icon: 'Loader',
  },
  ORDERING_FROM_VENDOR: {
    label: 'Ordering from Vendor',
    color: 'bg-indigo-100 text-indigo-800',
    icon: 'ShoppingBag',
  },
  ORDERED_FROM_VENDOR: {
    label: 'Ordered from Vendor',
    color: 'bg-indigo-100 text-indigo-800',
    icon: 'PackageCheck',
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-800',
    icon: 'Truck',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    color: 'bg-purple-100 text-purple-800',
    icon: 'MapPin',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'bg-teal-100 text-teal-800',
    icon: 'Navigation',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: 'PackageCheck',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: 'XCircle',
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-800',
    icon: 'RotateCcw',
  },
};

/** Display configuration for each payment status. */
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, StatusDisplayConfig> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'Clock',
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800',
    icon: 'Loader',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800',
    icon: 'CheckCircle',
  },
  FAILED: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
    icon: 'XCircle',
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-800',
    icon: 'RotateCcw',
  },
  PARTIALLY_REFUNDED: {
    label: 'Partially Refunded',
    color: 'bg-orange-100 text-orange-800',
    icon: 'RotateCcw',
  },
};

/** Display configuration for each return status. */
export const RETURN_STATUS_CONFIG: Record<ReturnStatus, StatusDisplayConfig> = {
  REQUESTED: {
    label: 'Requested',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'MessageSquare',
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-blue-100 text-blue-800',
    icon: 'CheckCircle',
  },
  SHIPPING_LABEL_SENT: {
    label: 'Shipping Label Sent',
    color: 'bg-indigo-100 text-indigo-800',
    icon: 'Tag',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    color: 'bg-purple-100 text-purple-800',
    icon: 'Truck',
  },
  RECEIVED_BY_VENDOR: {
    label: 'Received by Vendor',
    color: 'bg-teal-100 text-teal-800',
    icon: 'PackageCheck',
  },
  REFUND_PROCESSING: {
    label: 'Refund Processing',
    color: 'bg-blue-100 text-blue-800',
    icon: 'Loader',
  },
  REFUND_COMPLETED: {
    label: 'Refund Completed',
    color: 'bg-green-100 text-green-800',
    icon: 'CheckCircle',
  },
  ENYO_CREDIT_ISSUED: {
    label: 'Enyo Credit Issued',
    color: 'bg-green-100 text-green-800',
    icon: 'Wallet',
  },
  DENIED: {
    label: 'Denied',
    color: 'bg-red-100 text-red-800',
    icon: 'XCircle',
  },
};
