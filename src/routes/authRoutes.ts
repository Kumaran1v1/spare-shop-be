import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middleware/validationMiddleware';
import { loginSchema } from '../validators/authValidator';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.me);

export default router;
