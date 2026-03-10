import type { BookRepository } from '../../domain/book.repository';
import type { Book, CreateBookInput, UpdateBookInput } from '../../domain/book.entity';
import { BookNotFoundError, DuplicateIsbnError } from '../../domain/book.errors';

export class BooksService {
  constructor(private readonly repository: BookRepository) {}

  async getAll(page?: number, limit?: number) {
    return this.repository.findAll({ page, limit });
  }

  async getById(id: number): Promise<Book> {
    const book = await this.repository.findById(id);
    if (!book) throw new BookNotFoundError(id);
    return book;
  }

  async create(input: CreateBookInput): Promise<Book> {
    const existing = await this.repository.findByIsbn(input.isbn);
    if (existing) throw new DuplicateIsbnError(input.isbn);
    return this.repository.create(input);
  }

  async update(id: number, input: UpdateBookInput): Promise<Book> {
    const book = await this.repository.findById(id);
    if (!book) throw new BookNotFoundError(id);

    if (input.isbn && input.isbn !== book.isbn) {
      const existing = await this.repository.findByIsbn(input.isbn);
      if (existing) throw new DuplicateIsbnError(input.isbn);
    }

    return this.repository.update(id, input);
  }

  async delete(id: number): Promise<void> {
    const book = await this.repository.findById(id);
    if (!book) throw new BookNotFoundError(id);
    await this.repository.delete(id);
  }

  async getByCategory(category: string): Promise<Book[]> {
    return this.repository.findByCategory(category);
  }

  async getLowStock(threshold: number): Promise<Book[]> {
    return this.repository.findLowStock(threshold);
  }
}
