import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import {
  createTicket,
  createTicketValidators,
  getTicket,
  ticketIdValidators,
  listMyTickets,
  listValidators,
  reply,
  replyValidators,
  closeTicket,
} from './controller';

const router = Router();

router.use(authMiddleware);

router.post('/', createTicketValidators, createTicket);
router.get('/', listValidators, listMyTickets);
router.get('/:id', ticketIdValidators, getTicket);
router.post('/:id/reply', replyValidators, reply);
router.post('/:id/close', ticketIdValidators, closeTicket);

export const supportRoutes = router;
