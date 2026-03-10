import 'express-async-errors'; // DEBE ser el primer import de la app
import app from './app';
import { prisma } from './config/database';
import { logger } from './shared/utils/logger';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';

// ─────────────────────────────────────────────────────────────────
// Helpers de status
// ─────────────────────────────────────────────────────────────────

const ok = (label: string, detail: string) => logger.info(`  [OK]   ${label.padEnd(20)} ${detail}`);

const fail = (label: string, detail: string) =>
  logger.error(`  [FAIL] ${label.padEnd(20)} ${detail}`);

const checkSwagger = (): boolean => {
  try {
    const spec = swaggerSpec as Record<string, unknown>;
    const paths = spec.paths as Record<string, unknown> | undefined;
    if (!paths) return false;
    return Object.keys(paths).length > 0;
  } catch {
    return false;
  }
};

const maskDatabaseUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}:${parsed.port}${parsed.pathname}`;
  } catch {
    return '(url inválida)';
  }
};

// ─────────────────────────────────────────────────────────────────
// Boot
// ─────────────────────────────────────────────────────────────────

const start = async () => {
  logger.info('');
  logger.info('-------------------------------------------------');
  logger.info('  Bookstore Inventory API -- iniciando...');
  logger.info('-------------------------------------------------');
  logger.info('');

  // ── Entorno ──────────────────────────────────────────────────
  ok('Entorno', `NODE_ENV=${env.NODE_ENV}  PORT=${env.PORT}`);

  // ── Base de datos ────────────────────────────────────────────
  try {
    await prisma.$connect();
    ok('PostgreSQL', maskDatabaseUrl(env.DATABASE_URL));
  } catch (error: unknown) {
    fail('PostgreSQL', 'No se pudo conectar a la base de datos');
    logger.fatal({ error }, 'Error de conexión a la base de datos');
    process.exit(1);
  }

  // ── Swagger ──────────────────────────────────────────────────
  if (checkSwagger()) {
    const spec = swaggerSpec as Record<string, unknown>;
    const paths = spec.paths as Record<string, unknown>;
    const endpointCount = Object.keys(paths).length;
    ok('Swagger', `${endpointCount} rutas documentadas → http://localhost:${env.PORT}/api-docs`);
  } else {
    fail('Swagger', 'No se encontraron rutas en el spec OpenAPI');
  }

  // ── Rate limiter ─────────────────────────────────────────────
  ok('Rate limiter', `${env.RATE_LIMIT_MAX} req / ${env.RATE_LIMIT_WINDOW_MS / 1000}s por IP`);

  // ── Servidor ─────────────────────────────────────────────────
  app.listen(env.PORT, () => {
    logger.info('');
    logger.info('-------------------------------------------------');
    ok('Servidor', `http://localhost:${env.PORT}`);
    logger.info('-------------------------------------------------');
    logger.info('');
  });
};

// ─────────────────────────────────────────────────────────────────
// Red de seguridad global
// ─────────────────────────────────────────────────────────────────

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection — shutting down');
  process.exit(1);
});

void start();
