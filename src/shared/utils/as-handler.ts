import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const asHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (req: Request<any, any, any, any>, res: Response, next?: NextFunction) => unknown,
): RequestHandler => fn as RequestHandler;
