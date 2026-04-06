import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/** Find a return by ID with all relations. */
export async function findReturnById(id: string) {
  return prisma.return.findUnique({
    where: { id },
    include: {
      items: true,
      order: { include: { items: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

/** Paginated returns for a specific user. */
export async function findReturnsByUserId(userId: string, page: number, pageSize: number) {
  const [data, total] = await Promise.all([
    prisma.return.findMany({
      where: { userId },
      include: { items: true, order: { select: { orderNumber: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.return.count({ where: { userId } }),
  ]);
  return { data, total };
}

/** Find all returns for a given order. */
export async function findReturnsByOrderId(orderId: string) {
  return prisma.return.findMany({
    where: { orderId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}

interface FindAllReturnsParams {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
}

/** Admin: paginated list of all returns with filters. */
export async function findAllReturns(params: FindAllReturnsParams) {
  const { page, pageSize, status, search } = params;
  const where: Prisma.ReturnWhereInput = {};

  if (status) where.status = status as never;
  if (search) {
    where.OR = [
      { returnNumber: { contains: search, mode: 'insensitive' } },
      { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.return.findMany({
      where,
      include: {
        items: true,
        order: { select: { orderNumber: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.return.count({ where }),
  ]);
  return { data, total };
}

/** Create a new return with nested items. */
export async function createReturn(data: {
  returnNumber: string;
  orderId: string;
  userId: string;
  reason: string;
  items: { orderItemId: string; quantity: number; reason?: string }[];
}) {
  return prisma.return.create({
    data: {
      returnNumber: data.returnNumber,
      orderId: data.orderId,
      userId: data.userId,
      reason: data.reason,
      items: { create: data.items },
    },
    include: { items: true, order: { select: { orderNumber: true } } },
  });
}

/** Update return status and admin fields. */
export async function updateReturn(id: string, data: Prisma.ReturnUpdateInput) {
  return prisma.return.update({
    where: { id },
    data,
    include: { items: true, order: { select: { orderNumber: true } }, user: true },
  });
}
