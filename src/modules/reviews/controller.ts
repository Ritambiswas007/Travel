import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { reviewsService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { cache } from '../../utils/cache';

export const createValidators = [
  body('packageId').optional().isUUID(),
  body('rating').isInt({ min: 1, max: 5 }).toInt(),
  body('title').optional().trim(),
  body('comment').optional().trim(),
];

export async function create(
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
    const review = await reviewsService.create(req.user.id, req.body);
    await cache.delByPrefix('reviews');
    res.status(201).json({ success: true, data: review });
  } catch (e) {
    next(e);
  }
}

export const listValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('packageId').optional().isUUID(),
  query('rating').optional().isInt({ min: 1, max: 5 }).toInt(),
];

export async function list(
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
    const result = await reviewsService.list(req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const reviewIdValidators = [param('id').isUUID()];

export async function getById(
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
    const review = await reviewsService.getById(req.params.id);
    res.json({ success: true, data: review });
  } catch (e) {
    next(e);
  }
}

export const updateValidators = [
  param('id').isUUID(),
  body('rating').optional().isInt({ min: 1, max: 5 }).toInt(),
  body('title').optional().trim(),
  body('comment').optional().trim(),
  body('isPublic').optional().isBoolean(),
];

export async function update(
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
    const review = await reviewsService.update(req.params.id, req.user.id, req.body);
    await cache.delByPrefix('reviews');
    res.json({ success: true, data: review });
  } catch (e) {
    next(e);
  }
}
