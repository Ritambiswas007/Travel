import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import { cacheMiddleware } from '../../middlewares/cache.middleware';
import {
  create,
  createValidators,
  listActive,
  listActiveValidators,
  listAdmin,
  listAdminValidators,
  getById,
  bannerIdValidators,
  update,
  updateValidators,
  remove,
} from './controller';

const router = Router();

router.get('/', cacheMiddleware({ keyPrefix: 'banners', ttlSeconds: 180 }), listActiveValidators, listActive);

router.use(authMiddleware);
router.use(staffOrAdmin);

router.post('/', createValidators, create);
router.get('/admin', cacheMiddleware({ keyPrefix: 'banners:admin', ttlSeconds: 120 }), listAdminValidators, listAdmin);
router.get('/:id', cacheMiddleware({ keyPrefix: 'banners', ttlSeconds: 300 }), bannerIdValidators, getById);
router.patch('/:id', updateValidators, update);
router.delete('/:id', bannerIdValidators, remove);

export const bannersRoutes = router;
