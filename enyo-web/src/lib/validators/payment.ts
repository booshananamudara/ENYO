import { z } from 'zod';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/lib/types/payment';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';

/** Schema for initiating a payment on an order. */
export const initiatePaymentSchema = z.object({
  orderId: z
    .string()
    .uuid('Invalid order ID'),
  method: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: 'Unsupported currency' }),
  }),
});

/** Inferred type for initiate payment input. */
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

/** Schema for validating payment webhook payloads from payment gateways. */
export const paymentWebhookSchema = z.object({
  transactionId: z
    .string()
    .min(1, 'Transaction ID is required'),
  status: z.enum(['pending', 'processing', 'completed', 'failed'], {
    errorMap: () => ({ message: 'Invalid payment status' }),
  }),
  amount: z
    .number()
    .positive('Amount must be positive'),
  metadata: z
    .record(z.unknown())
    .optional(),
});

/** Inferred type for payment webhook input. */
export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
