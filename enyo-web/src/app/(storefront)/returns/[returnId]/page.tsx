'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download } from 'lucide-react';
import type { ReturnDetail } from '@/lib/types/return';
import type { ReturnStatus } from '@/lib/types/return';

export default function ReturnDetailPage() {
  const params = useParams();
  const [ret, setRet] = useState<ReturnDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<ReturnDetail>(`/api/returns/${params.returnId}`)
      .then(setRet)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [params.returnId]);

  if (isLoading || !ret) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/returns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Returns
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{ret.returnNumber}</h1>
          <StatusBadge status={ret.status as ReturnStatus} />
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Return Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Order:</span> {ret.orderNumber}</p>
            <p><span className="text-muted-foreground">Reason:</span> {ret.reason}</p>
            {ret.resolution && <p><span className="text-muted-foreground">Resolution:</span> {ret.resolution}</p>}
            {ret.refundAmount && (
              <p><span className="text-muted-foreground">Refund Amount:</span> <CurrencyDisplay amount={ret.refundAmount} /></p>
            )}
            {ret.enyoCreditAmount && (
              <p><span className="text-muted-foreground">ENYO Credit:</span> <CurrencyDisplay amount={ret.enyoCreditAmount} /></p>
            )}
            {ret.trackingNumber && <p><span className="text-muted-foreground">Tracking:</span> {ret.trackingNumber}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent>
            {ret.items.map((item) => (
              <div key={item.id} className="flex justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{item.productTitle}</p>
                  <p className="text-sm text-muted-foreground">{item.vendorName} &middot; Qty: {item.quantity}</p>
                  {item.reason && <p className="text-sm text-muted-foreground">Reason: {item.reason}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {ret.shippingLabelUrl && (
          <a href={ret.shippingLabelUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Download Shipping Label
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
