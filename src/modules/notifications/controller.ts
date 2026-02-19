import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { notificationsService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const sendValidators = [
  body('userId').optional().isUUID(),
  body('title').trim().notEmpty(),
  body('body').optional().trim(),
  body('type').optional().trim(),
  body('channel').optional().isIn(['email', 'sms', 'push']),
  body('data').optional().isObject(),
];

export async function send(
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
    const notif = await notificationsService.send(req.body);
    res.status(201).json({ success: true, data: notif });
  } catch (e) {
    next(e);
  }
}

export const listValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('unreadOnly').optional().isBoolean().toBoolean(),
];

export async function listMine(
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
    const result = await notificationsService.listByUser(req.user.id, req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const markReadValidators = [
  param('id').isUUID(),
];

export async function markRead(
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
    await notificationsService.markRead(req.user.id, req.params.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (e) {
    next(e);
  }
}
