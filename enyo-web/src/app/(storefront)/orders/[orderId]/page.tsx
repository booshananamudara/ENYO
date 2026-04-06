'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/lib/api-client';
import { OrderTimeline } from '@/components/storefront/order-timeline';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import type { OrderDetail } from '@/lib/types/order';
import type { PaymentStatus } from '@/lib/types/payment';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<OrderDetail>(`/api/orders/${params.orderId}`)
      .then(setOrder)
      .catch(() => router.push('/orders'))
      .finally(() => setIsLoading(false));
  }, [params.orderId, router]);

  if (isLoading || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const isDelivered = order.status === 'DELIVERED';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex gap-2">
          {isDelivered && (
            <Button variant="outline" onClick={() => router.push(`/returns?orderId=${order.id}`)}>
              <RotateCcw className="h-4 w-4 mr-2" /> Request Return
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Items</CardTitle></CardHeader>
            <CardContent>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.productTitle}</p>
                    <p className="text-sm text-muted-foreground">{item.vendorName} &middot; Qty: {item.quantity}</p>
                  </div>
                  <CurrencyDisplay amount={item.totalPrice} currency={order.currency} className="font-medium" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status Timeline</CardTitle></CardHeader>
            <CardContent>
              <OrderTimeline history={order.statusHistory} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><CurrencyDisplay amount={order.subtotal} currency={order.currency} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Service Fee</span><CurrencyDisplay amount={order.serviceFee} currency={order.currency} /></div>
              {order.fxSurcharge > 0 && <div className="flex justify-between"><span className="text-muted-foreground">FX Surcharge</span><CurrencyDisplay amount={order.fxSurcharge} currency={order.currency} /></div>}
              {order.shippingFee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><CurrencyDisplay amount={order.shippingFee} currency={order.currency} /></div>}
              <Separator />
              <div className="flex justify-between font-semibold"><span>Total</span><CurrencyDisplay amount={order.total} currency={order.currency} /></div>
            </CardContent>
          </Card>

          {order.address && (
            <Card>
              <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.address.fullName}</p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>{order.address.city}{order.address.state ? `, ${order.address.state}` : ''} {order.address.postalCode}</p>
                <p>{order.address.country}</p>
              </CardContent>
            </Card>
          )}

          {order.payment && (
            <Card>
              <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>Method: {order.payment.method}</p>
                <p>Status: <StatusBadge status={order.payment.status as PaymentStatus} size="sm" /></p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
