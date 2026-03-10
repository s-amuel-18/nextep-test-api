/**
 * E2E Tests — Books Full CRUD Lifecycle
 * Verifies the complete POST → GET → PUT → DELETE flow in a single test.
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
import { mockPrismaBook, validCreateBody } from '../helpers/prisma-book.fixture';

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Books Full CRUD Lifecycle E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.$transaction.mockImplementation((queries: Promise<unknown>[]) => Promise.all(queries));
  });

  it('should POST, GET, PUT and DELETE a book successfully', async () => {
    // POST — Create
    mockDb.book.findUnique.mockResolvedValueOnce(null); // ISBN check
    mockDb.book.create.mockResolvedValueOnce(mockPrismaBook);

    const createRes = await request(app).post('/books').send(validCreateBody);
    expect(createRes.status).toBe(201);
    const bookId: number = createRes.body.id as number;

    // GET — Retrieve
    mockDb.book.findUnique.mockResolvedValueOnce(mockPrismaBook);
    const getRes = await request(app).get(`/books/${bookId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.isbn).toBe('9788437604947');

    // PUT — Update
    const updatedBook = { ...mockPrismaBook, stockQuantity: 50 };
    mockDb.book.findUnique.mockResolvedValueOnce(mockPrismaBook);
    mockDb.book.update.mockResolvedValueOnce(updatedBook);
    const putRes = await request(app).put(`/books/${bookId}`).send({ stock_quantity: 50 });
    expect(putRes.status).toBe(200);
    expect(putRes.body.stockQuantity).toBe(50);

    // DELETE — Remove
    mockDb.book.findUnique.mockResolvedValueOnce(mockPrismaBook);
    mockDb.book.delete.mockResolvedValueOnce(mockPrismaBook);
    const deleteRes = await request(app).delete(`/books/${bookId}`);
    expect(deleteRes.status).toBe(204);
  });
});
