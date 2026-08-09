import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currentStock: z.number().int().min(0).optional().default(0),
  minStockAlert: z.number().int().min(0).optional().default(0),
  location: z.string().min(1, 'Location is required'),
});

export const updateProductSchema = createProductSchema.partial();

export const stockMovementSchema = z.object({
  quantityChanged: z.number().int().positive('Quantity must be positive'),
  movementType: z.enum(['IN', 'OUT']),
  reason: z.string().min(1, 'Reason is required'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type StockMovementInput = z.infer<typeof stockMovementSchema>;
