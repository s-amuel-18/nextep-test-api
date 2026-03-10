const mockDb = {
  book: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
  $connect: jest.fn(),
  $on: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockDb),
}));

jest.mock('axios');

jest.mock('../../../src/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 3000,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    DEFAULT_EXCHANGE_RATE: 1.0,
    DEFAULT_CURRENCY: 'USD',
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX: 1000,
  },
}));

import request from 'supertest';
import axios from 'axios';
import 'express-async-errors';
import app from '../../../src/app';
import { mockPrismaBook } from '../helpers/prisma-book.fixture';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Books Calculate Price E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.$transaction.mockImplementation((queries: Promise<unknown>[]) => Promise.all(queries));
  });

  describe('POST /books/:id/calculate-price', () => {
    it('should calculate price using real exchange rate and return 200', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockPrismaBook);
      mockedAxios.get.mockResolvedValue({ data: { rates: { EUR: 0.85 } } });
      mockDb.book.update.mockResolvedValue({
        ...mockPrismaBook,
        costUsd: 15.99,
        sellingPriceLocal: 19.03,
      });

      const res = await request(app).post('/books/1/calculate-price');

      expect(res.status).toBe(200);
      expect(res.body.book_id).toBe(1);
      expect(res.body.cost_usd).toBe(15.99);
      expect(res.body.exchange_rate).toBe(0.85);
      expect(res.body.currency).toBe('EUR');
      expect(res.body.margin_percentage).toBe(40);
      expect(res.body.used_fallback_rate).toBe(false);
      expect(typeof res.body.selling_price_local).toBe('number');
      expect(res.body.calculation_timestamp).toBeDefined();
    });

    it('should use fallback rate when the exchange API fails and still return 200', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockPrismaBook);
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      mockDb.book.update.mockResolvedValue({
        ...mockPrismaBook,
        sellingPriceLocal: 22.39,
      });

      const res = await request(app).post('/books/1/calculate-price');

      expect(res.status).toBe(200);
      expect(res.body.used_fallback_rate).toBe(true);
      expect(res.body.exchange_rate).toBe(1.0);
    });

    it('should return 404 when the book does not exist', async () => {
      mockDb.book.findUnique.mockResolvedValue(null);

      const res = await request(app).post('/books/999/calculate-price');

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('999');
    });

    it('should return 400 when ID is not a number', async () => {
      const res = await request(app).post('/books/abc/calculate-price');

      expect(res.status).toBe(400);
    });
  });
});
