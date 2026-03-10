export const mockPrismaBook = {
  id: 1,
  title: 'El Quijote',
  author: 'Miguel de Cervantes',
  isbn: '9788437604947',
  costUsd: 15.99,
  sellingPriceLocal: null,
  stockQuantity: 25,
  category: 'Literatura Clásica',
  supplierCountry: 'ES',
  createdAt: new Date('2026-03-09T21:00:00.000Z'),
  updatedAt: new Date('2026-03-09T21:00:00.000Z'),
};

export const validCreateBody = {
  title: 'El Quijote',
  author: 'Miguel de Cervantes',
  isbn: '9788437604947',
  cost_usd: 15.99,
  stock_quantity: 25,
  category: 'Literatura Clásica',
  supplier_country: 'ES',
};
