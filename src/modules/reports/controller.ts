import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { reportsService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createValidators = [
  body('name').trim().notEmpty(),
  body('type').trim().notEmpty(),
  body('params').optional().isObject(),
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
    const report = await reportsService.create(req.body);
    res.status(201).json({ success: true, data: report });
  } catch (e) {
    next(e);
  }
}

export const listValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('type').optional().trim(),
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
    const result = await reportsService.list(req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const reportIdValidators = [param('id').isUUID()];

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
    const report = await reportsService.getById(req.params.id);
    res.json({ success: true, data: report });
  } catch (e) {
    next(e);
  }
}

export const bookingsReportValidators = [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
];

export async function bookingsReport(
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
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;
    const result = await reportsService.getBookingsReport({ from, to });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export async function revenueReport(
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
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;
    const result = await reportsService.getRevenueReport({ from, to });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}
