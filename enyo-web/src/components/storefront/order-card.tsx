import Link from 'next/link';
import { format } from 'date-fns';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { ChevronRight } from 'lucide-react';
import type { OrderStatus } from '@/lib/types/order';

interface OrderCardProps {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
}

/** Order card for the orders list page. */
export function OrderCard({ id, orderNumber, status, total, currency, itemCount, createdAt }: OrderCardProps) {
  return (
    <Link
      href={`/orders/${id}`}
      className="flex items-center justify-between rounded-lg border p-4 hover:bg-surface/50 transition-colors"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="font-semibold">{orderNumber}</span>
          <StatusBadge status={status} size="sm" />
        </div>
        <p className="text-sm text-muted-foreground">
          {itemCount} item{itemCount !== 1 ? 's' : ''} &middot; {format(new Date(createdAt), 'MMM d, yyyy')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <CurrencyDisplay amount={total} currency={currency} className="font-semibold" />
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
