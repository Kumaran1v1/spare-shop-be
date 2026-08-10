import { Router } from 'express';
import { SparePartController } from '../controllers/sparePartController';
import { validateRequest } from '../middleware/validationMiddleware';
import { createSparePartSchema, updateSparePartSchema } from '../validators/sparePartValidator';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', SparePartController.getAll);
router.post('/', validateRequest(createSparePartSchema), SparePartController.create);
router.get('/:id', SparePartController.getById);
router.put('/:id', validateRequest(updateSparePartSchema), SparePartController.update);
router.patch('/:id/status', SparePartController.toggleStatus);

export default router;
