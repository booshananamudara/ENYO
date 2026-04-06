'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

/** Hook for client-side auth state and actions. */
export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user
    ? {
        id: session.user.id ?? '',
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        image: session.user.image ?? null,
        role: (session.user as { role?: string }).role ?? 'CUSTOMER',
      }
    : null;

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
  };
}
