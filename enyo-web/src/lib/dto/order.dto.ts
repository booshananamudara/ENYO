import type { OrderSummary, OrderDetail, OrderItemDetail } from '@/lib/types/order';
import type { Order, OrderItem, Payment, OrderStatusHistory, Address } from '@prisma/client';

type OrderWithRelations = Order & {
  items: OrderItem[];
  payment: Payment | null;
  statusHistory?: OrderStatusHistory[];
  address?: Address | null;
};

/** Map a Prisma order to a lightweight summary for list views. */
export function toOrderSummaryDto(order: OrderWithRelations): OrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    total: Number(order.total),
    currency: order.currency,
    itemCount: order.items.length,
    createdAt: order.createdAt.toISOString(),
  };
}

/** Map a Prisma order item to a client-safe DTO (strips actualCostPaid). */
export function toOrderItemDto(item: OrderItem): OrderItemDetail {
  return {
    id: item.id,
    orderId: item.orderId,
    productTitle: item.productTitle,
    productUrl: item.productUrl,
    productImage: item.productImage,
    vendorName: item.vendorName,
    vendorUrl: item.vendorUrl,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: Number(item.totalPrice),
    originalCurrency: item.originalCurrency,
    originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
    vendorOrderId: item.vendorOrderId,
    vendorOrderStatus: item.vendorOrderStatus,
    actualCostPaid: null,
    metadata: item.metadata as Record<string, unknown> | null,
  };
}

/** Map a Prisma order item with admin fields visible. */
export function toAdminOrderItemDto(item: OrderItem): OrderItemDetail {
  return {
    ...toOrderItemDto(item),
    actualCostPaid: item.actualCostPaid ? Number(item.actualCostPaid) : null,
  };
}

/** Map a Prisma order to a full detail DTO for customer views. */
export function toOrderDetailDto(order: OrderWithRelations): OrderDetail {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status,
    subtotal: Number(order.subtotal),
    serviceFee: Number(order.serviceFee),
    fxSurcharge: Number(order.fxSurcharge),
    shippingFee: Number(order.shippingFee),
    total: Number(order.total),
    currency: order.currency,
    customerNotes: order.customerNotes,
    adminNotes: null,
    fulfilledBy: null,
    fulfilledAt: null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(toOrderItemDto),
    payment: order.payment
      ? {
          id: order.payment.id,
          method: order.payment.method,
          status: order.payment.status,
          amount: Number(order.payment.amount),
          currency: order.payment.currency,
          paidAt: order.payment.paidAt?.toISOString() ?? null,
        }
      : null,
    statusHistory: (order.statusHistory ?? []).map((h) => ({
      id: h.id,
      orderId: h.orderId,
      status: h.status,
      note: h.note,
      changedBy: h.changedBy,
      createdAt: h.createdAt.toISOString(),
    })),
    address: order.address
      ? {
          id: order.address.id,
          fullName: order.address.fullName,
          phone: order.address.phone,
          line1: order.address.line1,
          line2: order.address.line2,
          city: order.address.city,
          state: order.address.state,
          postalCode: order.address.postalCode,
          country: order.address.country,
        }
      : null,
  };
}

/** Map a Prisma order to a full admin detail DTO (includes internal fields). */
export function toAdminOrderDetailDto(order: OrderWithRelations): OrderDetail {
  return {
    ...toOrderDetailDto(order),
    adminNotes: order.adminNotes,
    fulfilledBy: order.fulfilledBy,
    fulfilledAt: order.fulfilledAt?.toISOString() ?? null,
    items: order.items.map(toAdminOrderItemDto),
  };
}
