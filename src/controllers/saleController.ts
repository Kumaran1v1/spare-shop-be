import { Response, NextFunction } from 'express';
import { SaleService } from '../services/saleService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class SaleController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await SaleService.getAll({ search, status, page, limit }, req.user!._id);
      sendSuccess(res, 'Bills / Sales retrieved successfully', result.items, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sale = await SaleService.getById(req.params.id, req.user!._id);
      sendSuccess(res, 'Bill details retrieved', sale);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const sale = await SaleService.create(req.body, req.user!._id);
      sendSuccess(res, 'Bill created and stock updated successfully', sale, 201);
    } catch (error) {
      next(error);
    }
  }

  static async receivePayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, paymentMethod, referenceNumber, notes } = req.body;
      const result = await SaleService.receivePayment(
        req.params.id,
        amount,
        paymentMethod,
        referenceNumber,
        notes,
        req.user!._id
      );
      sendSuccess(res, 'Customer payment received successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
