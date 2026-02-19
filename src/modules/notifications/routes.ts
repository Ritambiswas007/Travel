import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import {
  send,
  sendValidators,
  listMine,
  listValidators,
  markRead,
  markReadValidators,
} from './controller';

const router = Router();

router.use(authMiddleware);

router.get('/', listValidators, listMine);
router.post('/mark-read/:id', markReadValidators, markRead);

router.post('/send', staffOrAdmin, sendValidators, send);

export const notificationsRoutes = router;
