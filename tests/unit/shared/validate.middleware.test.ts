import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { validate } from '../../../src/shared/middlewares/validate.middleware';

const makeReq = (overrides: Partial<Request> = {}): Request =>
  ({
    body: {},
    query: {},
    params: {},
    ...overrides,
  }) as unknown as Request;

const makeRes = () => ({} as Response);

describe('validate middleware', () => {
  const schema = z.object({ name: z.string().min(1) });

  describe('with a valid input', () => {
    it('should call next() without arguments', () => {
      const req = makeReq({ body: { name: 'El Quijote' } });
      const next = jest.fn() as NextFunction;

      validate(schema, 'body')(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should replace req[source] with the parsed/coerced value', () => {
      const req = makeReq({ body: { name: 'El Quijote' } });
      const next = jest.fn() as NextFunction;

      validate(schema, 'body')(req, makeRes(), next);

      expect(req.body).toEqual({ name: 'El Quijote' });
    });
  });

  describe('with an invalid input', () => {
    it('should call next() with the ZodError', () => {
      const req = makeReq({ body: { name: '' } });
      const next = jest.fn() as unknown as NextFunction;

      validate(schema, 'body')(req, makeRes(), next);

      expect(next).toHaveBeenCalledTimes(1);
      expect((next as jest.Mock).mock.calls[0][0]).toBeInstanceOf(ZodError);
    });

    it('should not modify req[source] on failure', () => {
      const original = { name: '' };
      const req = makeReq({ body: { ...original } });
      const next = jest.fn() as NextFunction;

      validate(schema, 'body')(req, makeRes(), next);

      expect(req.body).toEqual(original);
    });
  });

  describe('source selection', () => {
    it('should validate req.query when source is "query"', () => {
      const querySchema = z.object({ page: z.coerce.number().min(1) });
      const req = makeReq({ query: { page: '2' } as unknown as Request['query'] });
      const next = jest.fn() as NextFunction;

      validate(querySchema, 'query')(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith();
      expect((req.query as unknown as { page: number }).page).toBe(2);
    });

    it('should validate req.params when source is "params"', () => {
      const paramsSchema = z.object({ id: z.coerce.number().positive() });
      const req = makeReq({ params: { id: '42' } as unknown as Request['params'] });
      const next = jest.fn() as NextFunction;

      validate(paramsSchema, 'params')(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith();
      expect((req.params as unknown as { id: number }).id).toBe(42);
    });

    it('should default to "body" when source is omitted', () => {
      const req = makeReq({ body: { name: 'test' } });
      const next = jest.fn() as NextFunction;

      validate(schema)(req, makeRes(), next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('type coercion', () => {
    it('should coerce string numbers to numbers in query params', () => {
      const coerceSchema = z.object({ limit: z.coerce.number().int() });
      const req = makeReq({ query: { limit: '10' } as unknown as Request['query'] });
      const next = jest.fn() as NextFunction;

      validate(coerceSchema, 'query')(req, makeRes(), next);

      expect((req.query as unknown as { limit: number }).limit).toBe(10);
      expect(typeof (req.query as unknown as { limit: number }).limit).toBe('number');
    });

    it('should apply string transforms (e.g. trim)', () => {
      const trimSchema = z.object({ name: z.string().transform((v) => v.trim()) });
      const req = makeReq({ body: { name: '  hello  ' } });
      const next = jest.fn() as NextFunction;

      validate(trimSchema, 'body')(req, makeRes(), next);

      expect(req.body.name).toBe('hello');
    });
  });
});
