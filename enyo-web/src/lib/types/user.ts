/**
 * User-related types for use in components and services.
 * Values mirror the Prisma schema but are expressed as plain interfaces.
 */

/** All possible user roles (mirrors Prisma UserRole enum). */
export const USER_ROLES = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'] as const;

/** User role union type. */
export type UserRole = (typeof USER_ROLES)[number];

/** Full user profile returned to the authenticated user. */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  image: string | null;
  enyoCredit: number;
  createdAt: string;
}

/** Lightweight user representation for admin list views. */
export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  totalOrders: number;
  lifetimeSpend: number;
  lastOrderDate: string | null;
  createdAt: string;
}

/** Input for creating a new user account. */
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

/** Input for updating an existing user profile. */
export interface UpdateUserInput {
  name?: string;
  phone?: string | null;
  image?: string | null;
}
