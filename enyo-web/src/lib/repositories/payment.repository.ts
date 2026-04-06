import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/** Find a payment by ID with associated order. */
export async function findPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: { order: { include: { user: true } } },
  });
}

/** Find a payment by its parent order ID. */
export async function findPaymentByOrderId(orderId: string) {
  return prisma.payment.findUnique({
    where: { orderId },
    include: { order: true },
  });
}

/** Find a payment by Bankful transaction ID. */
export async function findPaymentByBankfulTxId(txId: string) {
  return prisma.payment.findUnique({
    where: { bankfulTxId: txId },
    include: { order: { include: { user: true, items: true } } },
  });
}

interface FindAllPaymentsParams {
  page: number;
  pageSize: number;
  status?: string;
  method?: string;
  search?: string;
}

/** Admin: paginated list of all payments with filters. */
export async function findAllPayments(params: FindAllPaymentsParams) {
  const { page, pageSize, status, method, search } = params;
  const where: Prisma.PaymentWhereInput = {};

  if (status) where.status = status as never;
  if (method) where.method = method as never;
  if (search) {
    where.OR = [
      { bankfulTxId: { contains: search, mode: 'insensitive' } },
      { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        order: {
          select: { orderNumber: true, user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where }),
  ]);
  return { data, total };
}

/** Create a new payment record. */
export async function createPayment(data: Prisma.PaymentCreateInput) {
  return prisma.payment.create({ data });
}

/** Update payment status and related fields. */
export async function updatePaymentStatus(
  id: string,
  data: Prisma.PaymentUpdateInput,
) {
  return prisma.payment.update({ where: { id }, data });
}

/** Aggregate payment stats for the admin dashboard. */
export async function getPaymentStats() {
  const [totalProcessed, feesCollected, pendingAmount] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { processingFee: true },
    }),
    prisma.payment.aggregate({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalProcessed: totalProcessed._sum.amount ? Number(totalProcessed._sum.amount) : 0,
    feesCollected: feesCollected._sum.processingFee
      ? Number(feesCollected._sum.processingFee)
      : 0,
    pendingAmount: pendingAmount._sum.amount ? Number(pendingAmount._sum.amount) : 0,
  };
}
