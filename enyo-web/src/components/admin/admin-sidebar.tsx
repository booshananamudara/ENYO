'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Users, Package, CreditCard, RotateCcw, Settings, BarChart3, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/returns', label: 'Returns', icon: RotateCcw },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

/** Admin sidebar navigation. */
export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-admin-sidebar text-white transition-all duration-200 flex flex-col',
        isCollapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        {!isCollapsed && <Logo className="text-white" />}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white/60 hover:text-white p-1"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white',
                isCollapsed && 'justify-center px-2',
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
