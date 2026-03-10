import { AppError } from '../../../shared/errors/app.error';

export class BookNotFoundError extends AppError {
  constructor(id: number) {
    super(`Book with id ${id} not found`, 404, true);
  }
}

export class DuplicateIsbnError extends AppError {
  constructor(isbn: string) {
    super(`A book with ISBN "${isbn}" already exists`, 409, true);
  }
}

export class PriceCalculationError extends AppError {
  constructor(reason: string) {
    super(`Price calculation failed: ${reason}`, 422, true);
  }
}
