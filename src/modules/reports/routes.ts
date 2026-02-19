import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import {
  create,
  createValidators,
  list,
  listValidators,
  getById,
  reportIdValidators,
  bookingsReport,
  bookingsReportValidators,
  revenueReport,
} from './controller';

const router = Router();

router.use(authMiddleware);
router.use(staffOrAdmin);

router.post('/', createValidators, create);
router.get('/', listValidators, list);
router.get('/bookings', bookingsReportValidators, bookingsReport);
router.get('/revenue', bookingsReportValidators, revenueReport);
router.get('/:id', reportIdValidators, getById);

export const reportsRoutes = router;
