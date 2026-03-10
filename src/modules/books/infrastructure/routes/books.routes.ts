import { Router } from 'express';
import type { BooksController } from '../controllers/books.controller';
import type { CalculatePriceController } from '../controllers/calculate-price.controller';
import { validate } from '../../../../shared/middlewares/validate.middleware';
import { asHandler } from '../../../../shared/utils/as-handler';
import { CreateBookDto } from '../dtos/create-book.dto';
import { UpdateBookDto } from '../dtos/update-book.dto';
import {
  GetAllBooksQueryDto,
  IdParamDto,
  SearchBookQueryDto,
  LowStockQueryDto,
} from '../dtos/query-params.dto';

export const createBooksRouter = (
  booksController: BooksController,
  calculatePriceController: CalculatePriceController,
): Router => {
  const router = Router();

  const validId = validate(IdParamDto, 'params');

  router.get('/search', validate(SearchBookQueryDto, 'query'), booksController.search);
  router.get(
    '/low-stock',
    validate(LowStockQueryDto, 'query'),
    asHandler(booksController.lowStock),
  );

  router.get('/', validate(GetAllBooksQueryDto, 'query'), asHandler(booksController.getAll));
  router.get('/:id', validId, asHandler(booksController.getById));
  router.post('/', validate(CreateBookDto, 'body'), booksController.create);
  router.put('/:id', validId, validate(UpdateBookDto, 'body'), asHandler(booksController.update));
  router.delete('/:id', validId, asHandler(booksController.delete));

  router.post('/:id/calculate-price', validId, asHandler(calculatePriceController.calculate));

  return router;
};
