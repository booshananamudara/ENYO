import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';
import { PAYMENT_METHODS } from '@/lib/types/payment';

/** Schema for creating or updating an exchange rate setting. */
export const exchangeRateSchema = z.object({
  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: 'Unsupported currency' }),
  }),
  baseRate: z
    .number()
    .positive('Base rate must be positive'),
  surchargePercent: z
    .number()
    .min(0, 'Surcharge cannot be negative')
    .max(100, 'Surcharge cannot exceed 100%'),
  isActive: z
    .boolean()
    .default(true),
});

/** Inferred type for exchange rate input. */
export type ExchangeRateInput = z.infer<typeof exchangeRateSchema>;

/** Schema for creating or updating a generic app setting. */
export const appSettingSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(100, 'Key is too long')
    .regex(/^[a-z][a-z0-9_.]*$/, 'Key must be lowercase alphanumeric with dots or underscores'),
  value: z
    .unknown()
    .refine((v) => v !== undefined, 'Value is required'),
});

/** Inferred type for app setting input. */
export type AppSettingInput = z.infer<typeof appSettingSchema>;

/** Schema for enabling/disabling and configuring a payment method. */
export const paymentMethodSettingSchema = z.object({
  method: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  isEnabled: z
    .boolean(),
  displayOrder: z
    .number()
    .int('Display order must be a whole number')
    .min(0, 'Display order must be non-negative')
    .optional(),
  config: z
    .record(z.unknown())
    .optional(),
});

/** Inferred type for payment method setting input. */
export type PaymentMethodSettingInput = z.infer<typeof paymentMethodSettingSchema>;
