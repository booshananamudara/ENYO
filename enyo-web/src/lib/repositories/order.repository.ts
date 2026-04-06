import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/** Find a single order by ID with all relations. */
export async function findOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payment: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
      address: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
}

/** Find a single order by its human-readable order number. */
export async function findOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payment: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
      address: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
}

/** Paginated list of orders for a specific user. */
export async function findOrdersByUserId(userId: string, page: number, pageSize: number) {
  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where: { userId } }),
  ]);
  return { data, total };
}

interface FindAllOrdersParams {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: string;
}

/** Admin: paginated list of all orders with filters. */
export async function findAllOrders(params: FindAllOrdersParams) {
  const { page, pageSize, status, search, dateFrom, dateTo } = params;
  const where: Prisma.OrderWhereInput = {};

  if (status) where.status = status as Prisma.EnumOrderStatusFilter;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        payment: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);
  return { data, total };
}

/** Create a new order with nested items and payment in a transaction. */
export async function createOrder(data: {
  orderNumber: string;
  userId: string;
  addressId: string;
  subtotal: number;
  serviceFee: number;
  fxSurcharge: number;
  shippingFee: number;
  total: number;
  currency: string;
  customerNotes?: string;
  items: Prisma.OrderItemCreateWithoutOrderInput[];
  payment: {
    method: string;
    amount: number;
    currency: string;
  };
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        addressId: data.addressId,
        subtotal: data.subtotal,
        serviceFee: data.serviceFee,
        fxSurcharge: data.fxSurcharge,
        shippingFee: data.shippingFee,
        total: data.total,
        currency: data.currency as never,
        customerNotes: data.customerNotes,
        items: { create: data.items },
        payment: {
          create: {
            method: data.payment.method as never,
            amount: data.payment.amount,
            currency: data.payment.currency as never,
            status: 'PENDING',
          },
        },
        statusHistory: {
          create: { status: 'PENDING_PAYMENT', note: 'Order created' },
        },
      },
      include: {
        items: true,
        payment: true,
        statusHistory: true,
        address: true,
      },
    });
    return order;
  });
}

/** Update order status and record history in a transaction. */
export async function updateOrderStatus(
  id: string,
  status: string,
  note?: string,
  changedBy?: string,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id },
      data: { status: status as never },
      include: { items: true, payment: true, user: true },
    });
    await tx.orderStatusHistory.create({
      data: { orderId: id, status: status as never, note, changedBy },
    });
    return order;
  });
}

/** Group orders by status for dashboard stats. */
export async function countOrdersByStatus() {
  return prisma.order.groupBy({
    by: ['status'],
    _count: { id: true },
  });
}

/** Aggregate revenue within a date range. */
export async function getRevenueByDateRange(from: Date, to: Date) {
  const result = await prisma.order.aggregate({
    where: {
      createdAt: { gte: from, lte: to },
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
    _sum: { total: true },
    _count: { id: true },
  });
  return {
    totalRevenue: result._sum.total ? Number(result._sum.total) : 0,
    orderCount: result._count.id,
  };
}

/** Get daily revenue for chart data within a date range. */
export async function getDailyRevenue(from: Date, to: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: 'asc' },
  });
  return orders.map((o) => ({
    date: o.createdAt.toISOString().slice(0, 10),
    revenue: Number(o.total),
  }));
}
