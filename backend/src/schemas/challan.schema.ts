import { z } from 'zod';

export const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
  })).min(1, 'At least one item is required'),
});

export const updateChallanSchema = createChallanSchema;

export type CreateChallanInput = z.infer<typeof createChallanSchema>;
export type UpdateChallanInput = z.infer<typeof updateChallanSchema>;
