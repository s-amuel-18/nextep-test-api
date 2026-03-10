export interface ExchangeRatePort {
  /**
   * Retorna la tasa de cambio de USD a la moneda destino.
   * Si la API externa falla, debe retornar la tasa por defecto (fallback).
   * Nunca debe lanzar un error — el fallback es responsabilidad del adaptador.
   */
  getRate(targetCurrency: string): Promise<{
    rate: number;
    currency: string;
    usedFallback: boolean;
  }>;
}
