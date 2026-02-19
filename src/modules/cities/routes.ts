import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import { cacheMiddleware } from '../../middlewares/cache.middleware';
import {
  create,
  createValidators,
  list,
  listValidators,
  getById,
  getBySlug,
  cityIdValidators,
  slugValidators,
  update,
  updateValidators,
  remove,
} from './controller';

const router = Router();

router.get('/', cacheMiddleware({ keyPrefix: 'cities', ttlSeconds: 300 }), listValidators, list);
router.get('/slug/:slug', cacheMiddleware({ keyPrefix: 'cities', ttlSeconds: 300 }), slugValidators, getBySlug);
router.get('/:id', cacheMiddleware({ keyPrefix: 'cities', ttlSeconds: 600 }), cityIdValidators, getById);

router.use(authMiddleware);
router.use(staffOrAdmin);

router.post('/', createValidators, create);
router.patch('/:id', updateValidators, update);
router.delete('/:id', cityIdValidators, remove);

export const citiesRoutes = router;
