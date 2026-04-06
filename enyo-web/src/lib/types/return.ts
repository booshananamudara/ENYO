/**
 * Return-related types for use in components and services.
 * Values mirror the Prisma schema enums.
 */

/** All possible return statuses (mirrors Prisma ReturnStatus enum). */
export const RETURN_STATUSES = [
  'REQUESTED',
  'APPROVED',
  'SHIPPING_LABEL_SENT',
  'IN_TRANSIT',
  'RECEIVED_BY_VENDOR',
  'REFUND_PROCESSING',
  'REFUND_COMPLETED',
  'ENYO_CREDIT_ISSUED',
  'DENIED',
] as const;

/** Return status union type. */
export type ReturnStatus = (typeof RETURN_STATUSES)[number];

/** Lightweight return representation for list views. */
export interface ReturnSummary {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  status: ReturnStatus;
  reason: string;
  refundAmount: number | null;
  enyoCreditAmount: number | null;
  itemCount: number;
  createdAt: string;
}

/** A single item within a return, fully detailed. */
export interface ReturnItemDetail {
  id: string;
  returnId: string;
  orderItemId: string;
  quantity: number;
  reason: string | null;
  /** Denormalized product info from the original order item. */
  productTitle: string;
  productImage: string | null;
  vendorName: string;
}

/** Full return detail for the return detail page. */
export interface ReturnDetail {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  status: ReturnStatus;
  reason: string;
  resolution: string | null;
  refundAmount: number | null;
  enyoCreditAmount: number | null;
  shippingLabelUrl: string | null;
  trackingNumber: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  items: ReturnItemDetail[];
}

/** Input for a single item in a return request. */
export interface ReturnItemInput {
  orderItemId: string;
  quantity: number;
  reason?: string;
}

/** Input for creating a new return request. */
export interface CreateReturnInput {
  orderId: string;
  items: ReturnItemInput[];
  reason: string;
}
