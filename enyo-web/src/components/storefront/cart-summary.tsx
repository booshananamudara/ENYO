'use client';

import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import type { CartItem } from '@/lib/types/cart';
import { SERVICE_FEE_PERCENT } from '@/lib/constants';

interface CartSummaryProps {
  items: CartItem[];
  currency?: string;
}

/** Order summary sidebar showing cart items grouped by vendor. */
export function CartSummary({ items, currency = 'USD' }: CartSummaryProps) {
  const grouped = items.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.vendorName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const serviceFee = Math.round(subtotal * (SERVICE_FEE_PERCENT / 100) * 100) / 100;
  const total = subtotal + serviceFee;

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

      {Object.entries(grouped).map(([vendor, vendorItems]) => (
        <div key={vendor} className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">{vendor}</h3>
          {vendorItems.map((item, idx) => (
            <div key={idx} className="flex gap-3 mb-3">
              {item.productImage && (
                <div className="relative h-12 w-12 rounded border overflow-hidden shrink-0">
                  <Image src={item.productImage} alt={item.productTitle} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productTitle}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <CurrencyDisplay amount={item.unitPrice * item.quantity} currency={currency} className="text-sm font-medium" />
            </div>
          ))}
        </div>
      ))}

      <Separator className="my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <CurrencyDisplay amount={subtotal} currency={currency} />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service Fee ({SERVICE_FEE_PERCENT}%)</span>
          <CurrencyDisplay amount={serviceFee} currency={currency} />
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-base">
          <span>Total</span>
          <CurrencyDisplay amount={total} currency={currency} />
        </div>
      </div>
    </div>
  );
}
