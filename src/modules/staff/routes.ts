import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import {
  createStaff,
  createStaffValidators,
  listStaff,
  listStaffValidators,
  getStaff,
  staffIdValidators,
  updateStaff,
  updateStaffValidators,
} from './controller';

const router = Router();

router.use(authMiddleware);
router.use(staffOrAdmin);

router.post('/', createStaffValidators, createStaff);
router.get('/', listStaffValidators, listStaff);
router.get('/:id', staffIdValidators, getStaff);
router.patch('/:id', updateStaffValidators, updateStaff);

export const staffRoutes = router;
