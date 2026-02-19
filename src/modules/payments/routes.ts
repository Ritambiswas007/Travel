import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import {
  createOrder,
  createOrderValidators,
  getPayment,
  paymentIdValidators,
  getByBooking,
  bookingIdValidators,
  initiateRefund,
  refundValidators,
} from './controller';

const router = Router();

router.use(authMiddleware);

router.post('/orders', createOrderValidators, createOrder);
router.get('/booking/:bookingId', bookingIdValidators, getByBooking);
router.get('/:id', paymentIdValidators, getPayment);

router.post('/refunds', staffOrAdmin, refundValidators, initiateRefund);

export const paymentsRoutes = router;
