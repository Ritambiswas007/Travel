import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { supportService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createTicketValidators = [
  body('subject').trim().notEmpty(),
  body('message').trim().notEmpty(),
  body('priority')
    .optional()
    .trim()
    .custom((value) => {
      // If no value provided, it's valid (optional field)
      if (!value || value === '') {
        return true;
      }
      // Check case-insensitively
      const upperValue = String(value).toUpperCase();
      const validValues = ['LOW', 'NORMAL', 'HIGH'];
      return validValues.includes(upperValue);
    })
    .withMessage('Priority must be one of: LOW, NORMAL, HIGH (case-insensitive)'),
];

export async function createTicket(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Normalize priority to uppercase BEFORE validation
    if (req.body.priority && typeof req.body.priority === 'string') {
      req.body.priority = req.body.priority.trim().toUpperCase();
    }
    
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      res.status(400).json({ success: false, errors: errs.array() });
      return;
    }
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const ticket = await supportService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (e) {
    next(e);
  }
}

export const ticketIdValidators = [param('id').isUUID()];

export async function getTicket(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      res.status(400).json({ success: false, errors: errs.array() });
      return;
    }
    const userId = req.user?.id;
    const ticket = await supportService.getById(req.params.id, userId);
    res.json({ success: true, data: ticket });
  } catch (e) {
    next(e);
  }
}

export const listValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export async function listMyTickets(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      res.status(400).json({ success: false, errors: errs.array() });
      return;
    }
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await supportService.listByUser(req.user.id, page, limit);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const replyValidators = [
  param('id').isUUID(),
  body('message').trim().notEmpty(),
  body('isStaff').optional().isBoolean(),
];

export async function reply(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      res.status(400).json({ success: false, errors: errs.array() });
      return;
    }
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const isStaff = req.user.role === 'STAFF' || req.user.role === 'ADMIN';
    const msg = await supportService.reply(req.params.id, req.user.id, req.body, isStaff);
    res.status(201).json({ success: true, data: msg });
  } catch (e) {
    next(e);
  }
}

export async function closeTicket(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      res.status(400).json({ success: false, errors: errs.array() });
      return;
    }
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const ticket = await supportService.close(req.params.id, req.user.id);
    res.json({ success: true, data: ticket });
  } catch (e) {
    next(e);
  }
}
