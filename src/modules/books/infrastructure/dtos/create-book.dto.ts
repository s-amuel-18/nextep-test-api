import { z } from 'zod';
import { validateIsbn } from '../../../../shared/utils/isbn.validator';

export const CreateBookDto = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  author: z.string().min(1, 'Author is required').max(500),
  isbn: z.string().refine(validateIsbn, {
    message: 'Invalid ISBN format. Must be ISBN-10 or ISBN-13',
  }),
  cost_usd: z.number().positive('cost_usd must be greater than 0'),
  stock_quantity: z.number().int().min(0, 'stock_quantity cannot be negative'),
  category: z.string().min(1, 'Category is required').max(255),
  supplier_country: z
    .string()
    .length(2, 'supplier_country must be a 2-char ISO code')
    .toUpperCase(),
});

export type CreateBookDtoType = z.infer<typeof CreateBookDto>;
