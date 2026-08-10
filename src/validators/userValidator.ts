import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'SHOP_OWNER', 'USER']).default('USER'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').trim().optional(),
  email: z.string().email('Invalid email address').toLowerCase().trim().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['ADMIN', 'SHOP_OWNER', 'USER']).optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
