import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import {
  create,
  createValidators,
  list,
  listValidators,
  getById,
  couponIdValidators,
  update,
  updateValidators,
} from './controller';

const router = Router();

router.use(authMiddleware);
router.use(staffOrAdmin);

router.post('/', createValidators, create);
router.get('/', listValidators, list);
router.get('/:id', couponIdValidators, getById);
router.patch('/:id', updateValidators, update);

export const couponsRoutes = router;
