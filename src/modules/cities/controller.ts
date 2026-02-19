import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { citiesService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { cache } from '../../utils/cache';

export const createValidators = [
  body('name').trim().notEmpty(),
  body('slug').optional().trim(),
  body('country').optional().trim(),
  body('description').optional().trim(),
  body('imageUrl').optional().trim(),
  body('sortOrder').optional().isInt().toInt(),
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
    const city = await citiesService.create(req.body);
    await cache.delByPrefix('cities');
    res.status(201).json({ success: true, data: city });
  } catch (e) {
    next(e);
  }
}

export const listValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('isActive').optional().isBoolean().toBoolean(),
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
    const result = await citiesService.list(req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const cityIdValidators = [param('id').isUUID()];
export const slugValidators = [param('slug').trim().notEmpty()];

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
    const city = await citiesService.getById(req.params.id);
    res.json({ success: true, data: city });
  } catch (e) {
    next(e);
  }
}

export async function getBySlug(
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
    const city = await citiesService.getBySlug(req.params.slug);
    res.json({ success: true, data: city });
  } catch (e) {
    next(e);
  }
}

export const updateValidators = [
  param('id').isUUID(),
  body('name').optional().trim().notEmpty(),
  body('slug').optional().trim(),
  body('country').optional().trim(),
  body('description').optional().trim(),
  body('imageUrl').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('sortOrder').optional().isInt().toInt(),
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
    const city = await citiesService.update(req.params.id, req.body);
    await cache.delByPrefix('cities');
    res.json({ success: true, data: city });
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
    await citiesService.delete(req.params.id);
    await cache.delByPrefix('cities');
    res.json({ success: true, message: 'City deleted' });
  } catch (e) {
    next(e);
  }
}
