import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import { cacheMiddleware } from '../../middlewares/cache.middleware';
import {
  createPackage,
  createPackageValidators,
  listPackages,
  listPackagesValidators,
  getPackage,
  getPackageBySlug,
  packageIdValidators,
  slugValidators,
  updatePackage,
  updatePackageValidators,
  deletePackage,
  addVariant,
  variantValidators,
  addItinerary,
  itineraryValidators,
  addSchedule,
  scheduleValidators,
} from './controller';

const router = Router();

router.get('/', cacheMiddleware({ keyPrefix: 'packages', ttlSeconds: 300 }), listPackagesValidators, listPackages);
router.get('/slug/:slug', cacheMiddleware({ keyPrefix: 'packages', ttlSeconds: 300 }), slugValidators, getPackageBySlug);
router.get('/:id', cacheMiddleware({ keyPrefix: 'packages', ttlSeconds: 600 }), packageIdValidators, getPackage);

router.use(authMiddleware);
router.use(staffOrAdmin);

router.post('/', createPackageValidators, createPackage);
router.patch('/:id', updatePackageValidators, updatePackage);
router.delete('/:id', packageIdValidators, deletePackage);
router.post('/:id/variants', variantValidators, addVariant);
router.post('/:id/itineraries', itineraryValidators, addItinerary);
router.post('/:id/schedules', scheduleValidators, addSchedule);

export const packagesRoutes = router;
