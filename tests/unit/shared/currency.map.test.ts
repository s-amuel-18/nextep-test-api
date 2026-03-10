import {
  getCurrencyByCountry,
  COUNTRY_TO_CURRENCY,
} from '../../../src/shared/utils/currency.map';

describe('COUNTRY_TO_CURRENCY', () => {
  it('should map European countries to EUR', () => {
    expect(COUNTRY_TO_CURRENCY['ES']).toBe('EUR');
    expect(COUNTRY_TO_CURRENCY['DE']).toBe('EUR');
    expect(COUNTRY_TO_CURRENCY['FR']).toBe('EUR');
    expect(COUNTRY_TO_CURRENCY['IT']).toBe('EUR');
    expect(COUNTRY_TO_CURRENCY['PT']).toBe('EUR');
  });

  it('should map Latin American countries to their local currencies', () => {
    expect(COUNTRY_TO_CURRENCY['MX']).toBe('MXN');
    expect(COUNTRY_TO_CURRENCY['CO']).toBe('COP');
    expect(COUNTRY_TO_CURRENCY['AR']).toBe('ARS');
    expect(COUNTRY_TO_CURRENCY['CL']).toBe('CLP');
    expect(COUNTRY_TO_CURRENCY['PE']).toBe('PEN');
    expect(COUNTRY_TO_CURRENCY['BR']).toBe('BRL');
  });

  it('should map other countries to their currencies', () => {
    expect(COUNTRY_TO_CURRENCY['US']).toBe('USD');
    expect(COUNTRY_TO_CURRENCY['GB']).toBe('GBP');
    expect(COUNTRY_TO_CURRENCY['JP']).toBe('JPY');
    expect(COUNTRY_TO_CURRENCY['CN']).toBe('CNY');
  });
});

describe('getCurrencyByCountry', () => {
  it('should return the correct currency for a known country code', () => {
    expect(getCurrencyByCountry('ES', 'USD')).toBe('EUR');
    expect(getCurrencyByCountry('US', 'EUR')).toBe('USD');
    expect(getCurrencyByCountry('BR', 'USD')).toBe('BRL');
  });

  it('should return the fallback for an unknown country code', () => {
    expect(getCurrencyByCountry('ZZ', 'USD')).toBe('USD');
    expect(getCurrencyByCountry('XX', 'EUR')).toBe('EUR');
  });

  it('should be case-insensitive', () => {
    expect(getCurrencyByCountry('es', 'USD')).toBe('EUR');
    expect(getCurrencyByCountry('us', 'EUR')).toBe('USD');
    expect(getCurrencyByCountry('Es', 'USD')).toBe('EUR');
  });

  it('should return the fallback for an empty string', () => {
    expect(getCurrencyByCountry('', 'USD')).toBe('USD');
  });
});
