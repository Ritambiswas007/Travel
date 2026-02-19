import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { couponsService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createValidators = [
  body('code').trim().notEmpty(),
  body('description').optional().trim(),
  body('discountType').isIn(['PERCENT', 'FIXED']),
  body('discountValue').isFloat({ min: 0 }),
  body('minOrderAmount').optional().isFloat({ min: 0 }),
  body('maxDiscount').optional().isFloat({ min: 0 }),
  body('usageLimit').optional().isInt({ min: 1 }).toInt(),
  body('validFrom').isISO8601(),
  body('validTo').isISO8601(),
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
    const coupon = await couponsService.create(req.body);
    res.status(201).json({ success: true, data: coupon });
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
    const result = await couponsService.list(req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const couponIdValidators = [param('id').isUUID()];

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
    const coupon = await couponsService.getById(req.params.id);
    res.json({ success: true, data: coupon });
  } catch (e) {
    next(e);
  }
}

export const updateValidators = [
  param('id').isUUID(),
  body('description').optional().trim(),
  body('discountType').optional().isIn(['PERCENT', 'FIXED']),
  body('discountValue').optional().isFloat({ min: 0 }),
  body('minOrderAmount').optional().isFloat({ min: 0 }),
  body('maxDiscount').optional().isFloat({ min: 0 }),
  body('usageLimit').optional().isInt({ min: 1 }).toInt(),
  body('validFrom').optional().isISO8601(),
  body('validTo').optional().isISO8601(),
  body('isActive').optional().isBoolean(),
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
    const coupon = await couponsService.update(req.params.id, req.body);
    res.json({ success: true, data: coupon });
  } catch (e) {
    next(e);
  }
}
