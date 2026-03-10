import type { ExchangeRatePort } from '../../../src/modules/books/application/ports/exchange-rate.port';

export const makeMockExchangeRate = (): jest.Mocked<ExchangeRatePort> => ({
  getRate: jest.fn(),
});
