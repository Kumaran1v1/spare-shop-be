import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { validateRequest } from '../middleware/validationMiddleware';
import { createUserSchema, updateUserSchema } from '../validators/userValidator';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// ADMIN and SHOP_OWNER users can access user management routes
router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'SHOP_OWNER'));

router.get('/', UserController.getAll);
router.post('/', validateRequest(createUserSchema), UserController.create);
router.put('/:id', validateRequest(updateUserSchema), UserController.update);
router.patch('/:id/status', UserController.toggleStatus);

export default router;
