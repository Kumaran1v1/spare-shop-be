import { z } from 'zod';

export const createSparePartSchema = z.object({
  partNumber: z.string().min(1, 'Part number is required').trim(),
  name: z.string().min(1, 'Spare part name is required').trim(),
  image: z.string().optional().default(''),
  category: z.string().min(1, 'Category is required').trim(),
  brand: z.string().optional().default(''),
  machineType: z.string().optional().default(''),
  unit: z.string().min(1, 'Unit is required').trim().default('Nos'),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling price cannot be negative'),
  minimumStock: z.number().min(0, 'Minimum stock cannot be negative').default(0),
});

export const updateSparePartSchema = createSparePartSchema.partial();

export type CreateSparePartInput = z.infer<typeof createSparePartSchema>;
export type UpdateSparePartInput = z.infer<typeof updateSparePartSchema>;
