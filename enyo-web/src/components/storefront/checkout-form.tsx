'use client';

import { useState } from 'react';
import { AddressForm } from '@/components/storefront/shipping-address-form';
import { PaymentMethodSelector } from '@/components/storefront/payment-method-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface CheckoutFormProps {
  savedAddresses: SavedAddress[];
  onSubmit: (data: { addressId: string; paymentMethod: PaymentMethod; customerNotes?: string }) => void;
  isLoading?: boolean;
}

/** Multi-step checkout form with address selection and payment method. */
export function CheckoutForm({ savedAddresses, onSubmit, isLoading }: CheckoutFormProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    savedAddresses.find((a) => a.isDefault)?.id ?? savedAddresses[0]?.id ?? '',
  );
  const [isAddingNew, setIsAddingNew] = useState(savedAddresses.length === 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAddressId || !paymentMethod) return;
    onSubmit({
      addressId: selectedAddressId,
      paymentMethod,
      customerNotes: notes || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          {!isAddingNew && savedAddresses.length > 0 ? (
            <div className="space-y-3">
              <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                {savedAddresses.map((addr) => (
                  <div key={addr.id} className="flex items-center space-x-3 rounded border p-3">
                    <RadioGroupItem value={addr.id} id={addr.id} />
                    <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                      <span className="font-medium">{addr.fullName}</span>
                      {addr.label && <span className="text-xs text-muted-foreground ml-2">({addr.label})</span>}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {addr.line1}, {addr.city}, {addr.country}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingNew(true)}>
                Add New Address
              </Button>
            </div>
          ) : (
            <AddressForm
              onSubmit={() => setIsAddingNew(false)}
              submitLabel="Save Address"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">2. Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3. Order Notes (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any special instructions for your order..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading || !selectedAddressId || !paymentMethod}
      >
        {isLoading ? 'Placing Order...' : 'Place Order'}
      </Button>
    </form>
  );
}
