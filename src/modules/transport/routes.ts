import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import {
  addFlight,
  flightValidators,
  addTrain,
  trainValidators,
  addBus,
  busValidators,
} from './controller';

const router = Router();

router.use(authMiddleware);
router.use(staffOrAdmin);

router.post('/flight', flightValidators, addFlight);
router.post('/train', trainValidators, addTrain);
router.post('/bus', busValidators, addBus);

export const transportRoutes = router;
