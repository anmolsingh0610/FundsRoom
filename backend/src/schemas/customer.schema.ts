import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(1, 'Mobile is required'),
  email: z.string().email('Invalid email'),
  businessName: z.string().min(1, 'Business name is required'),
  gstNumber: z.string().optional().nullable(),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().min(1, 'Address is required'),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).optional().default('LEAD'),
  followUpDate: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const addFollowUpSchema = z.object({
  note: z.string().min(1, 'Note is required'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AddFollowUpInput = z.infer<typeof addFollowUpSchema>;
