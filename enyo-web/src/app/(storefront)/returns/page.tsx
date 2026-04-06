'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { ReturnSummary } from '@/lib/types/return';
import type { PaginatedResponse } from '@/lib/types/api';
import type { ReturnStatus } from '@/lib/types/return';
import { ChevronRight } from 'lucide-react';

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<PaginatedResponse<ReturnSummary>>('/api/returns')
      .then((res) => setReturns(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold mb-6">My Returns</h1>
      {returns.length === 0 ? (
        <EmptyState title="No returns" description="You haven't requested any returns yet." />
      ) : (
        <div className="space-y-3">
          {returns.map((r) => (
            <Link
              key={r.id}
              href={`/returns/${r.id}`}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-surface/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{r.returnNumber}</span>
                  <StatusBadge status={r.status as ReturnStatus} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Order: {r.orderNumber} &middot; {r.itemCount} item{r.itemCount !== 1 ? 's' : ''} &middot; {format(new Date(r.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
