import { z } from 'zod';

/** Schema for a single item in a return request. */
export const returnItemSchema = z.object({
  orderItemId: z
    .string()
    .uuid('Invalid order item ID'),
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1'),
  reason: z
    .string()
    .max(1000, 'Reason must be at most 1000 characters')
    .optional(),
});

/** Inferred type for a return item input. */
export type ReturnItemInput = z.infer<typeof returnItemSchema>;

/** Schema for creating a new return request. */
export const createReturnSchema = z.object({
  orderId: z
    .string()
    .uuid('Invalid order ID'),
  items: z
    .array(returnItemSchema)
    .min(1, 'At least one item is required for a return'),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(2000, 'Reason must be at most 2000 characters'),
});

/** Inferred type for create return input. */
export type CreateReturnInput = z.infer<typeof createReturnSchema>;
