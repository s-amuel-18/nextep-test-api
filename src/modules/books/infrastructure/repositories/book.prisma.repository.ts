import type { PrismaClient, Book as PrismaBook } from '@prisma/client';
import type { BookRepository } from '../../domain/book.repository';
import type { Book, CreateBookInput, UpdateBookInput } from '../../domain/book.entity';

export class PrismaBookMapper {
  static toDomain(prismaBook: PrismaBook): Book {
    return {
      id: prismaBook.id,
      title: prismaBook.title,
      author: prismaBook.author,
      isbn: prismaBook.isbn,
      costUsd: Number(prismaBook.costUsd),
      sellingPriceLocal: prismaBook.sellingPriceLocal ? Number(prismaBook.sellingPriceLocal) : null,
      stockQuantity: prismaBook.stockQuantity,
      category: prismaBook.category,
      supplierCountry: prismaBook.supplierCountry,
      createdAt: prismaBook.createdAt,
      updatedAt: prismaBook.updatedAt,
    };
  }
}

export class BookPrismaRepository implements BookRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(options?: { page?: number; limit?: number }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count(),
    ]);

    return { data: data.map(PrismaBookMapper.toDomain), total, page, limit };
  }

  async findById(id: number): Promise<Book | null> {
    const book = await this.prisma.book.findUnique({ where: { id } });
    return book ? PrismaBookMapper.toDomain(book) : null;
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    const book = await this.prisma.book.findUnique({ where: { isbn } });
    return book ? PrismaBookMapper.toDomain(book) : null;
  }

  async findByCategory(category: string): Promise<Book[]> {
    const books = await this.prisma.book.findMany({
      where: { category: { equals: category, mode: 'insensitive' } },
    });
    return books.map(PrismaBookMapper.toDomain);
  }

  async findLowStock(threshold: number): Promise<Book[]> {
    const books = await this.prisma.book.findMany({
      where: { stockQuantity: { lte: threshold } },
      orderBy: { stockQuantity: 'asc' },
    });
    return books.map(PrismaBookMapper.toDomain);
  }

  async create(input: CreateBookInput): Promise<Book> {
    const book = await this.prisma.book.create({
      data: {
        title: input.title,
        author: input.author,
        isbn: input.isbn,
        costUsd: input.costUsd,
        stockQuantity: input.stockQuantity,
        category: input.category,
        supplierCountry: input.supplierCountry,
      },
    });
    return PrismaBookMapper.toDomain(book);
  }

  async update(id: number, input: UpdateBookInput): Promise<Book> {
    const book = await this.prisma.book.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.author !== undefined && { author: input.author }),
        ...(input.isbn !== undefined && { isbn: input.isbn }),
        ...(input.costUsd !== undefined && { costUsd: input.costUsd }),
        ...(input.stockQuantity !== undefined && { stockQuantity: input.stockQuantity }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.supplierCountry !== undefined && { supplierCountry: input.supplierCountry }),
      },
    });
    return PrismaBookMapper.toDomain(book);
  }

  async updatePrice(id: number, sellingPriceLocal: number): Promise<Book> {
    const book = await this.prisma.book.update({
      where: { id },
      data: { sellingPriceLocal },
    });
    return PrismaBookMapper.toDomain(book);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.book.delete({ where: { id } });
  }
}
