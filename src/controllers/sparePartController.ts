import { Response, NextFunction } from 'express';
import { SparePartService } from '../services/sparePartService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class SparePartController {
  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const brand = req.query.brand as string;
      const machineType = req.query.machineType as string;
      const status = req.query.status as string;

      const result = await SparePartService.getAll(
        { search, category, brand, machineType, status, page, limit },
        req.user!._id
      );

      sendSuccess(res, 'Spare parts retrieved successfully', result.items, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const spare = await SparePartService.getById(req.params.id, req.user!._id);
      sendSuccess(res, 'Spare part details retrieved', spare);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const spare = await SparePartService.create(req.body, req.user!._id);
      sendSuccess(res, 'Spare part created successfully', spare, 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const spare = await SparePartService.update(req.params.id, req.body, req.user!._id);
      sendSuccess(res, 'Spare part updated successfully', spare);
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const spare = await SparePartService.toggleStatus(req.params.id, req.user!._id);
      sendSuccess(res, `Spare part status changed to ${spare.isActive ? 'Active' : 'Inactive'}`, spare);
    } catch (error) {
      next(error);
    }
  }
}
