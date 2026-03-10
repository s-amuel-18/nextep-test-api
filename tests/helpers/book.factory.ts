import type { Book } from '../../src/modules/books/domain/book.entity';

export const makeBook = (overrides: Partial<Book> = {}): Book => ({
  id: 1,
  title: 'El Quijote',
  author: 'Miguel de Cervantes',
  isbn: '9788437604947',
  costUsd: 15.99,
  sellingPriceLocal: null,
  stockQuantity: 25,
  category: 'Literatura Clásica',
  supplierCountry: 'ES',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
