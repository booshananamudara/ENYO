import type { UserProfile, UserSummary } from '@/lib/types/user';
import type { User } from '@prisma/client';

/** Map a Prisma user to a profile DTO (strips passwordHash). */
export function toUserProfileDto(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    image: user.image,
    enyoCredit: Number(user.enyoCredit),
    createdAt: user.createdAt.toISOString(),
  };
}

/** Map a Prisma user + stats to an admin summary DTO. */
export function toUserSummaryDto(
  user: User & { _count?: { orders: number } },
  stats: { totalOrders: number; lifetimeSpend: number; lastOrderDate: string | null },
): UserSummary {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    totalOrders: stats.totalOrders,
    lifetimeSpend: stats.lifetimeSpend,
    lastOrderDate: stats.lastOrderDate,
    createdAt: user.createdAt.toISOString(),
  };
}

/** Minimal public user shape (for display only). */
export function toPublicUserDto(user: User) {
  return {
    id: user.id,
    name: user.name,
    image: user.image,
  };
}
