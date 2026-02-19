import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { cacheMiddleware } from '../../middlewares/cache.middleware';
import {
  create,
  createValidators,
  list,
  listValidators,
  getById,
  reviewIdValidators,
  update,
  updateValidators,
} from './controller';

const router = Router();

router.get('/', cacheMiddleware({ keyPrefix: 'reviews', ttlSeconds: 300 }), listValidators, list);

router.use(authMiddleware);

router.post('/', createValidators, create);
router.get('/:id', cacheMiddleware({ keyPrefix: 'reviews', ttlSeconds: 300 }), reviewIdValidators, getById);
router.patch('/:id', updateValidators, update);

export const reviewsRoutes = router;
