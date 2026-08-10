import { Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class PaymentController {
  static async getPendingPayments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string;
      const data = await PaymentService.getPendingPayments({ search }, req.user!._id);
      sendSuccess(res, 'Pending payments retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}
