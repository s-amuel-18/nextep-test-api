import { prisma } from './config/database';

// ── Infraestructura ───────────────────────────────────────────────
import { BookPrismaRepository } from './modules/books/infrastructure/repositories/book.prisma.repository';
import { ExchangeRateAdapter } from './modules/books/infrastructure/adapters/exchange-rate.adapter';

// ── Servicios de Aplicación ───────────────────────────────────────
import { BooksService } from './modules/books/application/services/books.service';
import { CalculatePriceService } from './modules/books/application/services/calculate-price.service';

// ── Controllers ───────────────────────────────────────────────────
import { BooksController } from './modules/books/infrastructure/controllers/books.controller';
import { CalculatePriceController } from './modules/books/infrastructure/controllers/calculate-price.controller';

// ── Routers ───────────────────────────────────────────────────────
import { createBooksRouter } from './modules/books/infrastructure/routes/books.routes';

// ─────────────────────────────────────────────────────────────────
// 1. Repositorios y Adaptadores (dependen de Prisma / librerías externas)
const bookRepository = new BookPrismaRepository(prisma);
const exchangeRateAdapter = new ExchangeRateAdapter();

// 2. Servicios (dependen de repositorios y adaptadores)
const booksService = new BooksService(bookRepository);
const calculatePriceService = new CalculatePriceService(bookRepository, exchangeRateAdapter);

// 3. Controllers (dependen de servicios)
const booksController = new BooksController(booksService);
const calculatePriceController = new CalculatePriceController(calculatePriceService);

// 4. Routers (dependen de controllers)
export const booksRouter = createBooksRouter(booksController, calculatePriceController);
