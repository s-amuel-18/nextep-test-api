-- CreateTable
CREATE TABLE "books" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "author" VARCHAR(500) NOT NULL,
    "isbn" VARCHAR(20) NOT NULL,
    "cost_usd" DECIMAL(10,2) NOT NULL,
    "selling_price_local" DECIMAL(10,2),
    "stock_quantity" INTEGER NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "supplier_country" CHAR(2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");
