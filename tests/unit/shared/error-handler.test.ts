import type { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { errorHandler } from '../../../src/shared/errors/error-handler';
import { AppError } from '../../../src/shared/errors/app.error';

// Silence the logger during error-handler tests
jest.mock('../../../src/shared/utils/logger', () => ({
  logger: { error: jest.fn() },
}));

const makeRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
};

const makeReqNext = () => ({
  req: {} as Request,
  next: jest.fn() as NextFunction,
});

describe('errorHandler', () => {
  describe('ZodError', () => {
    it('should return 400 with a "Validation failed" message and errors array', () => {
      const schema = z.object({ name: z.string() });
      const zodErr = schema.safeParse({ name: 123 });
      const err = (zodErr as { error: ZodError }).error;
      const res = makeRes();
      const { req, next } = makeReqNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          statusCode: 400,
          message: 'Validation failed',
          errors: expect.arrayContaining([
            expect.objectContaining({ field: 'name' }),
          ]),
        }),
      );
    });

    it('should map each zod issue to { field, message }', () => {
      const schema = z.object({ age: z.number(), name: z.string() });
      const zodErr = schema.safeParse({ age: 'bad', name: 123 });
      const err = (zodErr as { error: ZodError }).error;
      const res = makeRes();
      const { req, next } = makeReqNext();

      errorHandler(err, req, res, next);

      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.errors).toHaveLength(2);
      expect(body.errors.every((e: { field: string; message: string }) =>
        typeof e.field === 'string' && typeof e.message === 'string',
      )).toBe(true);
    });
  });

  describe('AppError (operational)', () => {
    it('should return the AppError statusCode and message', () => {
      const err = new AppError('Not found', 404);
      const res = makeRes();
      const { req, next } = makeReqNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          statusCode: 404,
          message: 'Not found',
        }),
      );
    });

    it('should handle any operational statusCode correctly', () => {
      const err = new AppError('Conflict', 409);
      const res = makeRes();
      const { req, next } = makeReqNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('AppError (non-operational)', () => {
    it('should return 500 for a non-operational AppError', () => {
      const err = new AppError('Internal bug', 500, false);
      const res = makeRes();
      const { req, next } = makeReqNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Unknown errors', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should return 500 with the real message in development', () => {
      process.env.NODE_ENV = 'development';
      const err = new Error('Internal crash');
      const res = makeRes();
      const { req, next } = makeReqNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.message).toBe('Internal crash');
    });

    it('should return 500 with a generic message in production', () => {
      process.env.NODE_ENV = 'production';
      const err = new Error('Internal crash');
      const res = makeRes();
      const { req, next } = makeReqNext();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.message).toContain('unexpected error');
    });

    it('should handle a non-Error thrown value in development', () => {
      process.env.NODE_ENV = 'development';
      const res = makeRes();
      const { req, next } = makeReqNext();

      errorHandler('something went wrong', req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      const body = (res.json as jest.Mock).mock.calls[0][0];
      expect(body.message).toBe('something went wrong');
    });
  });
});
