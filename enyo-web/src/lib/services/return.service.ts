import * as returnRepo from '@/lib/repositories/return.repository';
import * as orderRepo from '@/lib/repositories/order.repository';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { RETURN_WINDOW_DAYS, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { generateReturnNumber } from '@/lib/utils';
import type { CreateReturnInput, ReturnSummary, ReturnDetail } from '@/lib/types/return';
import type { PaginatedResponse } from '@/lib/types/api';

/** Map a Prisma return to a summary DTO. */
function toReturnSummaryDto(r: {
  id: string;
  returnNumber: string;
  orderId: string;
  status: string;
  reason: string;
  refundAmount: unknown;
  enyoCreditAmount: unknown;
  createdAt: Date;
  items: unknown[];
  order: { orderNumber: string };
}): ReturnSummary {
  return {
    id: r.id,
    returnNumber: r.returnNumber,
    orderId: r.orderId,
    orderNumber: r.order.orderNumber,
    status: r.status as ReturnSummary['status'],
    reason: r.reason,
    refundAmount: r.refundAmount ? Number(r.refundAmount) : null,
    enyoCreditAmount: r.enyoCreditAmount ? Number(r.enyoCreditAmount) : null,
    itemCount: r.items.length,
    createdAt: r.createdAt.toISOString(),
  };
}

/** Map a Prisma return to a full detail DTO. */
function toReturnDetailDto(r: {
  id: string;
  returnNumber: string;
  orderId: string;
  userId: string;
  status: string;
  reason: string;
  resolution: string | null;
  refundAmount: unknown;
  enyoCreditAmount: unknown;
  shippingLabelUrl: string | null;
  trackingNumber: string | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: { id: string; returnId: string; orderItemId: string; quantity: number; reason: string | null }[];
  order: { orderNumber: string; items?: { id: string; productTitle: string; productImage: string | null; vendorName: string }[] };
}): ReturnDetail {
  return {
    id: r.id,
    returnNumber: r.returnNumber,
    orderId: r.orderId,
    orderNumber: r.order.orderNumber,
    userId: r.userId,
    status: r.status as ReturnDetail['status'],
    reason: r.reason,
    resolution: r.resolution,
    refundAmount: r.refundAmount ? Number(r.refundAmount) : null,
    enyoCreditAmount: r.enyoCreditAmount ? Number(r.enyoCreditAmount) : null,
    shippingLabelUrl: r.shippingLabelUrl,
    trackingNumber: r.trackingNumber,
    adminNotes: r.adminNotes,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    items: r.items.map((item) => {
      const orderItem = r.order.items?.find((oi) => oi.id === item.orderItemId);
      return {
        id: item.id,
        returnId: item.returnId,
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        reason: item.reason,
        productTitle: orderItem?.productTitle ?? 'Unknown Product',
        productImage: orderItem?.productImage ?? null,
        vendorName: orderItem?.vendorName ?? 'Unknown Vendor',
      };
    }),
  };
}

/** Create a new return request. */
export async function createReturn(
  input: CreateReturnInput,
  userId: string,
): Promise<ReturnDetail> {
  const order = await orderRepo.findOrderById(input.orderId);
  if (!order) throw new NotFoundError('Order not found');
  if (order.userId !== userId) throw new NotFoundError('Order not found');
  if (order.status !== 'DELIVERED') {
    throw new ConflictError('Can only return delivered orders');
  }

  const daysSinceDelivery = Math.floor(
    (Date.now() - order.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
    throw new ConflictError(`Return window of ${RETURN_WINDOW_DAYS} days has expired`);
  }

  const created = await returnRepo.createReturn({
    returnNumber: generateReturnNumber(),
    orderId: input.orderId,
    userId,
    reason: input.reason,
    items: input.items,
  });

  const full = await returnRepo.findReturnById(created.id);
  return toReturnDetailDto(full as never);
}

/** Get paginated returns for a customer. */
export async function getReturnsByUser(
  userId: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<ReturnSummary>> {
  const { data, total } = await returnRepo.findReturnsByUserId(userId, page, pageSize);
  return {
    data: data.map((r) => toReturnSummaryDto(r as never)),
    total,
    page,
    pageSize,
  };
}

/** Get a single return detail. */
export async function getReturnDetail(returnId: string, userId?: string): Promise<ReturnDetail> {
  const r = await returnRepo.findReturnById(returnId);
  if (!r) throw new NotFoundError('Return not found');
  if (userId && r.userId !== userId) throw new NotFoundError('Return not found');
  return toReturnDetailDto(r as never);
}

/** Admin: get all returns with filters. */
export async function getAllReturns(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}): Promise<PaginatedResponse<ReturnSummary>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const { data, total } = await returnRepo.findAllReturns({ ...params, page, pageSize });
  return {
    data: data.map((r) => toReturnSummaryDto(r as never)),
    total,
    page,
    pageSize,
  };
}

/** Admin: update return status and fields. */
export async function updateReturn(
  returnId: string,
  data: { status?: string; adminNotes?: string; refundAmount?: number; enyoCreditAmount?: number; shippingLabelUrl?: string; trackingNumber?: string },
): Promise<ReturnDetail> {
  const updated = await returnRepo.updateReturn(returnId, data as never);
  const full = await returnRepo.findReturnById(updated.id);
  return toReturnDetailDto(full as never);
}
