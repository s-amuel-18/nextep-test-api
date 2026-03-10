import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(result.error);
    }

    req[source] = result.data as (typeof req)[typeof source];
    next();
  };
};
