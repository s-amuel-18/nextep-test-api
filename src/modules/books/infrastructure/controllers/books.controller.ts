import type { Request, Response } from 'express';
import type { BooksService } from '../../application/services/books.service';
import type { CreateBookDtoType } from '../dtos/create-book.dto';
import type { UpdateBookDtoType } from '../dtos/update-book.dto';
import type {
  GetAllBooksQueryDtoType,
  IdParamDtoType,
  SearchBookQueryDtoType,
  LowStockQueryDtoType,
} from '../dtos/query-params.dto';

export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  getAll = async (req: Request<{}, {}, unknown, GetAllBooksQueryDtoType>, res: Response) => {
    const { page, limit } = req.query;
    const result = await this.booksService.getAll(page, limit);
    res.status(200).json(result);
  };

  getById = async (req: Request<IdParamDtoType, {}, unknown, {}>, res: Response) => {
    const { id } = req.params;
    const book = await this.booksService.getById(id);
    res.status(200).json(book);
  };

  create = async (req: Request<{}, {}, CreateBookDtoType, {}>, res: Response) => {
    const dto = req.body;
    const book = await this.booksService.create({
      title: dto.title,
      author: dto.author,
      isbn: dto.isbn,
      costUsd: dto.cost_usd,
      stockQuantity: dto.stock_quantity,
      category: dto.category,
      supplierCountry: dto.supplier_country,
    });
    res.status(201).json(book);
  };

  update = async (req: Request<IdParamDtoType, {}, UpdateBookDtoType, {}>, res: Response) => {
    const { id } = req.params;
    const dto = req.body;
    const book = await this.booksService.update(id, {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.author !== undefined && { author: dto.author }),
      ...(dto.isbn !== undefined && { isbn: dto.isbn }),
      ...(dto.cost_usd !== undefined && { costUsd: dto.cost_usd }),
      ...(dto.stock_quantity !== undefined && { stockQuantity: dto.stock_quantity }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.supplier_country !== undefined && { supplierCountry: dto.supplier_country }),
    });
    res.status(200).json(book);
  };

  delete = async (req: Request<IdParamDtoType, {}, unknown, {}>, res: Response) => {
    const { id } = req.params;
    await this.booksService.delete(id);
    res.status(204).send();
  };

  search = async (req: Request<{}, {}, unknown, SearchBookQueryDtoType>, res: Response) => {
    const { category } = req.query;
    const books = await this.booksService.getByCategory(category);
    res.status(200).json({ data: books, total: books.length });
  };

  lowStock = async (req: Request<{}, {}, unknown, LowStockQueryDtoType>, res: Response) => {
    const { threshold } = req.query;
    const books = await this.booksService.getLowStock(threshold);
    res.status(200).json({ data: books, total: books.length });
  };
}
