import { Router } from 'express';
import { PurchaseController } from '../controllers/purchaseController';
import { validateRequest } from '../middleware/validationMiddleware';
import { createPurchaseSchema } from '../validators/purchaseValidator';
import { recordPaymentSchema } from '../validators/paymentValidator';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', PurchaseController.getAll);
router.post('/', validateRequest(createPurchaseSchema), PurchaseController.create);
router.get('/:id', PurchaseController.getById);
router.post('/:id/payments', validateRequest(recordPaymentSchema), PurchaseController.payPending);

export default router;
