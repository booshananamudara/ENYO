/**
 * Order-related types for use in components and services.
 * Values mirror the Prisma schema enums but are expressed as const unions
 * so they can be used without importing the Prisma client.
 */

/** All possible order statuses (mirrors Prisma OrderStatus enum). */
export const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAYMENT_CONFIRMED',
  'PROCESSING',
  'ORDERING_FROM_VENDOR',
  'ORDERED_FROM_VENDOR',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

/** Order status union type. */
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Lightweight order representation for list views and tables. */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
}

/** A single item within an order, fully detailed. */
export interface OrderItemDetail {
  id: string;
  orderId: string;
  productTitle: string;
  productUrl: string;
  productImage: string | null;
  vendorName: string;
  vendorUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  originalCurrency: string | null;
  originalPrice: number | null;
  vendorOrderId: string | null;
  vendorOrderStatus: string | null;
  actualCostPaid: number | null;
  metadata: Record<string, unknown> | null;
}

/** A single entry in the order's status history timeline. */
export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  changedBy: string | null;
  createdAt: string;
}

/** Address snapshot attached to an order. */
export interface OrderAddress {
  id: string;
  fullName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
}

/** Payment summary embedded in order detail. */
export interface OrderPaymentSummary {
  id: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  paidAt: string | null;
}

/** Full order detail for the order detail page. */
export interface OrderDetail {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  serviceFee: number;
  fxSurcharge: number;
  shippingFee: number;
  total: number;
  currency: string;
  customerNotes: string | null;
  adminNotes: string | null;
  fulfilledBy: string | null;
  fulfilledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDetail[];
  payment: OrderPaymentSummary | null;
  statusHistory: OrderStatusHistoryEntry[];
  address: OrderAddress | null;
}

/** Input for creating a new order. */
export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  addressId: string;
  paymentMethod: string;
  customerNotes?: string;
  currency: string;
}

/** A single item within a CreateOrderInput. */
export interface CreateOrderItemInput {
  productTitle: string;
  productUrl: string;
  productImage?: string;
  vendorName: string;
  vendorUrl?: string;
  quantity: number;
  unitPrice: number;
  originalCurrency?: string;
  originalPrice?: number;
}

/**
 * Cart item as received from the EnyoCart browser extension.
 * This is the raw shape before conversion into a CreateOrderItemInput.
 */
export interface CartItem {
  productTitle: string;
  productUrl: string;
  productImage: string | null;
  vendorName: string;
  vendorUrl: string | null;
  quantity: number;
  unitPrice: number;
  originalCurrency: string | null;
  originalPrice: number | null;
}
