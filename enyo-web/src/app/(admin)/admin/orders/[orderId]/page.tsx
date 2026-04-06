'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPatch } from '@/lib/api-client';
import { OrderFulfillmentPanel } from '@/components/admin/order-fulfillment-panel';
import { OrderTimeline } from '@/components/storefront/order-timeline';
import { StatusBadge } from '@/components/shared/status-badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import type { OrderDetail, OrderStatus } from '@/lib/types/order';
import type { PaymentStatus } from '@/lib/types/payment';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiGet<OrderDetail>(`/api/orders/${params.orderId}`)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [params.orderId]);

  async function handleStatusChange(newStatus: OrderStatus, note: string) {
    if (!order) return;
    try {
      const updated = await apiPatch<OrderDetail>(`/api/orders/${order.id}`, { status: newStatus, note });
      setOrder(updated);
    } catch { /* empty */ }
  }

  async function handleSaveNotes(notes: string) {
    if (!order) return;
    try {
      await apiPatch<OrderDetail>(`/api/orders/${order.id}`, { adminNotes: notes });
    } catch { /* empty */ }
  }

  if (isLoading || !order) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <StatusBadge status={order.status as OrderStatus} />
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
                    {item.vendorOrderId && <p className="text-xs text-muted-foreground">Vendor Order: {item.vendorOrderId}</p>}
                    {item.actualCostPaid !== null && (
                      <p className="text-xs text-muted-foreground">Actual Cost: <CurrencyDisplay amount={item.actualCostPaid} /></p>
                    )}
                  </div>
                  <CurrencyDisplay amount={item.totalPrice} currency={order.currency} className="font-medium" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><CurrencyDisplay amount={order.subtotal} currency={order.currency} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Service Fee</span><CurrencyDisplay amount={order.serviceFee} currency={order.currency} /></div>
              <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><CurrencyDisplay amount={order.total} currency={order.currency} /></div>
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
          <OrderFulfillmentPanel
            orderId={order.id}
            currentStatus={order.status as OrderStatus}
            onStatusChange={handleStatusChange}
            onSaveNotes={handleSaveNotes}
            adminNotes={order.adminNotes}
          />

          {order.payment && (
            <Card>
              <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>Method: {order.payment.method}</p>
                <p>Status: <StatusBadge status={order.payment.status as PaymentStatus} size="sm" /></p>
                <p>Amount: <CurrencyDisplay amount={order.payment.amount} /></p>
              </CardContent>
            </Card>
          )}

          {order.address && (
            <Card>
              <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{order.address.fullName}</p>
                <p>{order.address.line1}</p>
                <p>{order.address.city}, {order.address.country} {order.address.postalCode}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
