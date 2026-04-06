import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/** Find a user by ID with addresses. */
export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { addresses: { orderBy: { isDefault: 'desc' } } },
  });
}

/** Find a user by email address. */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

interface FindAllUsersParams {
  page: number;
  pageSize: number;
  search?: string;
}

/** Admin: paginated list of all users with optional search. */
export async function findAllUsers(params: FindAllUsersParams) {
  const { page, pageSize, search } = params;
  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);
  return { data, total };
}

/** Create a new user account. */
export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
}) {
  return prisma.user.create({ data });
}

/** Update user profile fields. */
export async function updateUser(id: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({ where: { id }, data });
}

/** Delete a user and all associated data (cascade). */
export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

/** Get aggregate stats for a user (orders, spend, last order). */
export async function getUserStats(userId: string) {
  const [orderStats, lastOrder] = await Promise.all([
    prisma.order.aggregate({
      where: { userId, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.order.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
  ]);

  return {
    totalOrders: orderStats._count.id,
    lifetimeSpend: orderStats._sum.total ? Number(orderStats._sum.total) : 0,
    lastOrderDate: lastOrder?.createdAt.toISOString() ?? null,
  };
}

/** Find or create a user from an OAuth provider profile. */
export async function findOrCreateFromOAuth(profile: {
  email: string;
  name: string;
  image?: string;
}) {
  let user = await prisma.user.findUnique({ where: { email: profile.email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        image: profile.image,
        emailVerified: new Date(),
      },
    });
  }
  return user;
}
