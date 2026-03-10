import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './app.error';
import { logger } from '../utils/logger';

interface ErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  errors?: { field: string; message: string }[];
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors,
    } satisfies ErrorResponse);
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
    } satisfies ErrorResponse);
    return;
  }

  logger.error({ err }, 'Unexpected error occurred');

  const isDev = process.env.NODE_ENV === 'development';

  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: isDev
      ? err instanceof Error
        ? err.message
        : String(err)
      : 'An unexpected error occurred. Please try again later.',
  } satisfies ErrorResponse);
};
