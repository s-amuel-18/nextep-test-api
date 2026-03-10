import { AppError } from '../../../src/shared/errors/app.error';
import {
  BookNotFoundError,
  DuplicateIsbnError,
  PriceCalculationError,
} from '../../../src/modules/books/domain/book.errors';

describe('AppError', () => {
  it('should set message, statusCode and isOperational', () => {
    const err = new AppError('Something went wrong', 422);

    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(422);
    expect(err.isOperational).toBe(true);
  });

  it('should allow setting isOperational to false', () => {
    const err = new AppError('Critical failure', 500, false);

    expect(err.isOperational).toBe(false);
  });

  it('should be an instance of Error', () => {
    const err = new AppError('test', 400);

    expect(err).toBeInstanceOf(Error);
  });

  it('should be an instance of AppError', () => {
    const err = new AppError('test', 400);

    expect(err).toBeInstanceOf(AppError);
  });

  it('should have a stack trace', () => {
    const err = new AppError('test', 400);

    expect(err.stack).toBeDefined();
  });
});

describe('BookNotFoundError', () => {
  it('should create a 404 error with the book id in the message', () => {
    const err = new BookNotFoundError(42);

    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('42');
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('DuplicateIsbnError', () => {
  it('should create a 409 error with the isbn in the message', () => {
    const err = new DuplicateIsbnError('9788437604947');

    expect(err.statusCode).toBe(409);
    expect(err.message).toContain('9788437604947');
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('PriceCalculationError', () => {
  it('should create a 422 error with the reason in the message', () => {
    const err = new PriceCalculationError('costUsd is zero');

    expect(err.statusCode).toBe(422);
    expect(err.message).toContain('costUsd is zero');
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(AppError);
  });
});
