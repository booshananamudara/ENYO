'use client';

import { useOrders } from '@/hooks/use-orders';
import { OrderCard } from '@/components/storefront/order-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Pagination } from '@/components/shared/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { OrderStatus } from '@/lib/types/order';

export default function OrdersPage() {
  const { data, total, page, setPage, isLoading } = useOrders();
  const totalPages = Math.ceil(total / 10);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {data.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Start shopping with the EnyoCart extension and your orders will appear here."
          action={<Link href="/"><Button>Start Shopping</Button></Link>}
        />
      ) : (
        <>
          <div className="space-y-3">
            {data.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                orderNumber={order.orderNumber}
                status={order.status as OrderStatus}
                total={order.total}
                currency={order.currency}
                itemCount={order.itemCount}
                createdAt={order.createdAt}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
