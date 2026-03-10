import type { BookRepository } from '../../domain/book.repository';
import type { ExchangeRatePort } from '../ports/exchange-rate.port';
import { BookNotFoundError, PriceCalculationError } from '../../domain/book.errors';
import { getCurrencyByCountry } from '../../../../shared/utils/currency.map';
import { env } from '../../../../config/env';

export interface PriceCalculationResult {
  book_id: number;
  cost_usd: number;
  exchange_rate: number;
  cost_local: number;
  margin_percentage: number;
  selling_price_local: number;
  currency: string;
  used_fallback_rate: boolean;
  calculation_timestamp: string;
}

export class CalculatePriceService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly exchangeRatePort: ExchangeRatePort,
  ) {}

  async execute(bookId: number): Promise<PriceCalculationResult> {
    const book = await this.bookRepository.findById(bookId);
    if (!book) throw new BookNotFoundError(bookId);

    const costUsd = Number(book.costUsd);
    if (costUsd <= 0) throw new PriceCalculationError('cost_usd must be greater than 0');

    const currency = getCurrencyByCountry(book.supplierCountry, env.DEFAULT_CURRENCY);
    const { rate, usedFallback } = await this.exchangeRatePort.getRate(currency);

    const costLocal = parseFloat((costUsd * rate).toFixed(2));
    const sellingPriceLocal = parseFloat((costLocal * 1.4).toFixed(2));

    await this.bookRepository.updatePrice(bookId, sellingPriceLocal);

    return {
      book_id: book.id,
      cost_usd: costUsd,
      exchange_rate: rate,
      cost_local: costLocal,
      margin_percentage: 40,
      selling_price_local: sellingPriceLocal,
      currency,
      used_fallback_rate: usedFallback,
      calculation_timestamp: new Date().toISOString(),
    };
  }
}
