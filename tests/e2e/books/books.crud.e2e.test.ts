/**
 * E2E Tests — Books CRUD
 * Covers: POST /books, GET /books, GET /books/:id, PUT /books/:id, DELETE /books/:id
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
describe('Books CRUD E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.$transaction.mockImplementation((queries: Promise<unknown>[]) => Promise.all(queries));
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('POST /books — Create book', () => {
    it('should create a book and return 201', async () => {
      mockDb.book.findUnique.mockResolvedValue(null);
      mockDb.book.create.mockResolvedValue(mockPrismaBook);

      const res = await request(app).post('/books').send(validCreateBody);

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(1);
      expect(res.body.isbn).toBe('9788437604947');
      expect(res.body.sellingPriceLocal).toBeNull();
    });

    it('should return 400 when ISBN is invalid', async () => {
      const res = await request(app)
        .post('/books')
        .send({ ...validCreateBody, isbn: '1234567890' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'isbn' })]),
      );
    });

    it('should return 400 when cost_usd is 0', async () => {
      const res = await request(app)
        .post('/books')
        .send({ ...validCreateBody, cost_usd: 0 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should return 400 when stock_quantity is negative', async () => {
      const res = await request(app)
        .post('/books')
        .send({ ...validCreateBody, stock_quantity: -1 });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should return 400 when a required field is missing', async () => {
      const { title: _title, ...bodyWithoutTitle } = validCreateBody;

      const res = await request(app).post('/books').send(bodyWithoutTitle);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should return 409 when ISBN already exists', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockPrismaBook);

      const res = await request(app).post('/books').send(validCreateBody);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('already exists');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('GET /books — List books', () => {
    it('should return a paginated list of books with default params', async () => {
      mockDb.book.findMany.mockResolvedValue([mockPrismaBook]);
      mockDb.book.count.mockResolvedValue(1);

      const res = await request(app).get('/books');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.total).toBe(1);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(10);
    });

    it('should return an empty array when no books exist', async () => {
      mockDb.book.findMany.mockResolvedValue([]);
      mockDb.book.count.mockResolvedValue(0);

      const res = await request(app).get('/books');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('should respect pagination params', async () => {
      mockDb.book.findMany.mockResolvedValue([mockPrismaBook]);
      mockDb.book.count.mockResolvedValue(5);

      const res = await request(app).get('/books?page=2&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(2);
      expect(res.body.limit).toBe(2);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('GET /books/:id — Get book by ID', () => {
    it('should return a book when it exists', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockPrismaBook);

      const res = await request(app).get('/books/1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.title).toBe('El Quijote');
    });

    it('should return 404 when book does not exist', async () => {
      mockDb.book.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/books/999');

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toContain('999');
    });

    it('should return 400 when ID is not a number', async () => {
      const res = await request(app).get('/books/abc');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('PUT /books/:id — Update book', () => {
    it('should update and return the book', async () => {
      const updatedBook = { ...mockPrismaBook, stockQuantity: 30 };
      mockDb.book.findUnique.mockResolvedValue(mockPrismaBook);
      mockDb.book.update.mockResolvedValue(updatedBook);

      const res = await request(app).put('/books/1').send({ stock_quantity: 30 });

      expect(res.status).toBe(200);
      expect(res.body.stockQuantity).toBe(30);
    });

    it('should return 404 when book does not exist', async () => {
      mockDb.book.findUnique.mockResolvedValue(null);

      const res = await request(app).put('/books/999').send({ stock_quantity: 30 });

      expect(res.status).toBe(404);
    });

    it('should return 400 when body is empty', async () => {
      const res = await request(app).put('/books/1').send({});

      expect(res.status).toBe(400);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe('DELETE /books/:id — Delete book', () => {
    it('should delete the book and return 204', async () => {
      mockDb.book.findUnique.mockResolvedValue(mockPrismaBook);
      mockDb.book.delete.mockResolvedValue(mockPrismaBook);

      const res = await request(app).delete('/books/1');

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });

    it('should return 404 when book does not exist', async () => {
      mockDb.book.findUnique.mockResolvedValue(null);

      const res = await request(app).delete('/books/999');

      expect(res.status).toBe(404);
    });
  });
});
