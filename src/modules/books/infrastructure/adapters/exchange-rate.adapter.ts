import axios from 'axios';
import type { ExchangeRatePort } from '../../application/ports/exchange-rate.port';
import { env } from '../../../../config/env';
import { logger } from '../../../../shared/utils/logger';

const EXCHANGE_RATE_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

interface ExchangeRateApiResponse {
  rates: Record<string, number>;
}

export class ExchangeRateAdapter implements ExchangeRatePort {
  async getRate(targetCurrency: string): Promise<{
    rate: number;
    currency: string;
    usedFallback: boolean;
  }> {
    try {
      const { data } = await axios.get<ExchangeRateApiResponse>(EXCHANGE_RATE_URL, {
        timeout: 5000,
      });
      const rate = data.rates[targetCurrency.toUpperCase()];

      if (!rate) {
        logger.warn({ targetCurrency }, 'Currency not found in API response, using fallback');
        return {
          rate: env.DEFAULT_EXCHANGE_RATE,
          currency: targetCurrency,
          usedFallback: true,
        };
      }

      return { rate, currency: targetCurrency, usedFallback: false };
    } catch (error: unknown) {
      logger.warn({ error, targetCurrency }, 'Exchange rate API failed, using fallback rate');
      return {
        rate: env.DEFAULT_EXCHANGE_RATE,
        currency: targetCurrency,
        usedFallback: true,
      };
    }
  }
}
