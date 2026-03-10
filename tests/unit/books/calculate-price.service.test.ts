// Mock env module — must be declared before any source import
jest.mock('../../../src/config/env', () => ({
  env: {
    DEFAULT_EXCHANGE_RATE: 1.0,
    DEFAULT_CURRENCY: 'USD',
  },
}));

import { CalculatePriceService } from '../../../src/modules/books/application/services/calculate-price.service';
import {
  BookNotFoundError,
  PriceCalculationError,
} from '../../../src/modules/books/domain/book.errors';
import { makeBook } from '../../helpers/book.factory';
import { makeMockRepository } from '../../helpers/mocks/repository.mock';
import { makeMockExchangeRate } from '../../helpers/mocks/exchange-rate.mock';
import type { BookRepository } from '../../../src/modules/books/domain/book.repository';
import type { ExchangeRatePort } from '../../../src/modules/books/application/ports/exchange-rate.port';

describe('CalculatePriceService', () => {
  let service: CalculatePriceService;
  let mockRepository: jest.Mocked<BookRepository>;
  let mockExchangeRate: jest.Mocked<ExchangeRatePort>;

  beforeEach(() => {
    mockRepository = makeMockRepository();
    mockExchangeRate = makeMockExchangeRate();
    service = new CalculatePriceService(mockRepository, mockExchangeRate);
  });

  describe('execute', () => {
    it('should calculate selling price with 40% margin using real exchange rate', async () => {
      // Arrange
      const book = makeBook({ costUsd: 10.0, supplierCountry: 'ES' });
      mockRepository.findById.mockResolvedValue(book);
      mockExchangeRate.getRate.mockResolvedValue({
        rate: 0.85,
        currency: 'EUR',
        usedFallback: false,
      });
      mockRepository.updatePrice.mockResolvedValue(
        makeBook({ sellingPriceLocal: 11.9, costUsd: 10.0 }),
      );

      // Act
      const result = await service.execute(1);

      // Assert
      expect(result.cost_local).toBe(8.5);
      expect(result.selling_price_local).toBe(11.9);
      expect(result.margin_percentage).toBe(40);
      expect(result.used_fallback_rate).toBe(false);
      expect(result.currency).toBe('EUR');
    });

    it('should use fallback rate when exchange rate API fails', async () => {
      // Arrange
      const book = makeBook({ costUsd: 15.99, supplierCountry: 'ES' });
      mockRepository.findById.mockResolvedValue(book);
      mockExchangeRate.getRate.mockResolvedValue({
        rate: 1.0,
        currency: 'EUR',
        usedFallback: true,
      });
      mockRepository.updatePrice.mockResolvedValue(
        makeBook({ sellingPriceLocal: 22.39, costUsd: 15.99 }),
      );

      // Act
      const result = await service.execute(1);

      // Assert
      expect(result.used_fallback_rate).toBe(true);
      expect(result.exchange_rate).toBe(1.0);
      expect(result.selling_price_local).toBe(22.39);
    });

    it('should persist the calculated price to the database', async () => {
      // Arrange
      const book = makeBook({ costUsd: 10.0, supplierCountry: 'ES' });
      mockRepository.findById.mockResolvedValue(book);
      mockExchangeRate.getRate.mockResolvedValue({
        rate: 0.85,
        currency: 'EUR',
        usedFallback: false,
      });
      mockRepository.updatePrice.mockResolvedValue(makeBook({ sellingPriceLocal: 11.9 }));

      // Act
      await service.execute(1);

      // Assert
      expect(mockRepository.updatePrice).toHaveBeenCalledWith(1, 11.9);
    });

    it('should throw BookNotFoundError when book does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.execute(999)).rejects.toThrow(BookNotFoundError);
      expect(mockExchangeRate.getRate).not.toHaveBeenCalled();
    });

    it('should throw PriceCalculationError when costUsd is 0', async () => {
      const book = makeBook({ costUsd: 0 });
      mockRepository.findById.mockResolvedValue(book);

      await expect(service.execute(1)).rejects.toThrow(PriceCalculationError);
      expect(mockExchangeRate.getRate).not.toHaveBeenCalled();
    });

    it('should use DEFAULT_CURRENCY when supplier_country has no currency mapping', async () => {
      // Arrange — 'ZZ' is not in the currency map
      const book = makeBook({ supplierCountry: 'ZZ', costUsd: 10.0 });
      mockRepository.findById.mockResolvedValue(book);
      mockExchangeRate.getRate.mockResolvedValue({
        rate: 1.0,
        currency: 'USD',
        usedFallback: true,
      });
      mockRepository.updatePrice.mockResolvedValue(makeBook({ sellingPriceLocal: 14.0 }));

      // Act
      const result = await service.execute(1);

      // Assert
      expect(result.currency).toBe('USD');
      expect(mockExchangeRate.getRate).toHaveBeenCalledWith('USD');
    });

    it('should include calculation_timestamp in the result', async () => {
      const book = makeBook({ costUsd: 10.0 });
      mockRepository.findById.mockResolvedValue(book);
      mockExchangeRate.getRate.mockResolvedValue({
        rate: 1.0,
        currency: 'USD',
        usedFallback: false,
      });
      mockRepository.updatePrice.mockResolvedValue(makeBook({ sellingPriceLocal: 14.0 }));

      const result = await service.execute(1);

      expect(result.calculation_timestamp).toBeDefined();
      expect(new Date(result.calculation_timestamp).toString()).not.toBe('Invalid Date');
    });

    it('should return correct book_id and cost_usd in result', async () => {
      const book = makeBook({ id: 42, costUsd: 25.5 });
      mockRepository.findById.mockResolvedValue(book);
      mockExchangeRate.getRate.mockResolvedValue({
        rate: 1.0,
        currency: 'USD',
        usedFallback: false,
      });
      mockRepository.updatePrice.mockResolvedValue(makeBook({ id: 42, sellingPriceLocal: 35.7 }));

      const result = await service.execute(42);

      expect(result.book_id).toBe(42);
      expect(result.cost_usd).toBe(25.5);
    });
  });
});
