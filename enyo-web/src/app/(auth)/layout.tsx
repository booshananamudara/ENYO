import { Logo } from '@/components/shared/logo';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>
        <div className="rounded-xl border bg-white p-8 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
