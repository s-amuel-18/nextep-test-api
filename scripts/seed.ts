import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const books = [
  {
    title: 'El Quijote',
    author: 'Miguel de Cervantes',
    isbn: '9788437604947',
    costUsd: 15.99,
    stockQuantity: 25,
    category: 'Literatura Clásica',
    supplierCountry: 'ES',
  },
  {
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    isbn: '9780060883287',
    costUsd: 12.5,
    stockQuantity: 3,
    category: 'Literatura Latinoamericana',
    supplierCountry: 'CO',
  },
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    costUsd: 9.99,
    stockQuantity: 8,
    category: 'Distopía',
    supplierCountry: 'GB',
  },
  {
    title: 'El Principito',
    author: 'Antoine de Saint-Exupéry',
    isbn: '9782070612758',
    costUsd: 7.5,
    stockQuantity: 2,
    category: 'Literatura Infantil',
    supplierCountry: 'FR',
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '9780441013593',
    costUsd: 14.99,
    stockQuantity: 9,
    category: 'Ciencia Ficción',
    supplierCountry: 'US',
  },
];

async function main() {
  console.log('Seeding database...');

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: book,
    });
  }

  console.log(`Seeded ${books.length} books successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
