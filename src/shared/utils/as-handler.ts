import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Casts a typed Express handler to the generic RequestHandler type.
 *
 * Express's built-in constraints (ParamsDictionary, ParsedQs) only allow
 * string values for params and query, but our validate middleware coerces
 * fields to their Zod-inferred types (e.g. numbers). This helper centralises
 * the unavoidable type bridge so route files stay clean.
 *
 * @example
 *   router.get('/:id', validId, asHandler(booksController.getById));
 */
export const asHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (req: Request<any, any, any, any>, res: Response, next?: NextFunction) => unknown,
): RequestHandler => fn as RequestHandler;
