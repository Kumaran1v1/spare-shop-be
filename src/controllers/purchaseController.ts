import { Response, NextFunction } from 'express';
import { PurchaseService } from '../services/purchaseService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class PurchaseController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const result = await PurchaseService.getAll({ search, status, page, limit }, req.user!._id);
      sendSuccess(res, 'Purchases retrieved successfully', result.items, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchase = await PurchaseService.getById(req.params.id, req.user!._id);
      sendSuccess(res, 'Purchase record details retrieved', purchase);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const purchase = await PurchaseService.create(req.body, req.user!._id);
      sendSuccess(res, 'Purchase recorded and stock updated successfully', purchase, 201);
    } catch (error) {
      next(error);
    }
  }

  static async payPending(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, paymentMethod, referenceNumber, notes } = req.body;
      const result = await PurchaseService.payPending(
        req.params.id,
        amount,
        paymentMethod,
        referenceNumber,
        notes,
        req.user!._id
      );
      sendSuccess(res, 'Supplier payment recorded successfully', result);
    } catch (error) {
      next(error);
    }
  }
}
