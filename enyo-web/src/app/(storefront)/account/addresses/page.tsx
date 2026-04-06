'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddressForm } from '@/components/storefront/shipping-address-form';
import { EmptyState } from '@/components/shared/empty-state';
import { Plus, Trash2 } from 'lucide-react';

interface Address {
  id: string;
  label: string | null;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses] = useState<Address[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shipping Addresses</h1>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Address
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader><CardTitle>New Address</CardTitle></CardHeader>
          <CardContent>
            <AddressForm onSubmit={() => setIsAdding(false)} submitLabel="Save Address" />
          </CardContent>
        </Card>
      )}

      {addresses.length === 0 && !isAdding ? (
        <EmptyState
          title="No saved addresses"
          description="Add a shipping address to speed up your checkout."
          action={<Button onClick={() => setIsAdding(true)}>Add Address</Button>}
        />
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="p-4 flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {addr.fullName}
                    {addr.label && <span className="text-xs text-muted-foreground ml-2">({addr.label})</span>}
                    {addr.isDefault && <span className="text-xs text-accent ml-2">Default</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{addr.line1}</p>
                  {addr.line2 && <p className="text-sm text-muted-foreground">{addr.line2}</p>}
                  <p className="text-sm text-muted-foreground">
                    {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}, {addr.country}
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
