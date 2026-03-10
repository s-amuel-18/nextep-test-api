export interface ExchangeRatePort {
  getRate(targetCurrency: string): Promise<{
    rate: number;
    currency: string;
    usedFallback: boolean;
  }>;
}
