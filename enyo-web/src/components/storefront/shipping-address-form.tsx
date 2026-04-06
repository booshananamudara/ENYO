'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { addressSchema } from '@/lib/validators/address';
import type { z } from 'zod';

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  defaultValues?: Partial<AddressFormData>;
  isLoading?: boolean;
  submitLabel?: string;
}

/** Reusable address form used in checkout and account settings. */
export function AddressForm({
  onSubmit,
  defaultValues,
  isLoading = false,
  submitLabel = 'Save Address',
}: AddressFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = {
      fullName: formData.get('fullName') as string,
      phone: (formData.get('phone') as string) || undefined,
      line1: formData.get('line1') as string,
      line2: (formData.get('line2') as string) || undefined,
      city: formData.get('city') as string,
      state: (formData.get('state') as string) || undefined,
      postalCode: formData.get('postalCode') as string,
      country: formData.get('country') as string,
      label: (formData.get('label') as string) || undefined,
      isDefault: formData.get('isDefault') === 'on',
    };

    const result = addressSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input id="fullName" name="fullName" defaultValue={defaultValues?.fullName} required />
          {errors.fullName && <p className="text-xs text-error mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ''} />
        </div>
      </div>
      <div>
        <Label htmlFor="line1">Address Line 1 *</Label>
        <Input id="line1" name="line1" defaultValue={defaultValues?.line1} required />
        {errors.line1 && <p className="text-xs text-error mt-1">{errors.line1}</p>}
      </div>
      <div>
        <Label htmlFor="line2">Address Line 2</Label>
        <Input id="line2" name="line2" defaultValue={defaultValues?.line2 ?? ''} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input id="city" name="city" defaultValue={defaultValues?.city} required />
          {errors.city && <p className="text-xs text-error mt-1">{errors.city}</p>}
        </div>
        <div>
          <Label htmlFor="state">State / Province</Label>
          <Input id="state" name="state" defaultValue={defaultValues?.state ?? ''} />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal Code *</Label>
          <Input id="postalCode" name="postalCode" defaultValue={defaultValues?.postalCode} required />
          {errors.postalCode && <p className="text-xs text-error mt-1">{errors.postalCode}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">Country *</Label>
          <Input id="country" name="country" defaultValue={defaultValues?.country} required />
          {errors.country && <p className="text-xs text-error mt-1">{errors.country}</p>}
        </div>
        <div>
          <Label htmlFor="label">Label (e.g., Home, Office)</Label>
          <Input id="label" name="label" defaultValue={defaultValues?.label ?? ''} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="isDefault" name="isDefault" defaultChecked={defaultValues?.isDefault} />
        <Label htmlFor="isDefault" className="text-sm font-normal">Set as default address</Label>
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
