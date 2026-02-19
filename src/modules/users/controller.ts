import { Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { usersService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const updateProfileValidators = [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().notEmpty(),
];

export async function getProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const profile = await usersService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (e) {
    next(e);
  }
}

export async function updateProfile(
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
    const profile = await usersService.updateProfile(req.user.id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    });
    res.json({ success: true, data: profile });
  } catch (e) {
    next(e);
  }
}

export const listUsersValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('role').optional().isIn(['ADMIN', 'STAFF', 'USER']),
  query('search').optional().trim(),
];

export async function listUsers(
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
    const result = await usersService.list({
      page: req.query.page as number | undefined,
      limit: req.query.limit as number | undefined,
      role: req.query.role as string | undefined,
      search: req.query.search as string | undefined,
    });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}
