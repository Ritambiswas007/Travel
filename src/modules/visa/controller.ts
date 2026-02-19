import { Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { visaService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createValidators = [
  body('country').trim().notEmpty(),
  body('type').trim().notEmpty(),
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
    const app = await visaService.create(req.user.id, req.body);
    res.status(201).json({ success: true, data: app });
  } catch (e) {
    next(e);
  }
}

export const applicationIdValidators = [param('id').isUUID()];

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
    const userId = req.user?.id;
    const app = await visaService.getById(req.params.id, userId);
    res.json({ success: true, data: app });
  } catch (e) {
    next(e);
  }
}

export async function listMine(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const list = await visaService.listByUser(req.user.id);
    res.json({ success: true, data: list });
  } catch (e) {
    next(e);
  }
}

export const updateValidators = [
  param('id').isUUID(),
  body('country').optional().trim().notEmpty(),
  body('type').optional().trim().notEmpty(),
  body('status').optional().trim(),
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
    const app = await visaService.update(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: app });
  } catch (e) {
    next(e);
  }
}

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
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const app = await visaService.submit(req.params.id, req.user.id);
    res.json({ success: true, data: app });
  } catch (e) {
    next(e);
  }
}

export const addDocumentValidators = [
  param('id').isUUID(),
  body('type').trim().notEmpty(),
  body('fileUrl').trim().notEmpty(),
  body('storagePath').optional().trim(),
];

export async function addDocument(
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
    const doc = await visaService.addDocument(req.params.id, req.user.id, req.body);
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    next(e);
  }
}
