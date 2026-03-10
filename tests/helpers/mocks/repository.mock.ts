import type { BookRepository } from '../../../src/modules/books/domain/book.repository';

export const makeMockRepository = (): jest.Mocked<BookRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByIsbn: jest.fn(),
  findByCategory: jest.fn(),
  findLowStock: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updatePrice: jest.fn(),
  delete: jest.fn(),
});
