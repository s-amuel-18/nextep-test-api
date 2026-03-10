export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  ES: 'EUR',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  PT: 'EUR',
  MX: 'MXN',
  CO: 'COP',
  AR: 'ARS',
  CL: 'CLP',
  PE: 'PEN',
  US: 'USD',
  GB: 'GBP',
  JP: 'JPY',
  CN: 'CNY',
  BR: 'BRL',
};

export const getCurrencyByCountry = (countryCode: string, fallback: string): string => {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? fallback;
};
