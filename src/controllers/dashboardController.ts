import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class DashboardController {
  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await DashboardService.getSummary(req.user!._id);
      sendSuccess(res, 'Dashboard analytics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}
