import { Router } from 'express';
import { SaleController } from '../controllers/saleController';
import { validateRequest } from '../middleware/validationMiddleware';
import { createSaleSchema } from '../validators/saleValidator';
import { recordPaymentSchema } from '../validators/paymentValidator';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', SaleController.getAll);
router.post('/', validateRequest(createSaleSchema), SaleController.create);
router.get('/:id', SaleController.getById);
router.post('/:id/payments', validateRequest(recordPaymentSchema), SaleController.receivePayment);

export default router;
