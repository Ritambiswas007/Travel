import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { bannersService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { cache } from '../../utils/cache';

export const createValidators = [
  body('title').trim().notEmpty(),
  body('imageUrl').trim().notEmpty(),
  body('linkUrl').optional().trim(),
  body('position').optional().trim(),
  body('sortOrder').optional().isInt().toInt(),
  body('startAt').optional().isISO8601(),
  body('endAt').optional().isISO8601(),
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
    const banner = await bannersService.create(req.body);
    await cache.delByPrefix('banners');
    res.status(201).json({ success: true, data: banner });
  } catch (e) {
    next(e);
  }
}

export const listActiveValidators = [query('position').optional().trim()];

export async function listActive(
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
    const banners = await bannersService.listActive(req.query.position as string);
    res.json({ success: true, data: banners });
  } catch (e) {
    next(e);
  }
}

export const listAdminValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export async function listAdmin(
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await bannersService.listAdmin(page, limit);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const bannerIdValidators = [param('id').isUUID()];

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
    const banner = await bannersService.getById(req.params.id);
    res.json({ success: true, data: banner });
  } catch (e) {
    next(e);
  }
}

export const updateValidators = [
  param('id').isUUID(),
  body('title').optional().trim().notEmpty(),
  body('imageUrl').optional().trim().notEmpty(),
  body('linkUrl').optional().trim(),
  body('position').optional().trim(),
  body('sortOrder').optional().isInt().toInt(),
  body('isActive').optional().isBoolean(),
  body('startAt').optional().isISO8601(),
  body('endAt').optional().isISO8601(),
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
    const banner = await bannersService.update(req.params.id, req.body);
    await cache.delByPrefix('banners');
    res.json({ success: true, data: banner });
  } catch (e) {
    next(e);
  }
}

export async function remove(
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
    await bannersService.delete(req.params.id);
    await cache.delByPrefix('banners');
    res.json({ success: true, message: 'Banner deleted' });
  } catch (e) {
    next(e);
  }
}
