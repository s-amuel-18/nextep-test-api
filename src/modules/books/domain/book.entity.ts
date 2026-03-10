export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  costUsd: number;
  sellingPriceLocal: number | null;
  stockQuantity: number;
  category: string;
  supplierCountry: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipo para crear un libro (sin campos auto-generados)
export type CreateBookInput = Omit<Book, 'id' | 'sellingPriceLocal' | 'createdAt' | 'updatedAt'>;

// Tipo para actualizar (todos los campos opcionales excepto id)
export type UpdateBookInput = Partial<CreateBookInput>;
