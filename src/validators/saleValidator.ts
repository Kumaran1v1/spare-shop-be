import { z } from 'zod';

const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
});

export const createSaleSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').trim(),
  customerMobile: z.string().optional().default(''),
  saleDate: z.string().or(z.date()).optional(),
  items: z.array(saleItemSchema).min(1, 'At least one spare part item is required'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
  paidAmount: z.number().min(0, 'Paid amount cannot be negative').default(0),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
  referenceNumber: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
