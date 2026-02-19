import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { packagesService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { cache } from '../../utils/cache';

export const createPackageValidators = [
  body('name').trim().notEmpty(),
  body('slug').optional().trim(),
  body('description').optional().trim(),
  body('summary').optional().trim(),
  body('imageUrl').optional().isURL(),
  body('cityId').optional().isUUID(),
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
  body('metaTitle').optional().trim(),
  body('metaDesc').optional().trim(),
];

export async function createPackage(
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
    const pkg = await packagesService.create(req.body);
    await cache.delByPrefix('packages');
    res.status(201).json({ success: true, data: pkg });
  } catch (e) {
    next(e);
  }
}

export const listPackagesValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('cityId').optional().isUUID(),
  query('isActive').optional().isBoolean().toBoolean(),
  query('isFeatured').optional().isBoolean().toBoolean(),
  query('search').optional().trim(),
];

export async function listPackages(
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
    const result = await packagesService.list({
      page: req.query.page as number | undefined,
      limit: req.query.limit as number | undefined,
      cityId: req.query.cityId as string | undefined,
      isActive: req.query.isActive as boolean | undefined,
      isFeatured: req.query.isFeatured as boolean | undefined,
      search: req.query.search as string | undefined,
    });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const packageIdValidators = [param('id').isUUID()];

export async function getPackage(
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
    const pkg = await packagesService.getById(req.params.id);
    res.json({ success: true, data: pkg });
  } catch (e) {
    next(e);
  }
}

export const slugValidators = [param('slug').trim().notEmpty()];

export async function getPackageBySlug(
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
    const pkg = await packagesService.getBySlug(req.params.slug);
    res.json({ success: true, data: pkg });
  } catch (e) {
    next(e);
  }
}

export const updatePackageValidators = [
  param('id').isUUID(),
  body('name').optional().trim().notEmpty(),
  body('slug').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('summary').optional().trim(),
  body('imageUrl').optional().isURL(),
  body('cityId').optional().isUUID(),
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean(),
  body('metaTitle').optional().trim(),
  body('metaDesc').optional().trim(),
];

export async function updatePackage(
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
    const pkg = await packagesService.update(req.params.id, req.body);
    await cache.delByPrefix('packages');
    res.json({ success: true, data: pkg });
  } catch (e) {
    next(e);
  }
}

export async function deletePackage(
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
    await packagesService.delete(req.params.id);
    await cache.delByPrefix('packages');
    res.json({ success: true, message: 'Package deleted' });
  } catch (e) {
    next(e);
  }
}

export const variantValidators = [
  param('id').isUUID(),
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('basePrice').isFloat({ min: 0 }),
  body('currency').optional().trim(),
  body('durationDays').optional().isInt({ min: 1 }).toInt(),
  body('maxTravelers').optional().isInt({ min: 1 }).toInt(),
  body('isDefault').optional().isBoolean(),
];

export async function addVariant(
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
    const variant = await packagesService.addVariant(req.params.id, req.body);
    res.status(201).json({ success: true, data: variant });
  } catch (e) {
    next(e);
  }
}

export const itineraryValidators = [
  param('id').isUUID(),
  body('dayNumber').isInt({ min: 1 }).toInt(),
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('activities').optional().trim(),
];

export async function addItinerary(
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
    const itinerary = await packagesService.addItinerary(req.params.id, req.body);
    res.status(201).json({ success: true, data: itinerary });
  } catch (e) {
    next(e);
  }
}

export const scheduleValidators = [
  param('id').isUUID(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('availableSeats').optional().isInt({ min: 0 }).toInt(),
];

export async function addSchedule(
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
    const schedule = await packagesService.addSchedule(req.params.id, req.body);
    res.status(201).json({ success: true, data: schedule });
  } catch (e) {
    next(e);
  }
}
