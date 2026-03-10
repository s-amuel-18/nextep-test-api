/**
 * E2E Tests — Books Search & Low Stock
 * Covers: GET /books/search, GET /books/low-stock
 */

// ── Mocks (must be declared before any source import) ─────────────────────────
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

// ── Imports ───────────────────────────────────────────────────────────────────
import request from 'supertest';
import 'express-async-errors';
import app from '../../../src/app';
import { mockPrismaBook } from '../helpers/prisma-book.fixture';

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Books Search & Low Stock E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.$transaction.mockImplementation((queries: Promise<unknown>[]) => Promise.all(queries));
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('GET /books/search — Search by category', () => {
    it('should return books matching the category', async () => {
      mockDb.book.findMany.mockResolvedValue([mockPrismaBook]);

      const res = await request(app).get('/books/search?category=Literatura%20Clásica');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });

    it('should return an empty array when no books match', async () => {
      mockDb.book.findMany.mockResolvedValue([]);

      const res = await request(app).get('/books/search?category=Ciencia%20Ficción');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('should return 400 when category param is missing', async () => {
      const res = await request(app).get('/books/search');

      expect(res.status).toBe(400);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('GET /books/low-stock — Low stock books', () => {
    it('should return books at or below the default threshold (10)', async () => {
      const lowStockBook = { ...mockPrismaBook, stockQuantity: 3 };
      mockDb.book.findMany.mockResolvedValue([lowStockBook]);

      const res = await request(app).get('/books/low-stock');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });

    it('should respect a custom threshold', async () => {
      mockDb.book.findMany.mockResolvedValue([]);

      const res = await request(app).get('/books/low-stock?threshold=2');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 400 when threshold is negative', async () => {
      const res = await request(app).get('/books/low-stock?threshold=-1');

      expect(res.status).toBe(400);
    });
  });
});
