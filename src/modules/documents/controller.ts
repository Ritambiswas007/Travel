import { Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { documentsService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { cache } from '../../utils/cache';
import { uploadSingle } from '../../middlewares/upload.middleware';

export const createTypeValidators = [
  body('name').trim().notEmpty(),
  body('code').trim().notEmpty(),
  body('description').optional().trim(),
  body('validationRules').optional().isObject(),
  body('isRequired').optional().isBoolean(),
  body('expiresInDays').optional().isInt({ min: 1 }).toInt(),
];

export async function createType(
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
    const type = await documentsService.createType(req.body);
    await cache.delByPrefix('documents:types');
    res.status(201).json({ success: true, data: type });
  } catch (e) {
    next(e);
  }
}

export async function listTypes(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const types = await documentsService.listTypes();
    res.json({ success: true, data: types });
  } catch (e) {
    next(e);
  }
}

export const typeIdValidators = [param('id').isUUID()];

export async function getType(
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
    const type = await documentsService.getTypeById(req.params.id);
    res.json({ success: true, data: type });
  } catch (e) {
    next(e);
  }
}

export const uploadValidators = [
  body('documentTypeId').isUUID(),
];

// Middleware wrapper to handle multer errors
const handleUpload = (req: AuthRequest, res: Response, next: NextFunction) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

export async function upload(
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
    if (!req.file) {
      res.status(400).json({ success: false, message: 'File is required' });
      return;
    }
    const doc = await documentsService.upload(req.user.id, {
      documentTypeId: req.body.documentTypeId,
      file: req.file,
    });
    res.status(201).json({ success: true, data: doc });
  } catch (e) {
    next(e);
  }
}

// Export the upload handler middleware
export { handleUpload as uploadHandler };

export const documentIdValidators = [param('id').isUUID()];

export async function getDocument(
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
    const doc = await documentsService.getById(req.params.id, userId);
    res.json({ success: true, data: doc });
  } catch (e) {
    next(e);
  }
}

export async function listMyDocuments(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const docs = await documentsService.listByUser(req.user.id);
    res.json({ success: true, data: docs });
  } catch (e) {
    next(e);
  }
}

export const updateStatusValidators = [
  param('id').isUUID(),
  body('status').isIn(['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED']),
  body('rejectedReason').optional().trim(),
];

export async function updateStatus(
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
    const doc = await documentsService.updateStatus(req.params.id, req.body, req.user.id);
    res.json({ success: true, data: doc });
  } catch (e) {
    next(e);
  }
}

export async function downloadChecklist(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const pdf = await documentsService.generateChecklistPdf(req.user.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=checklist.pdf');
    res.send(pdf);
  } catch (e) {
    next(e);
  }
}
