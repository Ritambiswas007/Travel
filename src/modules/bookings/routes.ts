import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import {
  createBooking,
  createBookingValidators,
  getBooking,
  bookingIdValidators,
  listMyBookings,
  listBookingsValidators,
  listBookingsAdmin,
  updateStep,
  updateStepValidators,
  applyCoupon,
  applyCouponValidators,
  confirmBooking,
  cancelBooking,
} from './controller';

const router = Router();

router.use(authMiddleware);

router.post('/', createBookingValidators, createBooking);
router.get('/my', listBookingsValidators, listMyBookings);
router.get('/admin', staffOrAdmin, listBookingsValidators, listBookingsAdmin);
router.get('/:id', bookingIdValidators, getBooking);
router.patch('/:id/step', updateStepValidators, updateStep);
router.post('/:id/apply-coupon', applyCouponValidators, applyCoupon);
router.post('/:id/confirm', bookingIdValidators, confirmBooking);
router.post('/:id/cancel', bookingIdValidators, cancelBooking);

export const bookingsRoutes = router;
