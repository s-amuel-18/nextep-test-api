import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { booksRouter } from './container';
import { errorHandler } from './shared/errors/error-handler';
import { rateLimiter } from './shared/middlewares/rate-limit.middleware';
import { swaggerSpec } from './config/swagger';

const app = express();

// ── Middlewares globales ───────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// ── Documentación Swagger ──────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Rutas ─────────────────────────────────────────────────────────
app.use('/books', booksRouter);

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error handler global (siempre al final) ───────────────────────
app.use(errorHandler);

export default app;
