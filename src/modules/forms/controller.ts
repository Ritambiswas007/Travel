import { Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { formsService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createFormValidators = [
  body('name').trim().notEmpty(),
  body('code').trim().notEmpty(),
  body('description').optional().trim(),
];

export async function createForm(
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
    const form = await formsService.createForm(req.body);
    res.status(201).json({ success: true, data: form });
  } catch (e) {
    next(e);
  }
}

export const listFormsValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export async function listForms(
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
    const result = await formsService.listForms(page, limit);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const formIdValidators = [param('id').isUUID()];
export const codeValidators = [param('code').trim().notEmpty()];

export async function getFormById(
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
    const form = await formsService.getFormById(req.params.id);
    res.json({ success: true, data: form });
  } catch (e) {
    next(e);
  }
}

export async function getFormByCode(
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
    const form = await formsService.getFormByCode(req.params.code);
    res.json({ success: true, data: form });
  } catch (e) {
    next(e);
  }
}

export const addFieldValidators = [
  param('id').isUUID(),
  body('name').trim().notEmpty(),
  body('label').trim().notEmpty(),
  body('type').trim().notEmpty(),
  body('required').optional().isBoolean(),
  body('options').optional().isObject(),
  body('sortOrder').optional().isInt().toInt(),
];

export async function addField(
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
    const field = await formsService.addField(req.params.id, req.body);
    res.status(201).json({ success: true, data: field });
  } catch (e) {
    next(e);
  }
}

export const submitValidators = [
  param('id').isUUID(),
  body('data').isObject(),
];

export async function submit(
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
    const userId = req.user?.id ?? null;
    const submission = await formsService.submit(req.params.id, userId, req.body);
    res.status(201).json({ success: true, data: submission });
  } catch (e) {
    next(e);
  }
}
