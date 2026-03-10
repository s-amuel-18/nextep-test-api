import { z } from 'zod';

export const GetAllBooksQueryDto = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const IdParamDto = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

export const SearchBookQueryDto = z.object({
  category: z
    .string()
    .min(1, 'Query param "category" is required')
    .transform((val) => val.trim()),
});

export const LowStockQueryDto = z.object({
  threshold: z.coerce
    .number()
    .int()
    .min(0, 'Query param "threshold" must be a non-negative number')
    .optional()
    .default(10),
});

export type GetAllBooksQueryDtoType = z.infer<typeof GetAllBooksQueryDto>;
export type IdParamDtoType = z.infer<typeof IdParamDto>;
export type SearchBookQueryDtoType = z.infer<typeof SearchBookQueryDto>;
export type LowStockQueryDtoType = z.infer<typeof LowStockQueryDto>;
