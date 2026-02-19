import { Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { aiService } from './service';
import { AuthRequest } from '../../middlewares/auth.middleware';

export const recommendationValidators = [
  body('userId').optional().isUUID(),
  body('context').optional().trim(),
  body('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

export async function getRecommendations(
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
    const result = await aiService.getRecommendations({
      ...req.body,
      userId: req.body.userId ?? userId,
    });
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const faqValidators = [
  body('question').trim().notEmpty(),
  body('context').optional().trim(),
];

export async function answerFAQ(
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
    const result = await aiService.answerFAQ(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

export const bookingAssistantValidators = [
  body('query').trim().notEmpty(),
  body('bookingId').optional().isUUID(),
  body('context').optional().trim(),
];

export async function bookingAssistant(
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
    const result = await aiService.bookingAssistant(req.body);
    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}
