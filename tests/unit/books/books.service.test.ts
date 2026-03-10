import { BooksService } from '../../../src/modules/books/application/services/books.service';
import { BookNotFoundError, DuplicateIsbnError } from '../../../src/modules/books/domain/book.errors';
import { makeBook } from '../../helpers/book.factory';
import { makeMockRepository } from '../../helpers/mocks/repository.mock';
import type { BookRepository } from '../../../src/modules/books/domain/book.repository';

describe('BooksService', () => {
  let service: BooksService;
  let mockRepository: jest.Mocked<BookRepository>;

  beforeEach(() => {
    mockRepository = makeMockRepository();
    service = new BooksService(mockRepository);
  });

  describe('getAll', () => {
    it('should return paginated books', async () => {
      const expected = { data: [makeBook()], total: 1, page: 1, limit: 10 };
      mockRepository.findAll.mockResolvedValue(expected);

      const result = await service.getAll(1, 10);

      expect(result).toEqual(expected);
      expect(mockRepository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });

  describe('getById', () => {
    it('should return the book when it exists', async () => {
      const book = makeBook();
      mockRepository.findById.mockResolvedValue(book);

      const result = await service.getById(1);

      expect(result).toEqual(book);
    });

    it('should throw BookNotFoundError when book does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(BookNotFoundError);
    });
  });

  describe('create', () => {
    it('should create and return a new book', async () => {
      const input = {
        title: 'El Quijote',
        author: 'Miguel de Cervantes',
        isbn: '9788437604947',
        costUsd: 15.99,
        stockQuantity: 25,
        category: 'Literatura Clásica',
        supplierCountry: 'ES',
      };
      const book = makeBook();
      mockRepository.findByIsbn.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(book);

      const result = await service.create(input);

      expect(result).toEqual(book);
      expect(mockRepository.findByIsbn).toHaveBeenCalledWith(input.isbn);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });

    it('should throw DuplicateIsbnError when ISBN already exists', async () => {
      const input = {
        title: 'El Quijote',
        author: 'Miguel de Cervantes',
        isbn: '9788437604947',
        costUsd: 15.99,
        stockQuantity: 25,
        category: 'Literatura Clásica',
        supplierCountry: 'ES',
      };
      mockRepository.findByIsbn.mockResolvedValue(makeBook());

      await expect(service.create(input)).rejects.toThrow(DuplicateIsbnError);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the book when it exists', async () => {
      const book = makeBook();
      const updated = makeBook({ stockQuantity: 30 });
      mockRepository.findById.mockResolvedValue(book);
      mockRepository.findByIsbn.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.update(1, { stockQuantity: 30 });

      expect(result).toEqual(updated);
    });

    it('should throw BookNotFoundError when book does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, { stockQuantity: 30 })).rejects.toThrow(BookNotFoundError);
    });

    it('should throw DuplicateIsbnError when new ISBN is already in use by another book', async () => {
      const book = makeBook({ id: 1, isbn: '9788437604947' });
      const anotherBook = makeBook({ id: 2, isbn: '0306406152' });
      mockRepository.findById.mockResolvedValue(book);
      mockRepository.findByIsbn.mockResolvedValue(anotherBook);

      await expect(service.update(1, { isbn: '0306406152' })).rejects.toThrow(DuplicateIsbnError);
    });

    it('should allow updating with the same ISBN as the book itself', async () => {
      const book = makeBook({ isbn: '9788437604947' });
      const updated = makeBook({ title: 'Updated Title' });
      mockRepository.findById.mockResolvedValue(book);
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.update(1, { isbn: '9788437604947', title: 'Updated Title' });

      expect(result).toEqual(updated);
      expect(mockRepository.findByIsbn).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete the book when it exists', async () => {
      const book = makeBook();
      mockRepository.findById.mockResolvedValue(book);
      mockRepository.delete.mockResolvedValue(undefined);

      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw BookNotFoundError when book does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(BookNotFoundError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getByCategory', () => {
    it('should return books matching the category', async () => {
      const books = [makeBook()];
      mockRepository.findByCategory.mockResolvedValue(books);

      const result = await service.getByCategory('Literatura Clásica');

      expect(result).toEqual(books);
      expect(mockRepository.findByCategory).toHaveBeenCalledWith('Literatura Clásica');
    });
  });

  describe('getLowStock', () => {
    it('should return books with stock at or below the threshold', async () => {
      const books = [makeBook({ stockQuantity: 3 })];
      mockRepository.findLowStock.mockResolvedValue(books);

      const result = await service.getLowStock(5);

      expect(result).toEqual(books);
      expect(mockRepository.findLowStock).toHaveBeenCalledWith(5);
    });
  });
});
