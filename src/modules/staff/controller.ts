import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { staffService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createStaffValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('department').optional().trim(),
];

export async function createStaff(
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
    const staff = await staffService.create({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      department: req.body.department,
    });
    res.status(201).json({ success: true, data: staff });
  } catch (e) {
    next(e);
  }
}

export const listStaffValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('isActive').optional().isBoolean().toBoolean(),
  query('search').optional().trim(),
];

export async function listStaff(
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
    const result = await staffService.list({
      page: req.query.page as number | undefined,
      limit: req.query.limit as number | undefined,
      isActive: req.query.isActive as boolean | undefined,
      search: req.query.search as string | undefined,
    });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const staffIdValidators = [param('id').isUUID()];

export async function getStaff(
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
    const staff = await staffService.getById(req.params.id);
    res.json({ success: true, data: staff });
  } catch (e) {
    next(e);
  }
}

export const updateStaffValidators = [
  param('id').isUUID(),
  body('name').optional().trim().notEmpty(),
  body('department').optional().trim(),
  body('isActive').optional().isBoolean(),
];

export async function updateStaff(
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
    const staff = await staffService.update(req.params.id, {
      name: req.body.name,
      department: req.body.department,
      isActive: req.body.isActive,
    });
    res.json({ success: true, data: staff });
  } catch (e) {
    next(e);
  }
}
