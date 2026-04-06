import { auth } from '@/lib/auth';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';

/** Session user shape from NextAuth JWT. */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string | null;
}

/** Get the current server-side session. Throws if not authenticated. */
export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError('You must be logged in');
  }
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? '',
    role: (session.user as { role?: string }).role ?? 'CUSTOMER',
    image: session.user.image,
  };
}

/** Require the current user to be an admin. Throws if not. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new ForbiddenError('Admin access required');
  }
  return user;
}

/** Get the current session without throwing. Returns null if not authenticated. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? '',
    name: session.user.name ?? '',
    role: (session.user as { role?: string }).role ?? 'CUSTOMER',
    image: session.user.image,
  };
}
