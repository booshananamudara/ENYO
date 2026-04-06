import { z } from 'zod';
import { ORDER_STATUSES } from '@/lib/types/order';
import { PAYMENT_METHODS } from '@/lib/types/payment';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';

/** Schema for validating a single cart item. */
export const cartItemSchema = z.object({
  productTitle: z
    .string()
    .min(1, 'Product title is required')
    .max(500, 'Product title is too long'),
  productUrl: z
    .string()
    .min(1, 'Product URL is required')
    .url('Product URL must be a valid URL'),
  productImage: z
    .string()
    .url('Product image must be a valid URL')
    .optional(),
  vendorName: z
    .string()
    .min(1, 'Vendor name is required')
    .max(200, 'Vendor name is too long'),
  vendorUrl: z
    .string()
    .url('Vendor URL must be a valid URL')
    .optional(),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
  unitPrice: z
    .number()
    .positive('Unit price must be positive'),
  originalCurrency: z
    .string()
    .max(10)
    .optional(),
  originalPrice: z
    .number()
    .positive('Original price must be positive')
    .optional(),
});

/** Inferred type for a validated cart item. */
export type CartItemInput = z.infer<typeof cartItemSchema>;

/** Schema for creating a new order. */
export const createOrderSchema = z.object({
  items: z
    .array(cartItemSchema)
    .min(1, 'At least one item is required')
    .max(50, 'Cannot exceed 50 items per order'),
  addressId: z
    .string()
    .uuid('Invalid address ID'),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  customerNotes: z
    .string()
    .max(2000, 'Notes must be at most 2000 characters')
    .optional(),
  currency: z.enum(SUPPORTED_CURRENCIES, {
    errorMap: () => ({ message: 'Unsupported currency' }),
  }),
});

/** Inferred type for create order input. */
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/** Schema for updating an order's status (admin action). */
export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
  note: z
    .string()
    .max(1000, 'Note must be at most 1000 characters')
    .optional(),
});

/** Inferred type for update order status input. */
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
