import { cleanEnv, str, num, port } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'production', 'test'],
    default: 'development',
  }),

  PORT: port({
    default: 3000,
    docs: 'Puerto en el que escucha el servidor HTTP',
  }),

  DATABASE_URL: str({
    docs: 'Connection string de PostgreSQL. Formato: postgresql://user:pass@host:port/db',
  }),

  DEFAULT_EXCHANGE_RATE: num({
    default: 1.0,
    docs: 'Tasa de cambio fallback cuando la API externa no responde',
  }),

  DEFAULT_CURRENCY: str({
    default: 'USD',
    docs: 'Moneda fallback cuando el supplier_country no tiene mapeo',
  }),

  RATE_LIMIT_WINDOW_MS: num({
    default: 60_000,
    docs: 'Ventana de tiempo del rate limiting en milisegundos',
  }),

  RATE_LIMIT_MAX: num({
    default: 100,
    docs: 'Máximo de requests por IP en la ventana de tiempo',
  }),
});
