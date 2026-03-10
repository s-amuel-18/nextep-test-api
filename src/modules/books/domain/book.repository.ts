import type { Book, CreateBookInput, UpdateBookInput } from './book.entity';

export interface BookRepository {
  findAll(options?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Book[]; total: number; page: number; limit: number }>;
  findById(id: number): Promise<Book | null>;
  findByIsbn(isbn: string): Promise<Book | null>;
  findByCategory(category: string): Promise<Book[]>;
  findLowStock(threshold: number): Promise<Book[]>;
  create(input: CreateBookInput): Promise<Book>;
  update(id: number, input: UpdateBookInput): Promise<Book>;
  updatePrice(id: number, sellingPriceLocal: number): Promise<Book>;
  delete(id: number): Promise<void>;
}
