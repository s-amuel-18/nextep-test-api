import { prisma } from './config/database';
import { BookPrismaRepository } from './modules/books/infrastructure/repositories/book.prisma.repository';
import { ExchangeRateAdapter } from './modules/books/infrastructure/adapters/exchange-rate.adapter';
import { BooksService } from './modules/books/application/services/books.service';
import { CalculatePriceService } from './modules/books/application/services/calculate-price.service';
import { BooksController } from './modules/books/infrastructure/controllers/books.controller';
import { CalculatePriceController } from './modules/books/infrastructure/controllers/calculate-price.controller';
import { createBooksRouter } from './modules/books/infrastructure/routes/books.routes';

const bookRepository = new BookPrismaRepository(prisma);
const exchangeRateAdapter = new ExchangeRateAdapter();

const booksService = new BooksService(bookRepository);
const calculatePriceService = new CalculatePriceService(bookRepository, exchangeRateAdapter);

const booksController = new BooksController(booksService);
const calculatePriceController = new CalculatePriceController(calculatePriceService);

export const booksRouter = createBooksRouter(booksController, calculatePriceController);
