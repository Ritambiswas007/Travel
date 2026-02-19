import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { staffOrAdmin } from '../../middlewares/role.middleware';
import {
  createLead,
  createLeadValidators,
  facebookWebhook,
  listLeads,
  listLeadsValidators,
  getLead,
  leadIdValidators,
  updateLead,
  updateLeadValidators,
  assignLead,
  assignValidators,
} from './controller';

const router = Router();

router.post('/webhook/facebook', facebookWebhook);

router.post('/', createLeadValidators, createLead);

router.use(authMiddleware);
router.use(staffOrAdmin);

router.get('/', listLeadsValidators, listLeads);
router.get('/:id', leadIdValidators, getLead);
router.patch('/:id', updateLeadValidators, updateLead);
router.post('/:id/assign', assignValidators, assignLead);

export const leadsRoutes = router;
