# Bookstore Inventory API

> **Prueba Técnica — Nextep Innovation | Backend Developer**
> Stack: Node.js · TypeScript · Express · PostgreSQL · Prisma · Docker

API REST para gestión de inventario de librerías con validación de precios en tiempo real mediante integración con la API de tasas de cambio de `exchangerate-api.com`.

---

## Arquitectura

El proyecto sigue **Arquitectura Hexagonal (Ports & Adapters)**, separando la lógica de negocio de los detalles de implementación (BD, HTTP, APIs externas):

```
src/
├── modules/books/
│   ├── domain/          ← Entidades puras + Errores de negocio + Puerto Repositorio
│   ├── application/     ← Casos de uso (servicios) + Puerto ExchangeRate
│   └── infrastructure/  ← Controllers, Repositorio Prisma, Adaptador Axios, DTOs, Rutas
├── config/              ← env.ts (Envalid), database.ts (Prisma Singleton), swagger.ts
├── shared/              ← AppError, errorHandler, validate middleware, logger, utils
├── container.ts         ← Composition Root: ensambla todas las dependencias
├── app.ts               ← Express: middlewares, rutas, swagger, error handler
└── server.ts            ← Entry point: conecta BD y levanta el servidor
```

**Decisiones de diseño:**
- **Inyección de dependencias manual** — sin frameworks de DI, simple y predecible.
- **TDD** — tests unitarios primero, luego implementación. Cobertura de servicios y E2E.
- **Zod** en la capa de infraestructura para validación de requests HTTP.
- **Pino** como logger (JSON estructurado en producción, pretty en desarrollo).
- **Fallback de tasa de cambio** — la API externa nunca bloquea el endpoint.

---

## Requisitos previos

- Node.js 20+ LTS
- PostgreSQL 16 (o Docker)
- npm

---

## Instalación y ejecución local

### Con Docker (recomendado para demo)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar PostgreSQL + API
npm run docker:up

# La API ejecuta las migraciones automáticamente al arrancar
# Disponible en: http://localhost:3000
# Swagger UI en:  http://localhost:3000/api-docs

# Detener
npm run docker:down
```

### Sin Docker (desarrollo local)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores de tu BD local

# 3. Levantar solo PostgreSQL con Docker
npm run docker:dev

# 4. Ejecutar migraciones
npm run db:migrate

# 5. (Opcional) Poblar con datos de prueba
npm run db:seed

# 6. Iniciar con hot-reload
npm run dev
# → http://localhost:3000
```

---

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `NODE_ENV` | `development` | Entorno (`development`, `production`, `test`) |
| `PORT` | `3000` | Puerto del servidor |
| `DATABASE_URL` | — | Connection string de PostgreSQL |
| `DEFAULT_EXCHANGE_RATE` | `1.0` | Tasa de cambio fallback |
| `DEFAULT_CURRENCY` | `USD` | Moneda fallback cuando el país no tiene mapeo |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Ventana de rate limiting (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests por IP en la ventana |

---

## Endpoints

### CRUD obligatorio

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/books` | Crear un libro |
| `GET` | `/books` | Listar libros (paginación: `?page=1&limit=10`) |
| `GET` | `/books/:id` | Obtener libro por ID |
| `PUT` | `/books/:id` | Actualizar un libro (parcial) |
| `DELETE` | `/books/:id` | Eliminar un libro |

### Integración externa (obligatorio)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/books/:id/calculate-price` | Calcular precio con tasa de cambio actual |

### Bonus

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/books/search?category=X` | Buscar por categoría (case-insensitive) |
| `GET` | `/books/low-stock?threshold=10` | Libros con stock bajo |

### Otros

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api-docs` | Documentación Swagger UI |

---

## Ejemplos de uso

### Crear un libro

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "El Quijote",
    "author": "Miguel de Cervantes",
    "isbn": "9788437604947",
    "cost_usd": 15.99,
    "stock_quantity": 25,
    "category": "Literatura Clásica",
    "supplier_country": "ES"
  }'
```

```json
HTTP 201 Created
{
  "id": 1,
  "title": "El Quijote",
  "author": "Miguel de Cervantes",
  "isbn": "9788437604947",
  "costUsd": 15.99,
  "sellingPriceLocal": null,
  "stockQuantity": 25,
  "category": "Literatura Clásica",
  "supplierCountry": "ES",
  "createdAt": "2026-03-09T21:00:00.000Z",
  "updatedAt": "2026-03-09T21:00:00.000Z"
}
```

### Calcular precio de venta

```bash
curl -X POST http://localhost:3000/books/1/calculate-price
```

```json
HTTP 200 OK
{
  "book_id": 1,
  "cost_usd": 15.99,
  "exchange_rate": 0.85,
  "cost_local": 13.59,
  "margin_percentage": 40,
  "selling_price_local": 19.03,
  "currency": "EUR",
  "used_fallback_rate": false,
  "calculation_timestamp": "2026-03-09T21:00:00.000Z"
}
```

### Error de validación

```json
HTTP 400 Bad Request
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "isbn", "message": "Invalid ISBN format. Must be ISBN-10 or ISBN-13" }
  ]
}
```

---

## Tests

```bash
# Todos los tests (unitarios + E2E)
npm test

# Solo tests unitarios
npm test -- --selectProjects unit

# Solo tests E2E
npm test -- --selectProjects e2e

# Con cobertura
npm run test:coverage
```

Los tests unitarios usan mocks manuales de `BookRepository` y `ExchangeRatePort`, sin dependencias de BD ni red. Los tests E2E usan Supertest + mocks de Prisma y Axios.

---

## Scripts disponibles

```bash
npm run dev          # Desarrollo con hot-reload (tsx watch)
npm run build        # Compilar TypeScript a dist/
npm run start        # Iniciar desde dist/ (producción)
npm run db:migrate   # Crear y aplicar migración
npm run db:deploy    # Aplicar migraciones en producción
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Poblar BD con datos de prueba
npm run db:reset     # Resetear BD (elimina todos los datos)
npm run docker:up    # Levantar API + PostgreSQL en Docker
npm run docker:down  # Detener contenedores
npm run docker:dev   # Levantar solo PostgreSQL en Docker
npm run lint         # Verificar estilo de código
npm run lint:fix     # Corregir errores de linting
npm run format       # Formatear con Prettier
```

---

## Modelo de datos

| Campo | Tipo | Restricción |
|---|---|---|
| `id` | Integer | Auto-generado, PK |
| `title` | String | Requerido |
| `author` | String | Requerido |
| `isbn` | String | Requerido, único, ISBN-10 o ISBN-13 |
| `cost_usd` | Decimal(10,2) | Requerido, > 0 |
| `selling_price_local` | Decimal(10,2) | Nullable, calculado con `calculate-price` |
| `stock_quantity` | Integer | Requerido, >= 0 |
| `category` | String | Requerido |
| `supplier_country` | Char(2) | Requerido, ISO 3166-1 alpha-2 |
| `created_at` | Timestamptz | Auto, no modificable por el cliente |
| `updated_at` | Timestamptz | Auto, actualizado en cada `update` |

---

## Colección Postman

Puedes explorar la API directamente en Postman sin necesidad de importar nada:

**[Ver documentación en Postman](https://documenter.getpostman.com/view/14681924/2sBXieqtYN)**

O si prefieres importarla localmente, el archivo `Bookstore-Inventory-API.postman_collection.json` está incluido en el repositorio. La colección incluye:

- Todos los endpoints con casos exitosos
- Casos de error (400, 404, 409)
- Variables de entorno configurables (`baseUrl`, `bookId`)
