import { z } from 'zod';
import { validateIsbn } from '../../../../shared/utils/isbn.validator';

export const UpdateBookDto = z
  .object({
    title: z.string().min(1).max(500).optional(),
    author: z.string().min(1).max(500).optional(),
    isbn: z
      .string()
      .refine(validateIsbn, {
        message: 'Invalid ISBN format. Must be ISBN-10 or ISBN-13',
      })
      .optional(),
    cost_usd: z.number().positive('cost_usd must be greater than 0').optional(),
    stock_quantity: z.number().int().min(0, 'stock_quantity cannot be negative').optional(),
    category: z.string().min(1).max(255).optional(),
    supplier_country: z.string().length(2).toUpperCase().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateBookDtoType = z.infer<typeof UpdateBookDto>;
