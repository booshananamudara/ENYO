import * as orderRepo from '@/lib/repositories/order.repository';
import { toOrderSummaryDto, toOrderDetailDto, toAdminOrderDetailDto } from '@/lib/dto/order.dto';
import { transitionOrderStatus } from '@/lib/order-state-machine';
import { NotFoundError } from '@/lib/errors';
import { SERVICE_FEE_PERCENT, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { generateOrderNumber } from '@/lib/utils';
import type { CreateOrderInput, OrderSummary, OrderDetail } from '@/lib/types/order';
import type { PaginatedResponse } from '@/lib/types/api';

/** Calculate service fee from a subtotal. */
function calculateServiceFee(subtotal: number): number {
  return Math.round(subtotal * (SERVICE_FEE_PERCENT / 100) * 100) / 100;
}

/** Create a new order from checkout data. */
export async function createOrder(
  input: CreateOrderInput,
  userId: string,
): Promise<OrderDetail> {
  const subtotal = input.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const serviceFee = calculateServiceFee(subtotal);
  const fxSurcharge = 0;
  const shippingFee = 0;
  const total = subtotal + serviceFee + fxSurcharge + shippingFee;

  const items = input.items.map((item) => ({
    productTitle: item.productTitle,
    productUrl: item.productUrl,
    productImage: item.productImage ?? null,
    vendorName: item.vendorName,
    vendorUrl: item.vendorUrl ?? null,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.unitPrice * item.quantity,
  }));

  const order = await orderRepo.createOrder({
    orderNumber: generateOrderNumber(),
    userId,
    addressId: input.addressId,
    subtotal,
    serviceFee,
    fxSurcharge,
    shippingFee,
    total,
    currency: input.currency,
    customerNotes: input.customerNotes,
    items,
    payment: {
      method: input.paymentMethod,
      amount: total,
      currency: input.currency,
    },
  });

  return toOrderDetailDto(order);
}

/** Get paginated orders for a customer. */
export async function getOrdersByUser(
  userId: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResponse<OrderSummary>> {
  const { data, total } = await orderRepo.findOrdersByUserId(userId, page, pageSize);
  return {
    data: data.map(toOrderSummaryDto),
    total,
    page,
    pageSize,
  };
}

/** Get a single order detail for a customer (strips admin fields). */
export async function getOrderDetail(orderId: string, userId?: string): Promise<OrderDetail> {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw new NotFoundError('Order not found');
  if (userId && order.userId !== userId) throw new NotFoundError('Order not found');
  return toOrderDetailDto(order);
}

/** Get a single order detail for admin (includes all fields). */
export async function getAdminOrderDetail(orderId: string): Promise<OrderDetail> {
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw new NotFoundError('Order not found');
  return toAdminOrderDetailDto(order);
}

/** Admin: get paginated orders with filters. */
export async function getAllOrders(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: string;
}): Promise<PaginatedResponse<OrderSummary>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const { data, total } = await orderRepo.findAllOrders({ ...params, page, pageSize });
  return {
    data: data.map(toOrderSummaryDto),
    total,
    page,
    pageSize,
  };
}

/** Transition order status via the state machine. */
export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  changedBy?: string,
  note?: string,
): Promise<OrderDetail> {
  await transitionOrderStatus(orderId, newStatus as never, changedBy, note);
  const order = await orderRepo.findOrderById(orderId);
  if (!order) throw new NotFoundError('Order not found');
  return toAdminOrderDetailDto(order);
}

/** Dashboard: order counts by status. */
export async function getOrderCountsByStatus() {
  const groups = await orderRepo.countOrdersByStatus();
  return groups.map((g) => ({ status: g.status, count: g._count.id }));
}
