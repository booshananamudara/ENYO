import { z } from 'zod';

/** Schema for creating or updating a shipping address. */
export const addressSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(200, 'Full name is too long'),
  phone: z
    .string()
    .max(30, 'Phone number is too long')
    .optional()
    .nullable(),
  line1: z
    .string()
    .min(1, 'Address line 1 is required')
    .max(500, 'Address line 1 is too long'),
  line2: z
    .string()
    .max(500, 'Address line 2 is too long')
    .optional()
    .nullable(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(200, 'City name is too long'),
  state: z
    .string()
    .max(200, 'State name is too long')
    .optional()
    .nullable(),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .max(20, 'Postal code is too long'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country name is too long'),
  label: z
    .string()
    .max(50, 'Label is too long')
    .optional()
    .nullable(),
  isDefault: z
    .boolean()
    .default(false),
});

/** Inferred type for address input. */
export type AddressInput = z.infer<typeof addressSchema>;
