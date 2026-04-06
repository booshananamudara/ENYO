'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CartSummary } from '@/components/storefront/cart-summary';
import { CheckoutForm } from '@/components/storefront/checkout-form';
import { EmptyState } from '@/components/shared/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { apiPost, apiGet } from '@/lib/api-client';
import { safeJsonParse } from '@/lib/utils';
import type { CartItem } from '@/lib/types/cart';
import type { PaymentMethod } from '@/lib/types/payment';

interface SavedAddress {
  id: string;
  label: string | null;
  fullName: string;
  line1: string;
  city: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, setItems } = useCart();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const cartParam = searchParams.get('cart');
    if (cartParam && items.length === 0) {
      try {
        const decoded = atob(cartParam);
        const parsed = safeJsonParse<CartItem[]>(decoded);
        if (parsed && Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch {
        console.error('Failed to decode cart from URL');
      }
    }
  }, [searchParams, items.length, setItems]);

  useEffect(() => {
    apiGet<SavedAddress[]>('/api/customers/addresses').catch(() => []).then(setAddresses);
  }, []);

  async function handleSubmit(data: { addressId: string; paymentMethod: PaymentMethod; customerNotes?: string }) {
    setIsLoading(true);
    try {
      const result = await apiPost<{ id: string }>('/api/orders', {
        items: items.map((i) => ({
          productTitle: i.productTitle,
          productUrl: i.productUrl,
          productImage: i.productImage,
          vendorName: i.vendorName,
          vendorUrl: i.vendorUrl,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        addressId: data.addressId,
        paymentMethod: data.paymentMethod,
        customerNotes: data.customerNotes,
        currency: 'USD',
      });
      setCreatedOrderId(result.id);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          title="Your cart is empty"
          description="Add products using the EnyoCart Chrome extension, then come back to checkout."
          action={
            <div className="flex gap-3">
              <a
                href="https://chromewebstore.google.com/detail/lhoapedkalbdndadogkiiegndiknpnjg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>Get the Extension</Button>
              </a>
              <Button variant="outline" onClick={() => router.push('/')}>Back to Home</Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm savedAddresses={addresses} onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        <div>
          <CartSummary items={items} />
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Placed Successfully!</DialogTitle>
            <DialogDescription>
              Your order has been created. You will be redirected to Bankful.com to complete payment.
              This is a demo — in production, you would be redirected to the actual payment gateway.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push(`/orders/${createdOrderId}`)}>
              View Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
