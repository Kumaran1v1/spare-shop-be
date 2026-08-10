import { z } from 'zod';

const purchaseItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative'),
});

export const createPurchaseSchema = z.object({
  supplierName: z.string().min(1, 'Supplier name is required').trim(),
  supplierMobile: z.string().optional().default(''),
  supplierInvoiceNumber: z.string().optional().default(''),
  purchaseDate: z.string().or(z.date()).optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one spare part item is required'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
  paidAmount: z.number().min(0, 'Paid amount cannot be negative').default(0),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
  referenceNumber: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
