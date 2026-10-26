import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  refreshSchema,
  selectRoleSchema,
  updateProfileSchema,
} from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/google', validate(googleAuthSchema), AuthController.googleAuth);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);

router.get('/me', authenticate, AuthController.me);
router.post('/role', authenticate, validate(selectRoleSchema), AuthController.setRole);
router.patch('/profile', authenticate, validate(updateProfileSchema), AuthController.updateProfile);

export const authRouter = router;
export default router;

