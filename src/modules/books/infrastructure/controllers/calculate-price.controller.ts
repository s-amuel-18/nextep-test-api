import type { Request, Response } from 'express';
import type { CalculatePriceService } from '../../application/services/calculate-price.service';
import { IdParamDtoType } from '../dtos/query-params.dto';

export class CalculatePriceController {
  constructor(private readonly calculatePriceService: CalculatePriceService) {}

  calculate = async (req: Request<IdParamDtoType>, res: Response) => {
    const id = req.params.id;

    const result = await this.calculatePriceService.execute(id);
    res.status(200).json(result);
  };
}
