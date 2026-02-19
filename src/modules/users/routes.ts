import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { adminOnly } from '../../middlewares/role.middleware';
import {
  getProfile,
  updateProfile,
  updateProfileValidators,
  listUsers,
  listUsersValidators,
} from './controller';

const router = Router();

router.use(authMiddleware);

router.get('/me', getProfile);
router.patch('/me', updateProfileValidators, updateProfile);

router.get('/admin/users', adminOnly, listUsersValidators, listUsers);

export const usersRoutes = router;
