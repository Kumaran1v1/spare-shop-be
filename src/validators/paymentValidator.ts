import { z } from 'zod';

export const recordPaymentSchema = z.object({
  amount: z.number().gt(0, 'Payment amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
  referenceNumber: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
