import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { leadsService } from './service';
import { config } from '../../config/env';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const createLeadValidators = [
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('name').optional().trim(),
  body('message').optional().trim(),
  body('sourceId').optional().isUUID(),
  body('metadata').optional().isObject(),
];

export async function createLead(
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
    const lead = await leadsService.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (e) {
    next(e);
  }
}

export async function facebookWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === config.facebook.verifyToken) {
      res.status(200).send(challenge);
      return;
    }
    if (mode && token) {
      res.status(403).send('Forbidden');
      return;
    }
    await leadsService.ingestFromFacebook(req.body);
    res.status(200).json({ success: true });
  } catch (e) {
    next(e);
  }
}

export const listLeadsValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']),
  query('sourceId').optional().isUUID(),
];

export async function listLeads(
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
    const result = await leadsService.list(req.query as Record<string, unknown>);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const leadIdValidators = [param('id').isUUID()];

export async function getLead(
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
    const lead = await leadsService.getById(req.params.id);
    res.json({ success: true, data: lead });
  } catch (e) {
    next(e);
  }
}

export const updateLeadValidators = [
  param('id').isUUID(),
  body('status').optional().isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']),
  body('score').optional().isInt({ min: 0 }).toInt(),
  body('convertedBookingId').optional().isUUID(),
];

export async function updateLead(
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
    const lead = await leadsService.update(req.params.id, req.body);
    res.json({ success: true, data: lead });
  } catch (e) {
    next(e);
  }
}

export const assignValidators = [
  param('id').isUUID(),
  body('staffId').isUUID(),
];

export async function assignLead(
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
    const lead = await leadsService.assign(req.params.id, { staffId: req.body.staffId });
    res.json({ success: true, data: lead });
  } catch (e) {
    next(e);
  }
}
